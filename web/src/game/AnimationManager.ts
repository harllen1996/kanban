/**
 * Sistema de Animações e Pathfinding
 * Sprint 2: Movimento fluido entre salas
 */

import PathfindingManager from './PathfindingManager';

// Tipos para o sistema de movimento
export interface Position {
  x: number;
  y: number;
}

// Status change type
export interface StatusChange {
  taskId: string;
  fromStatus: string;
  toStatus: string;
}

// Classe de gerenciamento de animações
export class AnimationManager {
  private scene: Phaser.Scene;
  private rooms: Map<string, { x: number; y: number; width: number; height: number }>;
  private pathfindingManager: PathfindingManager;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.rooms = new Map();
    this.pathfindingManager = new PathfindingManager();
  }

  // Registrar salas para pathfinding
  registerRoom(name: string, dimensions: { x: number; y: number; width: number; height: number }) {
    this.rooms.set(name, dimensions);
  }

  // Atualizar waypoints baseado nas salas
  updatePathfinding() {
    const rooms = {
      todo: this.rooms.get('todo') || { x: 0, y: 0, width: 200, height: 400 },
      inProgress: this.rooms.get('in-progress') || { x: 200, y: 0, width: 200, height: 400 },
      blocked: this.rooms.get('blocked') || { x: 400, y: 0, width: 200, height: 400 },
      done: this.rooms.get('done') || { x: 600, y: 0, width: 200, height: 400 },
    };

    this.pathfindingManager.updateWaypointsForRooms(rooms);
  }

  // Calcular caminho entre duas salas usando A*
  calculatePath(from: string, to: string): Position[] {
    // Normalizar nomes das salas
    const fromRoom = from === 'in-progress' ? 'in-progress' : from;
    const toRoom = to === 'in-progress' ? 'in-progress' : to;

    // Usar A* para encontrar caminho
    const path = this.pathfindingManager.findPathBetweenRooms(fromRoom, toRoom);

    return path.map((p) => ({ x: p.x, y: p.y }));
  }

  // Animar movimento entre posições com caminho suave
  animateMovement(
    gameObject: Phaser.GameObjects.Container,
    path: Position[],
    duration: number = 2000,
    onComplete?: () => void
  ) {
    if (path.length < 2) {
      onComplete?.();
      return;
    }

    // Criar tween sequencial com curva bezier
    const tweens: Phaser.Types.Tweens.TweenBuilderConfig[] = [];

    for (let i = 1; i < path.length; i++) {
      const from = path[i - 1];
      const to = path[i];
      const distance = Math.sqrt(Math.pow(to.x - from.x, 2) + Math.pow(to.y - from.y, 2));
      const segmentDuration = (distance / 800) * duration; // 800px/s

      tweens.push({
        targets: gameObject,
        x: to.x,
        y: to.y,
        duration: Math.max(300, segmentDuration),
        ease: 'Sine.easeInOut',
      });
    }

    // Executar tweens em sequência
    this.executeTweenSequence(gameObject, tweens, 0, onComplete);
  }

  // Executar tweens em sequência
  private executeTweenSequence(
    gameObject: Phaser.GameObjects.Container,
    tweens: Phaser.Types.Tweens.TweenBuilderConfig[],
    index: number,
    onComplete?: () => void
  ) {
    if (index >= tweens.length) {
      gameObject.setAlpha(1);
      onComplete?.();
      return;
    }

    // Adicionar efeito visual durante movimento
    if (index === 0) {
      this.addMovementEffect(gameObject);
    }

    this.scene.tweens.add({
      ...tweens[index],
      onComplete: () => {
        this.executeTweenSequence(gameObject, tweens, index + 1, onComplete);
      },
    });
  }

  // Efeito visual durante movimento
  private addMovementEffect(gameObject: Phaser.GameObjects.Container) {
    // Levantar levemente (simular "flutuando")
    this.scene.tweens.add({
      targets: gameObject,
      scaleX: 1.1,
      scaleY: 0.9,
      duration: 150,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Trail effect (sombra)
    const trail = this.scene.add.container(gameObject.x, gameObject.y);
    const trailCircle = this.scene.add.circle(0, 0, 15, 0x4d96ff, 0.3);
    trail.add(trailCircle);
    trail.setDepth(gameObject.depth - 1);

    // Animar trail
    this.scene.tweens.add({
      targets: trail,
      alpha: 0,
      scale: 0.5,
      duration: 300,
      repeat: -1,
      onRepeat: () => {
        trail.setPosition(gameObject.x, gameObject.y);
        trail.setAlpha(0.3);
        trail.setScale(1);
      },
    });

    // Parar efeito após movimento
    this.scene.time.delayedCall(2500, () => {
      this.scene.tweens.killTweensOf(gameObject);
      gameObject.setScale(1, 1);
      trail.destroy();
    });
  }

  // Animação idle mais elaborada
  addIdleAnimation(
    gameObject: Phaser.GameObjects.Container,
    type: 'normal' | 'working' | 'blocked' | 'celebrating' = 'normal'
  ) {
    const animations = {
      normal: { y: -3, duration: 1200 },
      working: { scaleX: 1.05, scaleY: 0.95, duration: 800 },
      blocked: { angle: 5, duration: 500 },
      celebrating: { scaleX: 1.2, scaleY: 1.2, duration: 300 },
    };

    const anim = animations[type];

    this.scene.tweens.add({
      targets: gameObject,
      ...anim,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  // Efeito de entrada (spawn)
  addSpawnEffect(gameObject: Phaser.GameObjects.Container) {
    gameObject.setScale(0);

    this.scene.tweens.add({
      targets: gameObject,
      scaleX: 1,
      scaleY: 1,
      duration: 500,
      ease: 'Back.easeOut',
    });

    // Partículas de spawn
    this.createSpawnParticles(gameObject.x, gameObject.y);
  }

  // Efeito de saída (despawn)
  addDespawnEffect(gameObject: Phaser.GameObjects.Container, onComplete?: () => void) {
    this.scene.tweens.add({
      targets: gameObject,
      scaleX: 0,
      scaleY: 0,
      alpha: 0,
      duration: 300,
      ease: 'Back.easeIn',
      onComplete: onComplete,
    });
  }

  // Partículas de spawn
  private createSpawnParticles(x: number, y: number) {
    const particles = this.scene.add.particles(x, y, '', {
      speed: { min: 50, max: 100 },
      scale: { start: 0.4, end: 0 },
      lifespan: 600,
      quantity: 10,
      blendMode: 'ADD',
    });

    // Destruir após animação
    this.scene.time.delayedCall(700, () => {
      particles.destroy();
    });
  }

  // Efeito de conclusão de tarefa (confetti)
  createCelebrationEffect(x: number, y: number) {
    // Criar partículas coloridas
    const colors = [0xff6b6b, 0xffd93d, 0x6bcb77, 0x4d96ff, 0xc77dff];

    for (let i = 0; i < 20; i++) {
      const particle = this.scene.add.circle(
        x + Phaser.Math.Between(-30, 30),
        y + Phaser.Math.Between(-30, 30),
        Phaser.Math.Between(3, 6),
        colors[Phaser.Math.Between(0, colors.length - 1)]
      );

      this.scene.tweens.add({
        targets: particle,
        y: particle.y - Phaser.Math.Between(50, 150),
        x: particle.x + Phaser.Math.Between(-50, 50),
        alpha: 0,
        scale: 0,
        duration: Phaser.Math.Between(500, 1000),
        ease: 'Power2',
        onComplete: () => particle.destroy(),
      });
    }
  }

  // Efeito de bloqueio
  createBlockedEffect(x: number, y: number) {
    // Criar ícone de alerta
    const alert = this.scene.add
      .text(x, y - 30, '⚠️', {
        fontSize: '20px',
      })
      .setOrigin(0.5);

    // Animação de piscar
    this.scene.tweens.add({
      targets: alert,
      alpha: 0,
      duration: 500,
      yoyo: true,
      repeat: 3,
      onComplete: () => alert.destroy(),
    });
  }
}

// Função para detectar mudanças de status
export function detectStatusChanges(
  oldTasks: Map<string, { status: string }>,
  newTasks: { id: string; status: string }[]
): { id: string; oldStatus: string; newStatus: string }[] {
  const changes: { id: string; oldStatus: string; newStatus: string }[] = [];

  for (const task of newTasks) {
    const oldTask = oldTasks.get(task.id);
    if (oldTask && oldTask.status !== task.status) {
      changes.push({
        id: task.id,
        oldStatus: oldTask.status,
        newStatus: task.status,
      });
    }
  }

  return changes;
}

export default AnimationManager;
