/**
 * Sistema de Animações e Pathfinding
 * Sprint 2: Movimento fluido entre salas
 */

// Tipos para o sistema de movimento
interface Position {
  x: number;
  y: number;
}

interface MovementPath {
  start: Position;
  end: Position;
  waypoints: Position[];
}

// Classe de gerenciamento de animações
export class AnimationManager {
  private scene: Phaser.Scene;
  private rooms: Map<string, { x: number; y: number; width: number; height: number }>;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.rooms = new Map();
  }

  // Registrar salas para pathfinding
  registerRoom(name: string, dimensions: { x: number; y: number; width: number; height: number }) {
    this.rooms.set(name, dimensions);
  }

  // Calcular caminho entre duas salas (simplificado)
  calculatePath(from: string, to: string): Position[] {
    const startRoom = this.rooms.get(from);
    const endRoom = this.rooms.get(to);

    if (!startRoom || !endRoom) return [];

    const start: Position = {
      x: startRoom.x + startRoom.width / 2,
      y: startRoom.y + startRoom.height / 2,
    };

    const end: Position = {
      x: endRoom.x + endRoom.width / 2,
      y: endRoom.y + endRoom.height / 2,
    };

    // Caminho simples (direto)
    // Para caminho mais complexo, usar A*
    return [start, end];
  }

  // Animar movimento entre posições
  animateMovement(
    gameObject: Phaser.GameObjects.Container,
    path: Position[],
    duration: number = 2000,
    onComplete?: () => void
  ) {
    if (path.length < 2) return;

    const tweens: Phaser.Types.Tweens.TweenBuilderConfig[] = [];

    for (let i = 1; i < path.length; i++) {
      tweens.push({
        targets: gameObject,
        x: path[i].x,
        y: path[i].y,
        duration: duration / (path.length - 1),
        ease: 'Sine.easeInOut',
      });
    }

    // Criar tween sequencial
    this.scene.tweens.timeline({
      tweens: tweens,
      onComplete: onComplete,
    });

    // Adicionar efeito de movimento
    this.addMovementEffect(gameObject);
  }

  // Efeito visual durante movimento
  private addMovementEffect(gameObject: Phaser.GameObjects.Container) {
    // Flicker suave
    this.scene.tweens.add({
      targets: gameObject,
      alpha: 0.8,
      duration: 100,
      yoyo: true,
      repeat: -1,
    });

    // Parar efeito após movimento
    this.scene.time.delayedCall(2500, () => {
      this.scene.tweens.killTweensOf(gameObject);
      gameObject.setAlpha(1);
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
