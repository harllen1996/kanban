/**
 * Visual Kanban Gather - Sistema de Escritório Virtual
 * Digital Twin gamificado da operação
 */

import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';

// ============================================
// TIPOS
// ============================================

export interface GatherTask {
  id: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'backlog' | 'todo' | 'doing' | 'review' | 'done';
  assigned_agent: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface GatherAgent {
  id: string;
  name: string;
  role: 'planner' | 'analyst' | 'developer' | 'qa' | 'ops';
  status: 'idle' | 'walking' | 'working' | 'meeting' | 'celebrating';
  current_task: string | null;
  position: { x: number; y: number };
}

export interface GatherGameProps {
  tasks: GatherTask[];
  agents: GatherAgent[];
  onTaskClick?: (taskId: string) => void;
  onTaskMove?: (taskId: string, newStatus: string) => void;
  onAgentClick?: (agentId: string) => void;
}

// ============================================
// CONFIGURAÇÕES
// ============================================

const ROOM_CONFIG = {
  backlog: { name: 'Planejamento', emoji: '📋', color: 0x636e72 },
  todo: { name: 'Tarefas', emoji: '📝', color: 0x74b9ff },
  doing: { name: 'Trabalho', emoji: '💻', color: 0x6c5ce7 },
  review: { name: 'Reunião', emoji: '👥', color: 0xfdcb6e },
  done: { name: 'Entrega', emoji: '🎉', color: 0x00b894 },
};

const AGENT_CONFIG = {
  planner: { name: 'Planner', emoji: '🧠', color: 0x0984e3 },
  analyst: { name: 'Analyst', emoji: '🔍', color: 0x00b894 },
  developer: { name: 'Developer', emoji: '👨‍💻', color: 0x6c5ce7 },
  qa: { name: 'QA', emoji: '✅', color: 0xfdcb6e },
  ops: { name: 'Ops', emoji: '🚀', color: 0xe17055 },
};

const STATUS_ANIMATIONS = {
  idle: { frameRange: [0, 3], speed: 800 },
  walking: { frameRange: [4, 7], speed: 200 },
  working: { frameRange: [8, 11], speed: 400 },
  meeting: { frameRange: [12, 15], speed: 600 },
  celebrating: { frameRange: [16, 19], speed: 300 },
};

// ============================================
// CENA PRINCIPAL
// ============================================

class GatherGameScene extends Phaser.Scene {
  private tasks: GatherTask[] = [];
  private agents: GatherAgent[] = [];
  private agentSprites: Map<string, Phaser.GameObjects.Container> = new Map();
  private taskCards: Map<string, Phaser.GameObjects.Container> = new Map();
  private rooms: Map<string, Phaser.Geom.Rectangle> = new Map();
  private graphics!: Phaser.GameObjects.Graphics;
  private onTaskMove?: (taskId: string, newStatus: string) => void;
  private onAgentClick?: (agentId: string) => void;
  private simulationRunning: boolean = false;

  constructor() {
    super({ key: 'GatherGameScene' });
  }

  init(data: {
    tasks: GatherTask[];
    agents: GatherAgent[];
    onTaskMove?: (taskId: string, newStatus: string) => void;
    onAgentClick?: (agentId: string) => void;
  }) {
    this.tasks = data.tasks || [];
    this.agents = data.agents || [];
    this.onTaskMove = data.onTaskMove;
    this.onAgentClick = data.onAgentClick;
  }

  create() {
    // Camadas
    this.graphics = this.add.graphics();

    // Desenhar escritório
    this.drawOffice();

    // Criar agentes
    this.createAgents();

    // Criar cards de tasks
    this.createTaskCards();

    // Iniciar simulação
    this.startSimulation();

    // Resize handler
    this.scale.on('resize', this.handleResize, this);

    // Keyboard shortcuts
    this.setupKeyboard();
  }

  private drawOffice() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const graphics = this.graphics;

    graphics.clear();

    // Fundo
    graphics.fillStyle(0x1a1a2e, 1);
    graphics.fillRect(0, 0, width, height);

    // Grid do piso
    graphics.lineStyle(1, 0x2d3436, 0.15);
    const gridSize = 32;
    for (let x = 0; x < width; x += gridSize) {
      graphics.beginPath();
      graphics.moveTo(x, 0);
      graphics.lineTo(x, height);
      graphics.strokePath();
    }
    for (let y = 0; y < height; y += gridSize) {
      graphics.beginPath();
      graphics.moveTo(0, y);
      graphics.lineTo(width, y);
      graphics.strokePath();
    }

    // Calcular dimensões das salas
    const padding = 10;
    const topMargin = 50;
    const bottomMargin = 10;
    const availableHeight = height - topMargin - bottomMargin;
    const roomWidth = (width - padding * 6) / 5;
    const roomHeight = availableHeight;

