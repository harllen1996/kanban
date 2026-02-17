/**
 * Sistema de Interação - Drag & Drop e Clique
 * Sprint 3: Interação completa com o escritório
 */

// Tipos
export interface DragData {
  taskId: string;
  startX: number;
  startY: number;
}

export interface InteractionConfig {
  enabled: boolean;
  dragDistance: number;
  clickThreshold: number;
  zoomLevel: number;
  zoomSpeed: number;
}

// Classe de gerenciamento de interação
export class InteractionManager {
  private scene: Phaser.Scene;
  private config: InteractionConfig;
  private currentDrag: DragData | null = null;
  private currentClick: { taskId: string; x: number; y: number; startTime: number } | null = null;
  private clickThreshold: number = 10; // pixels
  private dragThreshold: number = 10; // pixels

  constructor(scene: Phaser.Scene, config?: Partial<InteractionConfig>) {
    this.scene = scene;
    this.config = {
      enabled: true,
      dragDistance: 50,
      clickThreshold: 10,
      zoomLevel: 1,
      zoomSpeed: 0.1,
      ...config,
    };

    this.setupInteraction();
  }

  // Configurar eventos de interação
  private setupInteraction() {
    if (!this.config.enabled) return;

    // Eventos de mouse
    this.scene.input.on('pointerdown', this.handlePointerDown, this);
    this.scene.input.on('pointermove', this.handlePointerMove, this);
    this.scene.input.on('pointerup', this.handlePointerUp, this);

    // Suporte a touch para mobile
    this.scene.input.addPointer(2); // Suportar até 2 toques simultâneos

    // Eventos de touch
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown) {
        this.handleTouchStart(pointer);
      }
    });

    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown) {
        this.handleTouchMove(pointer);
      }
    });

    this.scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      this.handleTouchEnd(pointer);
    });

    // Pinch zoom para mobile
    this.setupPinchZoom();
  }

  // Touch handlers
  private handleTouchStart(pointer: Phaser.Input.Pointer) {
    this.currentClick = {
      taskId: '',
      x: pointer.x,
      y: pointer.y,
      startTime: Date.now(),
    };
  }

  private handleTouchMove(pointer: Phaser.Input.Pointer) {
    if (!this.currentClick) return;

    const dx = pointer.x - this.currentClick.x;
    const dy = pointer.y - this.currentClick.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > this.clickThreshold) {
      // É um drag, não um tap
      this.currentClick = null;
    }
  }

  private handleTouchEnd(pointer: Phaser.Input.Pointer) {
    if (!this.currentClick) return;

    const duration = Date.now() - this.currentClick.startTime;

    // Se foi rápido e sem movimento muito, é um tap
    if (duration < 300) {
      this.scene.events.emit('task-click', pointer.x, pointer.y);
    }

    this.currentClick = null;
  }

  // Pinch zoom para mobile
  private pinchStartDistance: number = 0;
  private pinchStartZoom: number = 1;

  private setupPinchZoom() {
    this.scene.input.on('pointermove', (pointer1: Phaser.Input.Pointer) => {
      const pointer2 = this.scene.input.pointer2;

      if (pointer2 && pointer1.isDown && pointer2.isDown) {
        // Dois dedos pressionados = pinch
        const dx = pointer1.x - pointer2.x;
        const dy = pointer1.y - pointer2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (this.pinchStartDistance === 0) {
          this.pinchStartDistance = distance;
          this.pinchStartZoom = this.config.zoomLevel;
        } else {
          const scale = distance / this.pinchStartDistance;
          const newZoom = Math.max(0.5, Math.min(2, this.pinchStartZoom * scale));
          this.setZoom(newZoom);
        }
      } else {
        this.pinchStartDistance = 0;
      }
    });
  }

  // Detectar clique (movimento menor que threshold)
  private handlePointerDown(pointer: Phaser.Geom.Point) {
    if (!this.config.enabled) return;

    this.currentClick = {
      taskId: '',
      x: pointer.x,
      startY: pointer.y,
      startTime: this.scene.time.now,
    };
  }

  // Detectar movimento durante clique
  private handlePointerMove(pointer: Phaser.Geom.Point) {
    if (!this.currentClick || !this.config.enabled) return;

    const dx = pointer.x - this.currentClick!.x;
    const dy = pointer.y - this.currentClick!.startY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Se mover muito, é um drag
    if (distance > this.dragThreshold) {
      this.currentClick = null;
    }
  }

  // Detectar clique ou drag
  private handlePointerUp(pointer: Phaser.Geom.Point) {
    if (!this.config.enabled || !this.currentClick) return;

    const dx = pointer.x - this.currentClick!.x;
    const dy = pointer.y - this.currentClick!.startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const timeElapsed = this.scene.time.now - this.currentClick!.startTime;

    // Se movimento for pequeno e tempo for curto, é um clique
    if (distance < this.clickThreshold && timeElapsed < 500) {
      this.triggerClick(pointer.x, pointer.y);
    }

    this.currentClick = null;
  }

  // Disparar evento de clique
  private triggerClick(x: number, y: number) {
    this.scene.events.emit('task-click', x, y);
  }

  // Registrar personagem para interação
  registerCharacter(
    taskId: string,
    container: Phaser.GameObjects.Container,
    onDragStart: (x: number, y: number) => void,
    onDragMove: (x: number, y: number) => void,
    onDragEnd: () => void
  ) {
    container.setInteractive({ useHandCursor: true });

    container.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.currentDrag = {
        taskId,
        startX: pointer.x,
        startY: pointer.y,
      };

      onDragStart(pointer.x, pointer.y);

      // Efeito visual
      this.scene.tweens.add({
        targets: container,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 100,
      });
    });

    container.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.currentDrag) {
        onDragMove(pointer.x, pointer.y);

        // Efeito visual de drag
        this.scene.tweens.add({
          targets: container,
          alpha: 0.8,
          duration: 50,
        });
      }
    });

    container.on('pointerup', () => {
      if (this.currentDrag) {
        const dx = this.currentDrag.startX - this.scene.input.activePointer.x;
        const dy = this.currentDrag.startY - this.scene.input.activePointer.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > this.config.dragDistance) {
          // É um drag, não um clique
          onDragEnd();
        } else {
          // É um clique
          this.scene.events.emit('task-click', container.x, container.y);
        }

        // Resetar visual
        this.scene.tweens.add({
          targets: container,
          scaleX: 1,
          scaleY: 1,
          alpha: 1,
          duration: 100,
        });
      }
    });

    container.on('pointerout', () => {
      if (this.currentDrag) {
        this.scene.tweens.add({
          targets: container,
          alpha: 1,
          duration: 50,
        });
      }
    });
  }

  // Configurar zoom
  setZoom(level: number) {
    this.config.zoomLevel = Math.max(0.5, Math.min(2, level));
    this.scene.cameras.main.setZoom(this.config.zoomLevel);
  }

  // Zoom in
  zoomIn() {
    this.setZoom(this.config.zoomLevel + this.config.zoomSpeed);
  }

  // Zoom out
  zoomOut() {
    this.setZoom(this.config.zoomLevel - this.config.zoomSpeed);
  }

  // Resetar zoom
  resetZoom() {
    this.setZoom(1);
  }

  // Ativar/desativar interação
  setEnabled(enabled: boolean) {
    this.config.enabled = enabled;
    if (enabled) {
      this.setupInteraction();
    } else {
      this.scene.input.removeAllListeners();
    }
  }

  // Obter configuração atual
  getConfig(): InteractionConfig {
    return { ...this.config };
  }
}

// Função para detectar qual sala foi clicada
export function detectRoomClick(
  x: number,
  y: number,
  rooms: {
    todo: { x: number; y: number; width: number; height: number };
    inProgress: { x: number; y: number; width: number; height: number };
    blocked: { x: number; y: number; width: number; height: number };
    done: { x: number; y: number; width: number; height: number };
  }
): string | null {
  for (const [name, dim] of Object.entries(rooms)) {
    if (x >= dim.x && x <= dim.x + dim.width && y >= dim.y && y <= dim.y + dim.height) {
      return name;
    }
  }
  return null;
}

export default InteractionManager;
