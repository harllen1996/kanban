/**
 * KanbanGame - Componente de gamificação do Veritas Kanban
 * Sprint 4: Pixel Art profissional
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import Phaser from 'phaser';
import AnimationManager, { detectStatusChanges } from './AnimationManager';
import InteractionManager, { detectRoomClick } from './InteractionManager';
import SpriteManager, { SpriteType } from './SpriteManager';

// Tipos
interface KanbanGameProps {
  tasks: TaskData[];
  onTaskClick?: (taskId: string) => void;
  onTaskMove?: (taskId: string, newStatus: string) => void;
}

export interface TaskData {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'blocked' | 'done';
  priority?: 'low' | 'medium' | 'high';
  type?: string;
}

// Dimensões das salas
interface RoomDimensions {
  todo: { x: number; y: number; width: number; height: number };
  inProgress: { x: number; y: number; width: number; height: number };
  blocked: { x: number; y: number; width: number; height: number };
  done: { x: number; y: number; width: number; height: number };
}

// Classe principal do jogo
class KanbanGameScene extends Phaser.Scene {
  private tasks: TaskData[] = [];
  private characters: Map<string, Phaser.GameObjects.Container> = new Map();
  private onTaskClick?: (taskId: string) => void;
  private onTaskMove?: (taskId: string, newStatus: string) => void;
  private rooms: RoomDimensions | null = null;
  private graphics!: Phaser.GameObjects.Graphics;
  private titleText!: Phaser.GameObjects.Text;
  private statsText!: Phaser.GameObjects.Text;
  private animationManager!: AnimationManager;
  private interactionManager!: InteractionManager;
  private spriteManager!: SpriteManager;
  private previousTasks: Map<string, { status: string }> = new Map();

  constructor() {
    super({ key: 'KanbanGameScene' });
  }

  init(data: { tasks: TaskData[]; onTaskClick?: (taskId: string) => void }) {
    this.tasks = data.tasks || [];
    this.onTaskClick = data.onTaskClick;
  }

  create() {
    this.graphics = this.add.graphics();

    // Inicializar gerenciadores
    this.animationManager = new AnimationManager(this);
    this.interactionManager = new InteractionManager(this, {
      enabled: true,
      dragDistance: 50,
      clickThreshold: 10,
      zoomLevel: 1,
      zoomSpeed: 0.1,
    });
    this.spriteManager = new SpriteManager(this);

    // Desenhar escritório inicial
    this.drawOffice();

    // Registrar salas no AnimationManager
    if (this.rooms) {
      this.animationManager.registerRoom('todo', this.rooms.todo);
      this.animationManager.registerRoom('in-progress', this.rooms.inProgress);
      this.animationManager.registerRoom('blocked', this.rooms.blocked);
      this.animationManager.registerRoom('done', this.rooms.done);
    }

    // Configurar handlers de interação
    this.setupInteractionHandlers();

    // Criar personagens
    this.createCharacters();

    // Título
    this.titleText = this.add
      .text(this.cameras.main.width / 2, 25, '🎮 Veritas Kanban - Escritório Virtual', {
        fontSize: '20px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Estatísticas
    this.statsText = this.add
      .text(10, 10, '', {
        fontSize: '12px',
        color: '#888888',
        fontFamily: 'Arial',
      })
      .setOrigin(0);

    this.updateStats();

    // Salvar estado inicial das tarefas
    this.tasks.forEach((task) => {
      this.previousTasks.set(task.id, { status: task.status });
    });

    // Resize handler
    this.scale.on('resize', this.handleResize, this);
  }

  private setupInteractionHandlers() {
    // Handler de clique em sala
    this.scene.events.on('task-click', (x: number, y: number) => {
      if (this.rooms) {
        const room = detectRoomClick(x, y, this.rooms);
        if (room) {
          console.log('Sala clicada:', room);
          // Aqui você pode adicionar lógica para mudar todas as tarefas da sala
        }
      }
    });
  }

  private handleResize() {
    this.drawOffice();
    this.createCharacters();
    this.titleText.setPosition(this.cameras.main.width / 2, 25);
    this.updateStats();
  }

  private drawOffice() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const graphics = this.graphics;

    graphics.clear();

    // Fundo gradiente
    const gradient = graphics.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 0x1a1a2e);
    gradient.addColorStop(1, 0x16213e);
    graphics.fillStyle(0x1a1a2e, 1);
    graphics.fillRect(0, 0, width, height);

    // Grid do piso
    graphics.lineStyle(1, 0x2d3436, 0.2);
    const gridSize = 40;
    for (let x = 0; x < width; x += gridSize) {
      graphics.beginPath();
      graphics.moveTo(x, 50);
      graphics.lineTo(x, height);
      graphics.strokePath();
    }
    for (let y = 50; y < height; y += gridSize) {
      graphics.beginPath();
      graphics.moveTo(0, y);
      graphics.lineTo(width, y);
      graphics.strokePath();
    }

    // Calcular dimensões das salas (responsivo)
    const padding = 15;
    const topMargin = 55;
    const bottomMargin = 15;
    const availableHeight = height - topMargin - bottomMargin;
    const roomWidth = (width - padding * 5) / 4;

    this.rooms = {
      todo: { x: padding, y: topMargin, width: roomWidth, height: availableHeight },
      inProgress: {
        x: padding * 2 + roomWidth,
        y: topMargin,
        width: roomWidth,
        height: availableHeight,
      },
      blocked: {
        x: padding * 3 + roomWidth * 2,
        y: topMargin,
        width: roomWidth,
        height: availableHeight,
      },
      done: {
        x: padding * 4 + roomWidth * 3,
        y: topMargin,
        width: roomWidth,
        height: availableHeight,
      },
    };

    // Desenhar cada sala
    this.drawRoom(this.rooms.todo, 'SALA DE ESPERA', 'A Fazer', 0x2d3436, 0x636e72, '🪑');
    this.drawRoom(
      this.rooms.inProgress,
      'ÁREA DE TRABALHO',
      'Em Progresso',
      0x0984e3,
      0x74b9ff,
      '💻'
    );
    this.drawRoom(this.rooms.blocked, 'ZONA BLOQUEADA', 'Bloqueado', 0xd63031, 0xff7675, '🚧');
    this.drawRoom(this.rooms.done, 'ÁREA DE SUCESSO', 'Concluído', 0x00b894, 0x55efc4, '🎉');
  }

  private drawRoom(
    dim: { x: number; y: number; width: number; height: number },
    title: string,
    subtitle: string,
    bgColor: number,
    borderColor: number,
    emoji: string
  ) {
    const graphics = this.graphics;

    // Sombra
    graphics.fillStyle(0x000000, 0.3);
    graphics.fillRoundedRect(dim.x + 4, dim.y + 4, dim.width, dim.height, 12);

    // Background
    graphics.fillStyle(bgColor, 0.85);
    graphics.fillRoundedRect(dim.x, dim.y, dim.width, dim.height, 12);

    // Borda
    graphics.lineStyle(2, borderColor, 0.9);
    graphics.strokeRoundedRect(dim.x, dim.y, dim.width, dim.height, 12);

    // Emoji
    this.add
      .text(dim.x + dim.width / 2, dim.y + 30, emoji, {
        fontSize: '28px',
      })
      .setOrigin(0.5)
      .setDepth(1);

    // Título
    this.add
      .text(dim.x + dim.width / 2, dim.y + 60, title, {
        fontSize: '11px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(1);

    // Subtítulo
    this.add
      .text(dim.x + dim.width / 2, dim.y + 75, subtitle, {
        fontSize: '10px',
        color: '#b2bec3',
        fontFamily: 'Arial',
      })
      .setOrigin(0.5)
      .setDepth(1);

    // Linha divisória
    graphics.lineStyle(1, borderColor, 0.3);
    graphics.beginPath();
    graphics.moveTo(dim.x + 10, dim.y + 95);
    graphics.lineTo(dim.x + dim.width - 10, dim.y + 95);
    graphics.strokePath();

    // Decorações específicas por sala
    this.drawRoomDecorations(dim, bgColor, borderColor);
  }

  private drawRoomDecorations(
    dim: { x: number; y: number; width: number; height: number },
    bgColor: number,
    borderColor: number
  ) {
    const graphics = this.graphics;

    // Sala de Espera: cadeiras
    graphics.fillStyle(borderColor, 0.2);
    for (let i = 0; i < 3; i++) {
      graphics.fillRoundedRect(dim.x + 15, dim.y + 110 + i * 50, dim.width - 30, 35, 5);
    }

    // Área de Trabalho: mesas
    graphics.fillStyle(0x636e72, 0.4);
    for (let i = 0; i < 3; i++) {
      graphics.fillRect(dim.x + 15, dim.y + 110 + i * 50, dim.width - 30, 35);
      // Monitor
      graphics.fillStyle(0x74b9ff, 0.3);
      graphics.fillRect(dim.x + 25, dim.y + 115 + i * 50, dim.width - 50, 20);
      graphics.fillStyle(0x636e72, 0.4);
    }

    // Zona Bloqueada: obstáculos
    graphics.fillStyle(0xff7675, 0.3);
    graphics.fillRect(dim.x + 20, dim.y + 120, 40, 60);
    graphics.fillRect(dim.x + dim.width - 60, dim.y + 200, 50, 50);
    // Cones
    this.add.text(dim.x + 25, dim.y + 125, '🚧', { fontSize: '20px' }).setDepth(1);
    this.add.text(dim.x + dim.width - 55, dim.y + 205, '⚠️', { fontSize: '20px' }).setDepth(1);

    // Área de Sucesso: estrelas/confetes
    graphics.fillStyle(0x55efc4, 0.2);
    for (let i = 0; i < 5; i++) {
      graphics.fillCircle(dim.x + 20 + i * ((dim.width - 40) / 4), dim.y + dim.height - 50, 12);
    }
  }

  private createCharacters() {
    // Limpar personagens existentes
    this.characters.forEach((char) => char.destroy());
    this.characters.clear();

    if (!this.rooms) return;

    const countByStatus = { todo: 0, 'in-progress': 0, blocked: 0, done: 0 };

    this.tasks.forEach((task) => {
      const status = task.status as keyof typeof countByStatus;
      const index = countByStatus[status];
      countByStatus[status]++;

      const pos = this.getTaskPosition(task, index);
      const container = this.add.container(pos.x, pos.y);

      // Sprite pixel art baseado no status
      const spriteType = this.getTaskSpriteType(task);
      const sprite = this.spriteManager.generatePixelSprite(spriteType);

      // Nome da tarefa
      const name = this.add
        .text(0, 35, this.truncateText(task.title, 10), {
          fontSize: '9px',
          color: '#ffffff',
          backgroundColor: '#00000099',
          padding: { x: 3, y: 1 },
        })
        .setOrigin(0.5);

      // Indicador de prioridade
      const priorityColor =
        task.priority === 'high' ? '#ff6b6b' : task.priority === 'medium' ? '#ffd93d' : '#6bcb77';
      const priority = this.add.circle(
        -15,
        -15,
        5,
        Phaser.Display.Color.HexStringToColor(priorityColor).color
      );

      container.add([emoji, name, priority]);
      container.setSize(40, 50);
      container.setInteractive({ useHandCursor: true });

      // Animação idle
      this.tweens.add({
        targets: container,
        y: pos.y - 3,
        duration: 1000 + Math.random() * 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      // Hover effect
      container.on('pointerover', () => {
        this.tweens.add({
          targets: container,
          scaleX: 1.2,
          scaleY: 1.2,
          duration: 100,
        });
      });

      container.on('pointerout', () => {
        this.tweens.add({
          targets: container,
          scaleX: 1,
          scaleY: 1,
          duration: 100,
        });
      });

      // Click handler
      container.on('pointerdown', () => {
        if (this.onTaskClick) {
          this.onTaskClick(task.id);
        }
        // Efeito de clique
        this.tweens.add({
          targets: container,
          scaleX: 0.9,
          scaleY: 0.9,
          duration: 50,
          yoyo: true,
        });
      });

      // Drag & Drop handler usando InteractionManager
      this.interactionManager.registerCharacter(
        task.id,
        container,
        (x, y) => {
          console.log('Drag start:', task.id, x, y);
          // Efeito visual de drag
          this.tweens.add({
            targets: container,
            alpha: 0.7,
            duration: 50,
          });
        },
        (x, y) => {
          // Mover durante drag
          container.setPosition(x, y);

          // Detecção de mudança de sala
          if (this.rooms) {
            const room = detectRoomClick(x, y, this.rooms);
            if (room) {
              const statusMap: Record<string, 'todo' | 'in-progress' | 'blocked' | 'done'> = {
                todo: 'todo',
                inProgress: 'in-progress',
                blocked: 'blocked',
                done: 'done',
              };

              const newStatus = statusMap[room];
              if (newStatus && newStatus !== task.status) {
                console.log('Mudou de status:', task.id, task.status, '->', newStatus);
                if (this.onTaskMove) {
                  this.onTaskMove(task.id, newStatus);
                }
              }
            }
          }
        },
        () => {
          console.log('Drag end:', task.id);
          // Efeito de drop
          this.tweens.add({
            targets: container,
            alpha: 1,
            duration: 100,
          });

          // Animar volta para posição correta
          const targetPos = this.getTaskPosition(task, index);
          this.tweens.add({
            targets: container,
            x: targetPos.x,
            y: targetPos.y,
            duration: 500,
            ease: 'Bounce.easeOut',
          });
        }
      );

      this.characters.set(task.id, container);
    });
  }

  private getTaskPosition(task: TaskData, index: number): { x: number; y: number } {
    if (!this.rooms) return { x: 100, y: 200 };

    const roomMap: Record<string, keyof typeof this.rooms> = {
      todo: 'todo',
      'in-progress': 'inProgress',
      blocked: 'blocked',
      done: 'done',
    };

    const room = this.rooms[roomMap[task.status]] || this.rooms.todo;
    const cols = Math.floor(room.width / 50);
    const col = index % cols;
    const row = Math.floor(index / cols);

    return {
      x: room.x + 35 + col * 50,
      y: room.y + 120 + row * 55,
    };
  }

  private getTaskEmoji(task: TaskData): string {
    const typeEmojis: Record<string, string> = {
      code: '👨‍💻',
      design: '🎨',
      research: '🔍',
      bug: '🐛',
      doc: '📄',
      default: '🧑‍💼',
    };
    return typeEmojis[task.type || 'default'] || typeEmojis.default;
  }

  private truncateText(text: string, maxLength: number): string {
    return text.length <= maxLength ? text : text.substring(0, maxLength) + '...';
  }

  private updateStats() {
    const counts = {
      todo: this.tasks.filter((t) => t.status === 'todo').length,
      inProgress: this.tasks.filter((t) => t.status === 'in-progress').length,
      blocked: this.tasks.filter((t) => t.status === 'blocked').length,
      done: this.tasks.filter((t) => t.status === 'done').length,
    };
    this.statsText.setText(
      `📊 ${this.tasks.length} tarefas | 🪑 ${counts.todo} | 💻 ${counts.inProgress} | 🚧 ${counts.blocked} | 🎉 ${counts.done}`
    );
  }

  updateTasks(tasks: TaskData[]) {
    // Detectar mudanças de status
    const changes = detectStatusChanges(this.previousTasks, tasks);

    // Animar personagens que mudaram de status
    changes.forEach((change) => {
      const character = this.characters.get(change.id);
      if (character && this.animationManager) {
        // Calcular caminho
        const path = this.animationManager.calculatePath(change.oldStatus, change.newStatus);

        // Animar movimento
        this.animationManager.animateMovement(character, path, 1500, () => {
          // Efeito de chegada
          if (change.newStatus === 'done') {
            this.animationManager.createCelebrationEffect(character.x, character.y);
          } else if (change.newStatus === 'blocked') {
            this.animationManager.createBlockedEffect(character.x, character.y);
          }
        });
      }
    });

    // Atualizar estado
    this.tasks = tasks;

    // Atualizar mapa de estados anteriores
    tasks.forEach((task) => {
      this.previousTasks.set(task.id, { status: task.status });
    });

    // Recriar personagens após animação
    this.time.delayedCall(1600, () => {
      this.createCharacters();
      this.updateStats();
    });
  }
}

// Componente React
export function KanbanGame({ tasks, onTaskClick, onTaskMove }: KanbanGameProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<KanbanGameScene | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    try {
      const game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: containerRef.current,
        backgroundColor: '#1a1a2e',
        scale: {
          mode: Phaser.Scale.RESIZE,
          autoCenter: Phaser.Scale.CENTER_BOTH,
          width: '100%',
          height: '100%',
        },
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { x: 0, y: 0 },
            debug: false,
          },
        },
        scene: KanbanGameScene,
      });

      gameRef.current = game;

      game.events.once('ready', () => {
        sceneRef.current = game.scene.getScene('KanbanGameScene') as KanbanGameScene;
        setIsLoading(false);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao iniciar jogo');
      setIsLoading(false);
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (sceneRef.current && tasks.length > 0) {
      sceneRef.current.updateTasks(tasks);
    }
  }, [tasks]);

  useEffect(() => {
    if (sceneRef.current && onTaskClick) {
      sceneRef.current['onTaskClick'] = onTaskClick;
    }
  }, [onTaskClick]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-destructive/10 text-destructive p-4 rounded-lg">
        <p>❌ Erro ao carregar jogo: {error}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[500px] bg-card rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-card z-10">
          <div className="text-center">
            <div className="text-4xl mb-2 animate-bounce">🎮</div>
            <p className="text-muted-foreground">Carregando jogo...</p>
          </div>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}

export default KanbanGame;
