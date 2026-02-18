/**
 * GatherOffice Pro - Escritório Virtual estilo Gather
 * Mapa 2D pixel art com visão isométrica melhorada
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

const TILE_WIDTH = 64;
const TILE_HEIGHT = 32;
const MAP_WIDTH = 20;
const MAP_HEIGHT = 15;

// Cores
const COLORS = {
  floor: 0x4a5568,
  floorDark: 0x3d4552,
  wall: 0x2d3748,
  wallTop: 0x4a5568,
  desk: 0x8b7355,
  chair: 0x4a5568,
  plant: 0x48bb78,
  screen: 0x1a1a2e,
  screenGlow: 0x4d96ff,
  door: 0x744210,
  window: 0x90cdf4,
  carpet: 0x553c9a,
};

// Posições das salas (isométrico)
const ROOMS: Record<
  string,
  { x: number; y: number; w: number; h: number; name: string; color: number }
> = {
  backlog: { x: 1, y: 1, w: 4, h: 5, name: '📋 PLANEJAMENTO', color: 0x636e72 },
  todo: { x: 6, y: 1, w: 4, h: 5, name: '📝 TAREFAS', color: 0x4299e1 },
  doing: { x: 11, y: 1, w: 4, h: 5, name: '💻 TRABALHO', color: 0x805ad5 },
  review: { x: 1, y: 8, w: 4, h: 5, name: '👥 REUNIÃO', color: 0xecc94b },
  done: { x: 6, y: 8, w: 4, h: 5, name: '🎉 ENTREGA', color: 0x48bb78 },
};

// Cores dos agentes por papel
const AGENT_COLORS: Record<string, number> = {
  planner: 0x4299e1,
  analyst: 0x48bb78,
  developer: 0x805ad5,
  qa: 0xecc94b,
  ops: 0xf56565,
};

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

// Converter coordenadas cartesianas para isométricas
function cartToIso(x: number, y: number): { x: number; y: number } {
  return {
    x: (x - y) * (TILE_WIDTH / 2),
    y: (x + y) * (TILE_HEIGHT / 2),
  };
}

// ============================================
// CENA PRINCIPAL
// ============================================

class GatherOfficeScene extends Phaser.Scene {
  private agents: OfficeAgent[] = [];
  private tasks: OfficeTask[] = [];
  private agentSprites: Map<string, Phaser.GameObjects.Container> = new Map();
  private taskMarkers: Map<string, Phaser.GameObjects.Container> = new Map();
  private floorTiles: Phaser.GameObjects.Graphics[] = [];
  private walls: Phaser.GameObjects.Graphics[] = [];
  private furniture: Phaser.GameObjects.Container[] = [];
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

    // Criar mobiliário
    this.createFurniture();

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

    // Centralizar câmera
    this.centerCamera();
  }

  private drawOffice() {
    // Desenhar piso isométrico
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        const room = this.getRoomAt(x, y);
        const color = room ? room.color : COLORS.floor;

        this.drawIsoTile(x, y, color, room ? 0.3 : 0.2);
      }
    }

    // Desenhar paredes
    this.drawWalls();

    // Labels das salas
    Object.entries(ROOMS).forEach(([_key, room]) => {
      const center = cartToIso(room.x + room.w / 2, room.y);
      const label = this.add
        .text(center.x, center.y - 20, room.name, {
          fontSize: '12px',
          color: '#ffffff',
          backgroundColor: `#${room.color.toString(16).padStart(6, '0')}`,
          padding: { x: 8, y: 4 },
          fontStyle: 'bold',
        })
        .setOrigin(0.5);
      label.setDepth(1000);
    });
  }

  private drawIsoTile(gridX: number, gridY: number, color: number, alpha: number) {
    const pos = cartToIso(gridX, gridY);
    const graphics = this.add.graphics();

    // Pontos do losango isométrico
    const points = [
      { x: pos.x, y: pos.y },
      { x: pos.x + TILE_WIDTH / 2, y: pos.y + TILE_HEIGHT / 2 },
      { x: pos.x, y: pos.y + TILE_HEIGHT },
      { x: pos.x - TILE_WIDTH / 2, y: pos.y + TILE_HEIGHT / 2 },
    ];

    // Desenhar losango
    graphics.fillStyle(color, alpha);
    graphics.beginPath();
    graphics.moveTo(points[0].x, points[0].y);
    points.forEach((p) => graphics.lineTo(p.x, p.y));
    graphics.closePath();
    graphics.fillPath();

    // Borda
    graphics.lineStyle(1, 0x000000, 0.2);
    graphics.strokePath();

    this.floorTiles.push(graphics);
  }

  private drawWalls() {
    // Parede frontal esquerda
    this.drawWall(0, 0, MAP_WIDTH);
    // Parede frontal direita
    this.drawWall(MAP_WIDTH, 0, MAP_HEIGHT);
  }

  private drawWall(startX: number, startY: number, length: number) {
    const graphics = this.add.graphics();

    for (let i = 0; i < length; i++) {
      const x = startX === 0 ? i : startX;
      const y = startY === 0 ? i : i;

      const pos = cartToIso(x, y);

      // Face esquerda da parede
      graphics.fillStyle(COLORS.wall, 0.9);
      graphics.beginPath();
      graphics.moveTo(pos.x - TILE_WIDTH / 2, pos.y + TILE_HEIGHT / 2);
      graphics.lineTo(pos.x - TILE_WIDTH / 2, pos.y + TILE_HEIGHT / 2 - 60);
      graphics.lineTo(pos.x, pos.y - 60);
      graphics.lineTo(pos.x, pos.y);
      graphics.closePath();
      graphics.fillPath();

      // Face direita da parede
      graphics.fillStyle(COLORS.wallTop, 0.9);
      graphics.beginPath();
      graphics.moveTo(pos.x, pos.y);
      graphics.lineTo(pos.x, pos.y - 60);
      graphics.lineTo(pos.x + TILE_WIDTH / 2, pos.y + TILE_HEIGHT / 2 - 60);
      graphics.lineTo(pos.x + TILE_WIDTH / 2, pos.y + TILE_HEIGHT / 2);
      graphics.closePath();
      graphics.fillPath();
    }

    this.walls.push(graphics);
  }

  private getRoomAt(x: number, y: number): { name: string; color: number } | null {
    for (const room of Object.values(ROOMS)) {
      if (x >= room.x && x < room.x + room.w && y >= room.y && y < room.y + room.h) {
        return { name: room.name, color: room.color };
      }
    }
    return null;
  }

  private createFurniture() {
    // Mesas na sala de trabalho
    this.createDesk(12, 2);
    this.createDesk(13, 2);
    this.createDesk(12, 3);

    // Plantas decorativas
    this.createPlant(3, 3);
    this.createPlant(8, 3);
    this.createPlant(3, 10);

    // Whiteboard na sala de planejamento
    this.createWhiteboard(2, 2);

    // Mesa de reunião
    this.createMeetingTable(2, 10);
  }

  private createDesk(gridX: number, gridY: number) {
    const pos = cartToIso(gridX, gridY);
    const container = this.add.container(pos.x, pos.y);

    // Sombra
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.3);
    shadow.fillEllipse(0, 10, 50, 25);
    container.add(shadow);

    // Mesa
    const desk = this.add.graphics();
    desk.fillStyle(COLORS.desk, 1);
    desk.fillRect(-25, -15, 50, 30);
    desk.fillStyle(COLORS.screen, 1);
    desk.fillRect(-15, -25, 30, 15);
    desk.fillStyle(COLORS.screenGlow, 0.5);
    desk.fillRect(-13, -23, 26, 11);
    container.add(desk);

    container.setDepth(pos.y);
    this.furniture.push(container);
  }

  private createPlant(gridX: number, gridY: number) {
    const pos = cartToIso(gridX, gridY);
    const container = this.add.container(pos.x, pos.y - 10);

    // Vaso
    const pot = this.add.graphics();
    pot.fillStyle(0x744210, 1);
    pot.fillRect(-8, 5, 16, 12);
    container.add(pot);

    // Folhas
    const leaves = this.add.graphics();
    leaves.fillStyle(COLORS.plant, 1);
    leaves.fillCircle(0, -5, 12);
    leaves.fillCircle(-8, 0, 8);
    leaves.fillCircle(8, 0, 8);
    container.add(leaves);

    container.setDepth(pos.y);
    this.furniture.push(container);
  }

  private createWhiteboard(gridX: number, gridY: number) {
    const pos = cartToIso(gridX, gridY);
    const container = this.add.container(pos.x, pos.y - 20);

    // Quadro
    const board = this.add.graphics();
    board.fillStyle(0xffffff, 1);
    board.fillRect(-30, -20, 60, 40);
    board.lineStyle(2, 0x000000, 1);
    board.strokeRect(-30, -20, 60, 40);

    // Notas
    board.fillStyle(0xffeb3b, 1);
    board.fillRect(-25, -15, 15, 15);
    board.fillStyle(0xff9800, 1);
    board.fillRect(-5, -15, 15, 15);
    board.fillStyle(0x4caf50, 1);
    board.fillRect(15, -15, 10, 15);

    container.add(board);
    container.setDepth(pos.y);
    this.furniture.push(container);
  }

  private createMeetingTable(gridX: number, gridY: number) {
    const pos = cartToIso(gridX, gridY);
    const container = this.add.container(pos.x, pos.y);

    // Mesa oval
    const table = this.add.graphics();
    table.fillStyle(COLORS.desk, 1);
    table.fillEllipse(0, 0, 80, 40);
    container.add(table);

    container.setDepth(pos.y);
    this.furniture.push(container);
  }

  private createAgents() {
    this.agents.forEach((agent, index) => {
      const task = this.tasks.find((t) => t.id === agent.current_task);
      const roomKey = task ? task.status : 'backlog';
      const room = ROOMS[roomKey];

      if (!room) return;

      const gridX = room.x + 1 + (index % 2);
      const gridY = room.y + 1 + Math.floor(index / 2);
      const pos = cartToIso(gridX, gridY);

      const container = this.add.container(pos.x, pos.y);

      // Sombra
      const shadow = this.add.ellipse(0, 20, 30, 15, 0x000000, 0.3);
      container.add(shadow);

      // Corpo
      const bodyColor = AGENT_COLORS[agent.role] || 0x888888;
      const body = this.add.rectangle(0, 0, 28, 40, bodyColor);
      body.setStrokeStyle(2, 0xffffff, 0.5);
      container.add(body);

      // Cabeça
      const head = this.add.circle(0, -28, 14, 0xffdbac);
      head.setStrokeStyle(1, 0x000000, 0.3);
      container.add(head);

      // Olhos
      const leftEye = this.add.circle(-5, -30, 3, 0x000000);
      const rightEye = this.add.circle(5, -30, 3, 0x000000);
      container.add(leftEye);
      container.add(rightEye);

      // Sorriso
      const smile = this.add.graphics();
      smile.lineStyle(2, 0x000000, 1);
      smile.beginPath();
      smile.arc(0, -26, 5, 0, Math.PI, false);
      smile.strokePath();
      container.add(smile);

      // Nome
      const name = this.add
        .text(0, -50, agent.name, {
          fontSize: '11px',
          color: '#ffffff',
          backgroundColor: '#000000aa',
          padding: { x: 5, y: 2 },
        })
        .setOrigin(0.5);
      container.add(name);

      // Status indicator
      const statusColor = this.getStatusColor(agent.status);
      const indicator = this.add.circle(18, -40, 6, statusColor);
      indicator.setStrokeStyle(2, 0xffffff, 1);
      container.add(indicator);

      container.setData('agentId', agent.id);
      container.setDepth(pos.y + 1000);
      container.setSize(40, 60);

      // Animação idle
      this.tweens.add({
        targets: container,
        y: pos.y - 3,
        duration: 800 + Math.random() * 400,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      this.agentSprites.set(agent.id, container);
    });
  }

  private createTaskMarkers() {
    const tasksByStatus: Record<string, OfficeTask[]> = {};
    this.tasks.forEach((task) => {
      if (!tasksByStatus[task.status]) tasksByStatus[task.status] = [];
      tasksByStatus[task.status].push(task);
    });

    Object.entries(tasksByStatus).forEach(([status, tasks]) => {
      const room = ROOMS[status];
      if (!room) return;

      tasks.forEach((task, index) => {
        const gridX = room.x + 2 + (index % 2);
        const gridY = room.y + 2 + Math.floor(index / 2);
        const pos = cartToIso(gridX, gridY);

        const container = this.add.container(pos.x, pos.y - 15);

        // Marker
        const marker = this.add.graphics();
        const color = this.getPriorityColor(task.priority);
        marker.fillStyle(color, 0.9);
        marker.fillRoundedRect(-25, -10, 50, 20, 5);
        marker.lineStyle(2, 0xffffff, 0.5);
        marker.strokeRoundedRect(-25, -10, 50, 20, 5);
        container.add(marker);

        // Título
        const title = this.add
          .text(0, 0, task.title.substring(0, 10), {
            fontSize: '10px',
            color: '#ffffff',
            fontStyle: 'bold',
          })
          .setOrigin(0.5);
        container.add(title);

        container.setData('taskId', task.id);
        container.setDepth(pos.y + 500);
        container.setSize(50, 20);

        this.taskMarkers.set(task.id, container);
      });
    });
  }

  private setupControls() {
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();

      // Reset com R
      this.input.keyboard.on('keydown-R', () => {
        this.centerCamera();
      });
    }
  }

  private centerCamera() {
    const center = cartToIso(MAP_WIDTH / 2, MAP_HEIGHT / 2);
    this.cameras.main.centerOn(center.x, center.y - 100);
  }

  private startSimulation() {
    this.time.addEvent({
      delay: 4000,
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
    const room = ROOMS[status];
    if (!sprite || !room) return;

    const targetX = room.x + 1 + Math.random() * (room.w - 2);
    const targetY = room.y + 1 + Math.random() * (room.h - 2);
    const targetPos = cartToIso(targetX, targetY);

    this.tweens.killTweensOf(sprite);

    this.tweens.add({
      targets: sprite,
      x: targetPos.x,
      y: targetPos.y,
      duration: 1500,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        sprite.setDepth(targetPos.y + 1000);
        this.tweens.add({
          targets: sprite,
          y: targetPos.y - 3,
          duration: 800,
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
      walking: 0x4299e1,
      working: 0x805ad5,
      meeting: 0xecc94b,
      celebrating: 0x48bb78,
    };
    return colors[status] || 0x636e72;
  }

  private getPriorityColor(priority: string): number {
    const colors: Record<string, number> = {
      critical: 0xe53e3e,
      high: 0xf56565,
      medium: 0xecc94b,
      low: 0x718096,
    };
    return colors[priority] || 0x718096;
  }

  private createUI() {
    const panel = this.add.container(10, 10);
    panel.setScrollFactor(0);
    panel.setDepth(2000);

    const bg = this.add.rectangle(0, 0, 220, 140, 0x000000, 0.8);
    bg.setOrigin(0);
    panel.add(bg);

    const title = this.add.text(15, 15, '🏢 Gather Office Pro', {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    panel.add(title);

    const stats = this.add.text(
      15,
      45,
      [
        `📊 Tasks: ${this.tasks.length}`,
        `🤖 Agentes: ${this.agents.length}`,
        `🎮 Setas: Mover câmera`,
        `⌨️ R: Resetar vista`,
        `💡 Click: Selecionar`,
      ].join('\n'),
      {
        fontSize: '12px',
        color: '#a0aec0',
      }
    );
    panel.add(stats);
  }

  update() {
    const speed = 8;
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

export function GatherOfficePro({ tasks, agents }: { tasks: OfficeTask[]; agents: OfficeAgent[] }) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<GatherOfficeScene | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      backgroundColor: '#1a202c',
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
    <div className="relative w-full h-full min-h-[600px] bg-gray-900 rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
          <div className="text-center text-white">
            <div className="text-5xl mb-3 animate-bounce">🏢</div>
            <p className="text-lg">Carregando escritório...</p>
          </div>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}

export default GatherOfficePro;
