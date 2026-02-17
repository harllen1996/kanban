/**
 * KanbanGame - Componente de gamificação do Veritas Kanban
 *
 * Renderiza um escritório virtual com personagens pixel art
 * que representam as tarefas do Kanban.
 *
 * Sprint 0: Setup inicial - componente wrapper isolado
 */

import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';

// Tipos
interface KanbanGameProps {
  tasks: TaskData[];
  onTaskClick?: (taskId: string) => void;
  onTaskMove?: (taskId: string, newStatus: string) => void;
}

interface TaskData {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'blocked' | 'done';
  priority?: 'low' | 'medium' | 'high';
  type?: string;
}

// Configuração do jogo
const GAME_CONFIG: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: '100%',
  height: '100%',
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
};

// Posições das "salas" do escritório
const ROOM_POSITIONS = {
  todo: { x: 100, y: 300, label: 'Sala de Espera' },
  'in-progress': { x: 400, y: 300, label: 'Área de Trabalho' },
  blocked: { x: 250, y: 500, label: 'Zona Bloqueada' },
  done: { x: 700, y: 300, label: 'Área de Sucesso' },
};

// Classe principal do jogo
class KanbanGameScene extends Phaser.Scene {
  private tasks: TaskData[] = [];
  private characters: Map<string, Phaser.GameObjects.Container> = new Map();
  private onTaskClick?: (taskId: string) => void;

  constructor() {
    super({ key: 'KanbanGameScene' });
  }

  init(data: { tasks: TaskData[]; onTaskClick?: (taskId: string) => void }) {
    this.tasks = data.tasks || [];
    this.onTaskClick = data.onTaskClick;
  }

  create() {
    // Desenhar background do escritório
    this.drawOffice();

    // Criar personagens para cada tarefa
    this.createCharacters();

    // Mostrar instruções
    this.add
      .text(400, 30, '🎮 Veritas Kanban - Gamificado', {
        fontSize: '24px',
        color: '#ffffff',
        fontFamily: 'Arial',
      })
      .setOrigin(0.5);
  }

  private drawOffice() {
    const graphics = this.add.graphics();

    // Fundo
    graphics.fillStyle(0x1a1a2e, 1);
    graphics.fillRect(0, 0, 800, 600);

    // Sala de Espera (todo)
    graphics.fillStyle(0x2d3436, 1);
    graphics.fillRoundedRect(20, 150, 180, 300, 10);
    this.add
      .text(110, 170, '🪑 Sala de Espera', {
        fontSize: '14px',
        color: '#ffffff',
      })
      .setOrigin(0.5);
    this.add
      .text(110, 190, '(A Fazer)', {
        fontSize: '12px',
        color: '#888888',
      })
      .setOrigin(0.5);

    // Área de Trabalho (in-progress)
    graphics.fillStyle(0x0984e3, 0.3);
    graphics.fillRoundedRect(300, 150, 200, 300, 10);
    this.add
      .text(400, 170, '💻 Área de Trabalho', {
        fontSize: '14px',
        color: '#ffffff',
      })
      .setOrigin(0.5);
    this.add
      .text(400, 190, '(Em Progresso)', {
        fontSize: '12px',
        color: '#888888',
      })
      .setOrigin(0.5);

    // Zona Bloqueada (blocked)
    graphics.fillStyle(0xd63031, 0.3);
    graphics.fillRoundedRect(200, 450, 200, 130, 10);
    this.add
      .text(300, 470, '🚧 Zona Bloqueada', {
        fontSize: '14px',
        color: '#ffffff',
      })
      .setOrigin(0.5);
    this.add
      .text(300, 490, '(Bloqueado)', {
        fontSize: '12px',
        color: '#888888',
      })
      .setOrigin(0.5);

    // Área de Sucesso (done)
    graphics.fillStyle(0x00b894, 0.3);
    graphics.fillRoundedRect(580, 150, 200, 300, 10);
    this.add
      .text(680, 170, '🎉 Área de Sucesso', {
        fontSize: '14px',
        color: '#ffffff',
      })
      .setOrigin(0.5);
    this.add
      .text(680, 190, '(Concluído)', {
        fontSize: '12px',
        color: '#888888',
      })
      .setOrigin(0.5);
  }

