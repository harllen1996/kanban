/**
 * Gather Office - Escritório Virtual estilo Gather/Habbo
 * Mapa 2D pixel art com visão isométrica
 */

import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';

// ============================================
// TIPOS
// ============================================

export interface OfficeTask {
  id: string;
  title: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'backlog' | 'todo' | 'doing' | 'review' | 'done';
  assigned_agent: string | null;
}

export interface OfficeAgent {
  id: string;
  name: string;
  role: 'planner' | 'analyst' | 'developer' | 'qa' | 'ops';
  status: 'idle' | 'walking' | 'working' | 'meeting' | 'celebrating';
  current_task: string | null;
  position: { x: number; y: number };
}

// ============================================
// CONFIGURAÇÕES
// ============================================

const TILE_SIZE = 48;
const MAP_WIDTH = 25;
const MAP_HEIGHT = 15;

// Cores do escritório
const COLORS = {
  floor: 0x3d3d3d,
  floorLight: 0x4a4a4a,
  wall: 0x2d2d2d,
  wallTop: 0x3a3a3a,
  desk: 0x8b7355,
  deskTop: 0xa08060,
  chair: 0x4a4a4a,
  plant: 0x228b22,
  screen: 0x1a1a2e,
  screenGlow: 0x4d96ff,
  whiteboard: 0xf5f5dc,
  door: 0x8b4513,
  window: 0x87ceeb,
  carpet: 0x4a5568,
};