    // Definir salas
    const roomKeys = ['backlog', 'todo', 'doing', 'review', 'done'] as const;
    roomKeys.forEach((key, index) => {
      const x = padding + index * (roomWidth + padding);
      const y = topMargin;

      this.rooms.set(key, new Phaser.Geom.Rectangle(x, y, roomWidth, roomHeight));
      this.drawRoom(key, x, y, roomWidth, roomHeight);
    });

    // Título
    this.add
      .text(width / 2, 20, '🏢 Visual Kanban Gather - Digital Twin', {
        fontSize: '18px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      })
      .setOrigin(0.5)
      .setDepth(100);
  }

  private drawRoom(
    key: keyof typeof ROOM_CONFIG,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    const config = ROOM_CONFIG[key];
    const graphics = this.graphics;

    // Sombra
    graphics.fillStyle(0x000000, 0.3);
    graphics.fillRoundedRect(x + 4, y + 4, width, height, 12);

    // Background
    graphics.fillStyle(config.color, 0.2);
    graphics.fillRoundedRect(x, y, width, height, 12);

    // Borda
    graphics.lineStyle(2, config.color, 0.6);
    graphics.strokeRoundedRect(x, y, width, height, 12);

    // Emoji
    this.add.text(x + width / 2, y + 25, config.emoji, { fontSize: '24px' }).setOrigin(0.5);

    // Nome
    this.add
      .text(x + width / 2, y + 50, config.name.toUpperCase(), {
        fontSize: '11px',
        color: '#ffffff',
        fontFamily: 'Arial',
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    // Decorações específicas por sala
    this.drawRoomDecorations(key, x, y, width, height);
  }

  private drawRoomDecorations(key: string, x: number, y: number, width: number, height: number) {
    const graphics = this.graphics;

    switch (key) {
      case 'backlog':
        // Quadro de planejamento
        graphics.fillStyle(0x2d3436, 0.4);
        graphics.fillRect(x + 10, y + 70, width - 20, height - 100);
        break;

      case 'todo':
        // Lista de tarefas
        graphics.fillStyle(0x74b9ff, 0.2);
        for (let i = 0; i < 5; i++) {
          graphics.fillRoundedRect(x + 15, y + 80 + i * 45, width - 30, 35, 5);
        }
        break;

      case 'doing':
        // Estações de trabalho
        graphics.fillStyle(0x6c5ce7, 0.2);
        for (let i = 0; i < 3; i++) {
          graphics.fillRect(x + 15, y + 80 + i * 60, width - 30, 50);
          graphics.fillStyle(0x000000, 0.3);
          graphics.fillRect(x + 25, y + 90 + i * 60, width - 50, 30);
          graphics.fillStyle(0x6c5ce7, 0.2);
        }
        break;

      case 'review':
        // Mesa de reunião
        graphics.fillStyle(0xfdcb6e, 0.2);
        graphics.fillEllipse(x + width / 2, y + height / 2, width - 40, height - 100);
        break;

      case 'done':
        // Área de celebração
        graphics.fillStyle(0x00b894, 0.2);
        graphics.fillCircle(x + width / 2, y + height / 2, 50);
        // Estrelas
        for (let i = 0; i < 5; i++) {
          const angle = (i / 5) * Math.PI * 2;
          const px = x + width / 2 + Math.cos(angle) * 70;
          const py = y + height / 2 + Math.sin(angle) * 70;
          this.add.text(px, py, '⭐', { fontSize: '16px' }).setOrigin(0.5);
        }
        break;
    }
  }

  private createAgents() {
    this.agents.forEach((agent) => {
      const room = this.rooms.get('backlog');
      if (!room) return;

      const container = this.add.container(room.centerX, room.centerY + 50);

      // Sprite do agente
      const config = AGENT_CONFIG[agent.role];
      const emoji = this.add.text(0, 0, config.emoji, { fontSize: '28px' }).setOrigin(0.5);

      // Nome
      const name = this.add
        .text(0, 25, config.name, {
          fontSize: '10px',
          color: '#ffffff',
          backgroundColor: '#000000aa',
          padding: { x: 4, y: 2 },
        })
        .setOrigin(0.5);

      // Indicador de status
      const statusIndicator = this.add.circle(15, -15, 6, this.getStatusColor(agent.status));

      container.add([emoji, name, statusIndicator]);
      container.setData('agentId', agent.id);
      container.setSize(50, 60);
      container.setInteractive({ useHandCursor: true });

      // Animação idle inicial
      this.playAnimation(container, 'idle');

      // Click handler
      container.on('pointerdown', () => {
        this.onAgentClick?.(agent.id);
      });

      // Hover
      container.on('pointerover', () => {
        this.tweens.add({ targets: container, scale: 1.1, duration: 100 });
      });
      container.on('pointerout', () => {
        this.tweens.add({ targets: container, scale: 1, duration: 100 });
      });

      this.agentSprites.set(agent.id, container);
    });
  }

  private createTaskCards() {
    // Agrupar tasks por status
    const tasksByStatus = new Map<string, GatherTask[]>();
    this.tasks.forEach((task) => {
      const list = tasksByStatus.get(task.status) || [];
      list.push(task);
      tasksByStatus.set(task.status, list);
    });

    // Criar cards
    tasksByStatus.forEach((tasks, status) => {
      const room = this.rooms.get(status);
      if (!room) return;

      tasks.forEach((task, index) => {
        const card = this.createTaskCard(
          task,
          room.x + 15,
          room.y + 80 + index * 45,
          room.width - 30
        );
        this.taskCards.set(task.id, card);
      });
    });
  }

  private createTaskCard(
    task: GatherTask,
    x: number,
    y: number,
    width: number
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(this.getPriorityColor(task.priority), 0.8);
    bg.fillRoundedRect(0, 0, width, 40, 5);
    container.add(bg);

    // Título
    const title = this.add.text(10, 8, this.truncateText(task.title, 20), {
      fontSize: '11px',
      color: '#ffffff',
      fontFamily: 'Arial',
      fontStyle: 'bold',
    });
    container.add(title);

    // Agente atribuído
    if (task.assigned_agent) {
      const agent = this.agents.find((a) => a.id === task.assigned_agent);
      if (agent) {
        const agentConfig = AGENT_CONFIG[agent.role];
        const agentEmoji = this.add.text(width - 25, 10, agentConfig.emoji, { fontSize: '16px' });
        container.add(agentEmoji);
      }
    }

    container.setData('taskId', task.id);
    container.setSize(width, 40);
    container.setInteractive({ useHandCursor: true });

    // Drag & Drop
    this.setupDragDrop(container, task);

    return container;
  }

  private setupDragDrop(container: Phaser.GameObjects.Container, task: GatherTask) {
    let startRoom: string | null = null;

    container.on('pointerdown', () => {
      this.rooms.forEach((rect, key) => {
        if (rect.contains(container.x, container.y)) {
          startRoom = key;
        }
      });
    });

    container.on('drag', (pointer: Phaser.Input.Pointer) => {
      container.setPosition(pointer.x - container.width / 2, pointer.y - container.height / 2);
    });

    container.on('dragend', (pointer: Phaser.Input.Pointer) => {
      let targetRoom: string | null = null;

      this.rooms.forEach((rect, key) => {
        if (rect.contains(pointer.x, pointer.y)) {
          targetRoom = key;
        }
      });

      if (targetRoom && targetRoom !== startRoom) {
        this.onTaskMove?.(task.id, targetRoom);
      } else {
        // Animar volta para posição original
        const room = this.rooms.get(task.status);
        if (room) {
          this.tweens.add({
            targets: container,
            x: room.x + 15,
            y: room.y + 80,
            duration: 300,
            ease: 'Back.easeOut',
          });
        }
      }
    });
  }

  private startSimulation() {
    // Atualizar posições dos agentes baseado nas tasks
    this.time.addEvent({
      delay: 2000,
      callback: this.updateSimulation,
      callbackScope: this,
      loop: true,
    });
  }

  private updateSimulation() {
    this.agents.forEach((agent) => {
      const sprite = this.agentSprites.get(agent.id);
      if (!sprite) return;

      // Encontrar task do agente
      const task = this.tasks.find((t) => t.assigned_agent === agent.id);
      if (!task) {
        // Sem task = idle no backlog
        this.moveAgentToRoom(agent.id, 'backlog');
        this.setAgentStatus(agent.id, 'idle');
        return;
      }

      // Mover para sala da task
      this.moveAgentToRoom(agent.id, task.status);

      // Definir animação baseado no status
      switch (task.status) {
        case 'doing':
          this.setAgentStatus(agent.id, 'working');
          break;
        case 'review':
          this.setAgentStatus(agent.id, 'meeting');
          break;
        case 'done':
          this.setAgentStatus(agent.id, 'celebrating');
          break;
        default:
          this.setAgentStatus(agent.id, 'idle');
      }
    });
  }

  private moveAgentToRoom(agentId: string, roomKey: string) {
    const sprite = this.agentSprites.get(agentId);
    const room = this.rooms.get(roomKey);
    if (!sprite || !room) return;

    // Animar movimento
    this.tweens.add({
      targets: sprite,
      x: room.centerX + Phaser.Math.Between(-30, 30),
      y: room.centerY + Phaser.Math.Between(20, 60),
      duration: 1000,
      ease: 'Sine.easeInOut',
      onStart: () => this.setAgentStatus(agentId, 'walking'),
      onComplete: () => {
        const agent = this.agents.find((a) => a.id === agentId);
        if (agent) this.setAgentStatus(agentId, agent.status);
      },
    });
  }

  private setAgentStatus(agentId: string, status: GatherAgent['status']) {
    const sprite = this.agentSprites.get(agentId);
    if (!sprite) return;

    this.playAnimation(sprite, status);

    // Atualizar indicador de status
    const indicator = sprite.getAt(2) as Phaser.GameObjects.Arc;
    if (indicator) {
      indicator.setFillStyle(this.getStatusColor(status));
    }
  }

  private playAnimation(container: Phaser.GameObjects.Container, status: GatherAgent['status']) {
    const anim = STATUS_ANIMATIONS[status];
    if (!anim) return;

    // Animação simples de movimento
    switch (status) {
      case 'idle':
        this.tweens.add({
          targets: container,
          y: container.y - 2,
          duration: anim.speed,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
        break;

      case 'working':
        this.tweens.add({
          targets: container,
          scaleX: 1.05,
          scaleY: 0.95,
          duration: anim.speed,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
        break;

      case 'celebrating':
        this.tweens.add({
          targets: container,
          scale: 1.2,
          angle: 10,
          duration: anim.speed,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
        break;

      case 'meeting':
        this.tweens.add({
          targets: container,
          alpha: 0.7,
          duration: anim.speed,
          yoyo: true,
          repeat: -1,
        });
        break;
    }
  }

  private getStatusColor(status: GatherAgent['status']): number {
    const colors: Record<GatherAgent['status'], number> = {
      idle: 0x636e72,
      walking: 0x74b9ff,
      working: 0x6c5ce7,
      meeting: 0xfdcb6e,
      celebrating: 0x00b894,
    };
    return colors[status] || 0x636e72;
  }

  private getPriorityColor(priority: GatherTask['priority']): number {
    const colors: Record<GatherTask['priority'], number> = {
      critical: 0xd63031,
      high: 0xe17055,
      medium: 0xfdcb6e,
      low: 0x636e72,
    };
    return colors[priority] || 0x636e72;
  }

  private truncateText(text: string, maxLength: number): string {
    return text.length <= maxLength ? text : text.substring(0, maxLength) + '...';
  }

  private handleResize() {
    this.drawOffice();
    this.createTaskCards();
  }

  private setupKeyboard() {
    if (!this.input.keyboard) return;

    // R - Reset
    this.input.keyboard.on('keydown-R', () => {
      this.drawOffice();
    });

    // S - Toggle simulation
    this.input.keyboard.on('keydown-S', () => {
      this.simulationRunning = !this.simulationRunning;
    });
  }

  updateTasks(tasks: GatherTask[]) {
    this.tasks = tasks;
    // Recriar cards
    this.taskCards.forEach((card) => card.destroy());
    this.taskCards.clear();
    this.createTaskCards();
  }

  updateAgents(agents: GatherAgent[]) {
    this.agents = agents;
  }
}

// ============================================
// COMPONENTE REACT
// ============================================

export function GatherGame({
  tasks,
  agents,
  onTaskClick: _onTaskClick,
  onTaskMove: _onTaskMove,
  onAgentClick: _onAgentClick,
}: GatherGameProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<GatherGameScene | null>(null);
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
        scene: GatherGameScene,
      });

      gameRef.current = game;

      game.events.on('ready', () => {
        sceneRef.current = game.scene.getScene('GatherGameScene') as GatherGameScene;
        if (sceneRef.current) {
          sceneRef.current.updateTasks(tasks);
          sceneRef.current.updateAgents(agents);
        }
        setIsLoading(false);
      });

      const timeout = setTimeout(() => {
        sceneRef.current = game.scene.getScene('GatherGameScene') as GatherGameScene;
        setIsLoading(false);
      }, 2000);

      return () => {
        clearTimeout(timeout);
        if (gameRef.current) {
          gameRef.current.destroy(true);
          gameRef.current = null;
        }
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao iniciar jogo');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.updateTasks(tasks);
    }
  }, [tasks]);

  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.updateAgents(agents);
    }
  }, [agents]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-destructive/10 text-destructive p-4 rounded-lg">
        <p>❌ Erro: {error}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[600px] bg-card rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-card z-10">
          <div className="text-center">
            <div className="text-4xl mb-2 animate-bounce">🏢</div>
            <p className="text-muted-foreground">Carregando escritório virtual...</p>
          </div>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}

export default GatherGame;