  private createCharacters() {
    // Limpar personagens existentes
    this.characters.forEach((char) => char.destroy());
    this.characters.clear();

    // Contador por status para posicionar
    const countByStatus: Record<string, number> = {
      todo: 0,
      'in-progress': 0,
      blocked: 0,
      done: 0,
    };

    this.tasks.forEach((task) => {
      const pos = this.getTaskPosition(task, countByStatus[task.status]);
      countByStatus[task.status]++;

      // Criar container para o personagem
      const container = this.add.container(pos.x, pos.y);

      // Emoji como sprite temporário (será substituído por pixel art)
      const emoji = this.getTaskEmoji(task);
      const text = this.add
        .text(0, 0, emoji, {
          fontSize: '32px',
        })
        .setOrigin(0.5);

      // Nome da tarefa (truncado)
      const name = this.add
        .text(0, 25, this.truncateText(task.title, 12), {
          fontSize: '10px',
          color: '#ffffff',
          backgroundColor: '#00000088',
          padding: { x: 4, y: 2 },
        })
        .setOrigin(0.5);

      container.add([text, name]);

      // Interatividade
      container.setSize(50, 60);
      container.setInteractive({ useHandCursor: true });

      container.on('pointerover', () => {
        text.setScale(1.2);
      });

      container.on('pointerout', () => {
        text.setScale(1);
      });

      container.on('pointerdown', () => {
        if (this.onTaskClick) {
          this.onTaskClick(task.id);
        }
      });

      this.characters.set(task.id, container);
    });
  }

  private getTaskPosition(task: TaskData, index: number): { x: number; y: number } {
    const basePositions: Record<string, { x: number; y: number }> = {
      todo: { x: 110, y: 250 },
      'in-progress': { x: 400, y: 250 },
      blocked: { x: 300, y: 530 },
      done: { x: 680, y: 250 },
    };

    const base = basePositions[task.status] || basePositions.todo;
    const col = index % 4;
    const row = Math.floor(index / 4);

    return {
      x: base.x + col * 45,
      y: base.y + row * 50,
    };
  }

  private getTaskEmoji(task: TaskData): string {
    // Emojis baseados no tipo/prioridade
    const typeEmojis: Record<string, string> = {
      code: '👨‍💻',
      design: '🎨',
      research: '🔍',
      default: '🧑‍💼',
    };

    const priorityEmojis: Record<string, string> = {
      high: '🔴',
      medium: '🟡',
      low: '🟢',
    };

    const typeEmoji = typeEmojis[task.type || 'default'] || typeEmojis.default;
    return typeEmoji;
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  // Atualizar tarefas dinamicamente
  updateTasks(tasks: TaskData[]) {
    this.tasks = tasks;
    this.createCharacters();
  }
}

// Componente React
export function KanbanGame({ tasks, onTaskClick, onTaskMove }: KanbanGameProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const sceneRef = useRef<KanbanGameScene | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inicializar jogo
  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    try {
      const game = new Phaser.Game({
        ...GAME_CONFIG,
        parent: containerRef.current,
        scene: KanbanGameScene,
      });

      gameRef.current = game;

      // Aguardar cena estar pronta
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

  // Atualizar tarefas quando mudar
  useEffect(() => {
    if (sceneRef.current && tasks.length > 0) {
      sceneRef.current.updateTasks(tasks);
    }
  }, [tasks]);

  // Callback de clique
  useEffect(() => {
    if (sceneRef.current && onTaskClick) {
      sceneRef.current.onTaskClick = onTaskClick;
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
    <div className="relative w-full h-full min-h-[600px] bg-card rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-card z-10">
          <div className="text-center">
            <div className="animate-spin text-4xl mb-2">🎮</div>
            <p className="text-muted-foreground">Carregando jogo...</p>
          </div>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}

export default KanbanGame;