// Layout do escritório
const OFFICE_LAYOUT = [
  // 0=backlog, 1=todo, 2=doing, 3=review, 4=done, 5=wall, 6=floor, 7=desk, 8=plant, 9=door, 10=window, 11=whiteboard, 12=carpet
  [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
  [5, 6, 6, 6, 6, 6, 5, 6, 6, 6, 6, 5, 6, 6, 6, 6, 5, 6, 6, 6, 6, 5, 6, 6, 5],
  [5, 6, 11, 11, 6, 6, 5, 6, 7, 6, 6, 5, 6, 7, 7, 6, 5, 6, 6, 6, 6, 5, 6, 6, 5],
  [5, 6, 6, 6, 6, 6, 5, 6, 6, 6, 6, 5, 6, 6, 6, 6, 5, 6, 12, 12, 6, 5, 6, 6, 5],
  [5, 6, 6, 6, 6, 6, 5, 6, 6, 6, 6, 5, 6, 6, 6, 6, 5, 6, 12, 12, 6, 5, 6, 6, 5],
  [5, 10, 6, 6, 6, 10, 5, 6, 6, 6, 6, 5, 6, 6, 6, 6, 5, 6, 6, 6, 6, 5, 6, 6, 5],
  [5, 6, 6, 6, 6, 6, 5, 6, 6, 6, 6, 5, 6, 6, 6, 6, 5, 6, 6, 6, 6, 5, 6, 6, 5],
  [5, 6, 7, 6, 6, 6, 9, 6, 6, 7, 6, 9, 6, 6, 7, 6, 9, 6, 6, 7, 6, 9, 6, 6, 5],
  [5, 6, 6, 6, 6, 6, 5, 6, 6, 6, 6, 5, 6, 6, 6, 6, 5, 6, 6, 6, 6, 5, 6, 6, 5],
  [5, 6, 6, 6, 6, 6, 5, 6, 6, 6, 6, 5, 6, 6, 6, 6, 5, 6, 6, 6, 6, 5, 6, 6, 5],
  [5, 6, 6, 6, 6, 6, 5, 6, 6, 6, 6, 5, 6, 6, 6, 6, 5, 6, 6, 6, 6, 5, 6, 6, 5],
  [5, 6, 8, 6, 6, 6, 5, 6, 8, 6, 6, 5, 6, 8, 6, 6, 5, 6, 8, 6, 6, 5, 6, 6, 5],
  [5, 6, 6, 6, 6, 6, 5, 6, 6, 6, 6, 5, 6, 6, 6, 6, 5, 6, 6, 6, 6, 5, 6, 6, 5],
  [5, 6, 6, 6, 6, 6, 5, 6, 6, 6, 6, 5, 6, 6, 6, 6, 5, 6, 6, 6, 6, 5, 6, 6, 5],
  [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
];

// Posições das salas
const ROOM_POSITIONS: Record<string, { x: number; y: number; name: string; color: number }> = {
  backlog: { x: 2, y: 2, name: '📋 Planejamento', color: 0x636e72 },
  todo: { x: 8, y: 2, name: '📝 Tarefas', color: 0x74b9ff },
  doing: { x: 14, y: 2, name: '💻 Trabalho', color: 0x6c5ce7 },
  review: { x: 20, y: 2, name: '👥 Reunião', color: 0xfdcb6e },
  done: { x: 2, y: 10, name: '🎉 Entrega', color: 0x00b894 },
};

// ============================================
// CENA PRINCIPAL
// ============================================

class GatherOfficeScene extends Phaser.Scene {
  private agents: OfficeAgent[] = [];
  private tasks: OfficeTask[] = [];
  private agentSprites: Map<string, Phaser.GameObjects.Container> = new Map();
  private taskMarkers: Map<string, Phaser.GameObjects.Container> = new Map();
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super({ key: 'GatherOfficeScene' });
  }

  init(data: { tasks: OfficeTask[]; agents: OfficeAgent[] }) {
    this.tasks = data.tasks || [];
    this.agents = data.agents || [];
  }

  create() {
    // Desenhar escritório
    this.drawOffice();

    // Criar agentes
    this.createAgents();

    // Criar markers de tasks
    this.createTaskMarkers();

    // Setup controles
    this.setupControls();

    // Iniciar simulação
    this.startSimulation();

    // UI
    this.createUI();
  }

  private drawOffice() {
    const graphics = this.add.graphics();

    // Desenhar piso
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const tile = OFFICE_LAYOUT[y][x];
        const px = x * TILE_SIZE;
        const py = y * TILE_SIZE;

        // Piso base
        graphics.fillStyle(COLORS.floor, 1);
        graphics.fillRect(px, py, TILE_SIZE, TILE_SIZE);

        // Variação do piso
        if ((x + y) % 2 === 0) {
          graphics.fillStyle(COLORS.floorLight, 0.3);
          graphics.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        }

        // Desenhar elementos
        this.drawTile(graphics, tile, px, py, x, y);
      }
    }

    // Labels das salas
    Object.entries(ROOM_POSITIONS).forEach(([_key, room]) => {
      this.add
        .text(room.x * TILE_SIZE + TILE_SIZE, room.y * TILE_SIZE - 15, room.name, {
          fontSize: '11px',
          color: '#ffffff',
          backgroundColor: `#${room.color.toString(16).padStart(6, '0')}`,
          padding: { x: 6, y: 3 },
        })
        .setOrigin(0.5);
    });
  }

  private drawTile(
    graphics: Phaser.GameObjects.Graphics,
    tile: number,
    px: number,
    py: number,
    _x: number,
    _y: number
  ) {
    switch (tile) {
      case 5: // Parede
        graphics.fillStyle(COLORS.wall, 1);
        graphics.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        graphics.fillStyle(COLORS.wallTop, 1);
        graphics.fillRect(px, py, TILE_SIZE, 8);
        break;

      case 7: // Mesa
        // Sombra
        graphics.fillStyle(0x000000, 0.3);
        graphics.fillRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
        // Mesa
        graphics.fillStyle(COLORS.desk, 1);
        graphics.fillRect(px + 2, py + 2, TILE_SIZE - 4, TILE_SIZE - 4);
        graphics.fillStyle(COLORS.deskTop, 1);
        graphics.fillRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 12);
        // Monitor
        graphics.fillStyle(COLORS.screen, 1);
        graphics.fillRect(px + 12, py + 6, TILE_SIZE - 24, 16);
        graphics.fillStyle(COLORS.screenGlow, 0.5);
        graphics.fillRect(px + 14, py + 8, TILE_SIZE - 28, 12);
        break;

      case 8: // Planta
        // Vaso
        graphics.fillStyle(0x8b4513, 1);
        graphics.fillRect(px + 18, py + 30, 12, 14);
        // Folhas
        graphics.fillStyle(COLORS.plant, 1);
        graphics.fillCircle(px + 24, py + 22, 10);
        graphics.fillCircle(px + 20, py + 16, 6);
        graphics.fillCircle(px + 28, py + 18, 7);
        break;

      case 9: // Porta
        graphics.fillStyle(COLORS.floor, 1);
        graphics.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        graphics.fillStyle(COLORS.door, 1);
        graphics.fillRect(px + 16, py, 16, TILE_SIZE);
        // Maçaneta
        graphics.fillStyle(0xffd700, 1);
        graphics.fillCircle(px + 20, py + TILE_SIZE / 2, 3);
        break;

      case 10: // Janela
        graphics.fillStyle(COLORS.wall, 1);
        graphics.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        graphics.fillStyle(COLORS.window, 1);
        graphics.fillRect(px + 4, py + 8, TILE_SIZE - 8, TILE_SIZE - 16);
        // Grade
        graphics.fillStyle(COLORS.wall, 1);
        graphics.fillRect(px + TILE_SIZE / 2 - 2, py + 8, 4, TILE_SIZE - 16);
        break;

      case 11: // Whiteboard
        graphics.fillStyle(COLORS.wall, 1);
        graphics.fillRect(px, py, TILE_SIZE, TILE_SIZE);
        graphics.fillStyle(COLORS.whiteboard, 1);
        graphics.fillRect(px + 4, py + 6, TILE_SIZE - 8, TILE_SIZE - 12);
        // Notas
        graphics.fillStyle(0xffcc00, 1);
        graphics.fillRect(px + 8, py + 10, 8, 8);
        graphics.fillStyle(0xff6b6b, 1);
        graphics.fillRect(px + 20, py + 14, 8, 8);
        break;

      case 12: // Carpete
        graphics.fillStyle(COLORS.carpet, 1);
        graphics.fillRect(px + 4, py + 4, TILE_SIZE - 8, TILE_SIZE - 8);
        break;
    }
  }

  private createAgents() {
    const agentColors: Record<string, number> = {
      planner: 0x0984e3,
      analyst: 0x00b894,
      developer: 0x6c5ce7,
      qa: 0xfdcb6e,
      ops: 0xe17055,
    };

    this.agents.forEach((agent, index) => {
      const room =
        ROOM_POSITIONS[agent.current_task ? this.getTaskStatus(agent.current_task) : 'backlog'];

      const x = (room.x + 1 + (index % 2)) * TILE_SIZE + TILE_SIZE / 2;
      const y = (room.y + 2) * TILE_SIZE + TILE_SIZE / 2;

      const container = this.add.container(x, y);

      // Sombra
      const shadow = this.add.ellipse(0, 16, 28, 10, 0x000000, 0.3);
      container.add(shadow);

      // Corpo
      const body = this.add.rectangle(0, 0, 24, 32, agentColors[agent.role]);
      body.setStrokeStyle(2, 0xffffff, 0.5);
      container.add(body);

      // Cabeça
      const head = this.add.circle(0, -22, 12, 0xffdbac);
      head.setStrokeStyle(2, 0x000000, 0.3);
      container.add(head);

      // Olhos
      const leftEye = this.add.circle(-4, -24, 2, 0x000000);
      const rightEye = this.add.circle(4, -24, 2, 0x000000);
      container.add(leftEye);
      container.add(rightEye);

      // Nome
      const name = this.add
        .text(0, -42, agent.name, {
          fontSize: '10px',
          color: '#ffffff',
          backgroundColor: '#000000aa',
          padding: { x: 4, y: 2 },
        })
        .setOrigin(0.5);
      container.add(name);

      // Status indicator
      const statusColor = this.getStatusColor(agent.status);
      const indicator = this.add.circle(14, -30, 5, statusColor);
      container.add(indicator);

      container.setData('agentId', agent.id);
      container.setSize(32, 48);
      container.setInteractive({ useHandCursor: true });

      // Animação idle
      this.tweens.add({
        targets: container,
        y: y - 2,
        duration: 1000 + Math.random() * 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      this.agentSprites.set(agent.id, container);
    });
  }

  private createTaskMarkers() {
    const priorityColors: Record<string, number> = {
      critical: 0xff0000,
      high: 0xff6b6b,
      medium: 0xfdcb6e,
      low: 0x636e72,
    };

    // Agrupar tasks por status
    const tasksByStatus: Record<string, OfficeTask[]> = {};
    this.tasks.forEach((task) => {
      if (!tasksByStatus[task.status]) tasksByStatus[task.status] = [];
      tasksByStatus[task.status].push(task);
    });

    Object.entries(tasksByStatus).forEach(([status, tasks]) => {
      const room = ROOM_POSITIONS[status];
      if (!room) return;

      tasks.forEach((task, index) => {
        const x = (room.x + 1 + (index % 3)) * TILE_SIZE + TILE_SIZE / 2;
        const y = (room.y + 3 + Math.floor(index / 3)) * TILE_SIZE + TILE_SIZE / 2;

        const marker = this.add.container(x, y);

        // Background
        const bg = this.add.rectangle(0, 0, 44, 20, priorityColors[task.priority], 0.9);
        bg.setStrokeStyle(1, 0xffffff, 0.5);
        marker.add(bg);

        // Título
        const title = this.add
          .text(0, 0, task.title.substring(0, 12), {
            fontSize: '9px',
            color: '#ffffff',
          })
          .setOrigin(0.5);
        marker.add(title);

        marker.setData('taskId', task.id);
        marker.setSize(44, 20);
        marker.setInteractive({ useHandCursor: true });

        // Hover
        marker.on('pointerover', () => {
          this.tweens.add({ targets: marker, scale: 1.1, duration: 100 });
        });
        marker.on('pointerout', () => {
          this.tweens.add({ targets: marker, scale: 1, duration: 100 });
        });

        this.taskMarkers.set(task.id, marker);
      });
    });
  }

  private setupControls() {
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
    }
  }

  private startSimulation() {
    // Atualizar agentes a cada 3 segundos
    this.time.addEvent({
      delay: 3000,
      callback: this.updateSimulation,
      callbackScope: this,
      loop: true,
    });
  }

  private updateSimulation() {
    this.agents.forEach((agent) => {
      if (agent.current_task) {
        const task = this.tasks.find((t) => t.id === agent.current_task);
        if (task) {
          this.moveAgentToRoom(agent.id, task.status);
        }
      }
    });
  }

  private moveAgentToRoom(agentId: string, status: string) {
    const sprite = this.agentSprites.get(agentId);
    const room = ROOM_POSITIONS[status];
    if (!sprite || !room) return;

    const targetX = (room.x + 1 + Math.random() * 2) * TILE_SIZE + TILE_SIZE / 2;
    const targetY = (room.y + 2 + Math.random()) * TILE_SIZE + TILE_SIZE / 2;

    // Parar animação idle
    this.tweens.killTweensOf(sprite);

    // Animar movimento
    this.tweens.add({
      targets: sprite,
      x: targetX,
      y: targetY,
      duration: 1000,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        // Retomar animação idle
        this.tweens.add({
          targets: sprite,
          y: targetY - 2,
          duration: 1000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut',
        });
      },
    });
  }

  private getStatusColor(status: string): number {
    const colors: Record<string, number> = {
      idle: 0x636e72,
      walking: 0x74b9ff,
      working: 0x6c5ce7,
      meeting: 0xfdcb6e,
      celebrating: 0x00b894,
    };
    return colors[status] || 0x636e72;
  }

  private getTaskStatus(taskId: string): string {
    const task = this.tasks.find((t) => t.id === taskId);
    return task?.status || 'backlog';
  }

  private createUI() {
    // Painel de informações
    const panel = this.add.container(10, 10);

    const bg = this.add.rectangle(0, 0, 200, 120, 0x000000, 0.7);
    bg.setOrigin(0);
    panel.add(bg);

    const title = this.add.text(10, 10, '🏢 Escritório Virtual', {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    panel.add(title);

    const stats = this.add.text(
      10,
      35,
      [
        `📊 Tasks: ${this.tasks.length}`,
        `🤖 Agentes: ${this.agents.length}`,
        `⌨️ Setas: Mover câmera`,
        `R: Resetar vista`,
      ].join('\n'),
      {
        fontSize: '11px',
        color: '#aaaaaa',
      }
    );
    panel.add(stats);

    panel.setScrollFactor(0);
    panel.setDepth(1000);
  }

  update() {
    // Controle de câmera
    const speed = 5;
    if (this.cursors.left.isDown) this.cameras.main.scrollX -= speed;
    if (this.cursors.right.isDown) this.cameras.main.scrollX += speed;
    if (this.cursors.up.isDown) this.cameras.main.scrollY -= speed;
    if (this.cursors.down.isDown) this.cameras.main.scrollY += speed;
  }

  updateTasks(tasks: OfficeTask[]) {
    this.tasks = tasks;
    this.taskMarkers.forEach((m) => m.destroy());
    this.taskMarkers.clear();
    this.createTaskMarkers();
  }

  updateAgents(agents: OfficeAgent[]) {
    this.agents = agents;
  }
}

// ============================================
// COMPONENTE REACT
// ============================================

export function GatherOffice({ tasks, agents }: { tasks: OfficeTask[]; agents: OfficeAgent[] }) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<GatherOfficeScene | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      backgroundColor: '#1a1a2e',
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: GatherOfficeScene,
    });

    gameRef.current = game;

    game.events.on('ready', () => {
      sceneRef.current = game.scene.getScene('GatherOfficeScene') as GatherOfficeScene;
      if (sceneRef.current) {
        sceneRef.current.updateTasks(tasks);
        sceneRef.current.updateAgents(agents);
      }
      setIsLoading(false);
    });

    const timeout = setTimeout(() => {
      sceneRef.current = game.scene.getScene('GatherOfficeScene') as GatherOfficeScene;
      setIsLoading(false);
    }, 2000);

    return () => {
      clearTimeout(timeout);
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (sceneRef.current) sceneRef.current.updateTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    if (sceneRef.current) sceneRef.current.updateAgents(agents);
  }, [agents]);

  return (
    <div className="relative w-full h-full min-h-[500px] bg-gray-900 rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
          <div className="text-center text-white">
            <div className="text-4xl mb-2 animate-bounce">🏢</div>
            <p>Carregando escritório...</p>
          </div>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}

export default GatherOffice;
