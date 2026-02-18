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

// Callbacks de drag
type DragCallbacks = {
  onDragStart: (x: number, y: number) => void;
  onDragMove: (x: number, y: number) => void;
  onDragEnd: () => void;
};

// Classe de gerenciamento de interação
export class InteractionManager {
  private scene: Phaser.Scene;
  private config: InteractionConfig;
  private currentDrag: DragData | null = null;
  private currentClick: { taskId: string; x: number; y: number; startTime: number } | null = null;
  private clickThreshold: number = 10;
  private dragThreshold: number = 10;
  private registeredCharacters: Map<
    string,
    { container: Phaser.GameObjects.Container; callbacks: DragCallbacks }
  > = new Map();
  private keyboardShortcuts: Map<string, () => void> = new Map();

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
    this.setupKeyboardShortcuts();
    this.setupZoomControls();
  }

  // Configurar atalhos de teclado
  private setupKeyboardShortcuts() {
    if (!this.scene.input.keyboard) return;

    // Tecla R - Resetar zoom
    this.scene.input.keyboard.on('keydown-R', () => {
      this.resetZoom();
      this.showNotification('🔍 Zoom resetado');
    });

    // Tecla + ou = - Zoom in
    this.scene.input.keyboard.on('keydown-PLUS', () => {
      this.zoomIn();
      this.showNotification(`🔍 Zoom: ${Math.round(this.config.zoomLevel * 100)}%`);
    });

    this.scene.input.keyboard.on('keydown-EQUALS', () => {
      this.zoomIn();
      this.showNotification(`🔍 Zoom: ${Math.round(this.config.zoomLevel * 100)}%`);
    });

    // Tecla - - Zoom out
    this.scene.input.keyboard.on('keydown-MINUS', () => {
      this.zoomOut();
      this.showNotification(`🔍 Zoom: ${Math.round(this.config.zoomLevel * 100)}%`);
    });

    // Tecla H - Ajuda
    this.scene.input.keyboard.on('keydown-H', () => {
      this.showHelp();
    });

    // Tecla ESC - Cancelar drag
    this.scene.input.keyboard.on('keydown-ESC', () => {
      if (this.currentDrag) {
        this.cancelDrag();
        this.showNotification('❌ Drag cancelado');
      }
    });

    // Teclas de navegação rápida
    this.scene.input.keyboard.on('keydown-ONE', () => {
      this.scene.events.emit('navigate-to-room', 'todo');
    });

    this.scene.input.keyboard.on('keydown-TWO', () => {
      this.scene.events.emit('navigate-to-room', 'in-progress');
    });

    this.scene.input.keyboard.on('keydown-THREE', () => {
      this.scene.events.emit('navigate-to-room', 'blocked');
    });

    this.scene.input.keyboard.on('keydown-FOUR', () => {
      this.scene.events.emit('navigate-to-room', 'done');
    });
  }

  // Configurar controles de zoom
  private setupZoomControls() {
    // Zoom com scroll do mouse
    this.scene.input.on(
      'wheel',
      (_pointer: Phaser.Input.Pointer, _gameObjects: any, _deltaX: number, deltaY: number) => {
        if (deltaY > 0) {
          this.zoomOut();
        } else if (deltaY < 0) {
          this.zoomIn();
        }

        // Feedback visual
        this.scene.events.emit('zoom-changed', this.config.zoomLevel);
      }
    );
  }

  // Mostrar notificação
  private showNotification(message: string) {
    const notification = this.scene.add
      .text(this.scene.cameras.main.width / 2, 50, message, {
        fontSize: '14px',
        color: '#ffffff',
        backgroundColor: '#000000aa',
        padding: { x: 10, y: 5 },
      })
      .setOrigin(0.5)
      .setDepth(1000)
      .setScrollFactor(0);

    // Animar e remover
    this.scene.tweens.add({
      targets: notification,
      alpha: 0,
      y: 30,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => notification.destroy(),
    });
  }

  // Mostrar ajuda
  private showHelp() {
    const helpText = `
⌨️ ATALHOS DE TECLADO

D - Modo Debug
R - Resetar Zoom
+/- - Zoom In/Out
1/2/3/4 - Navegar salas
ESC - Cancelar drag
H - Ajuda

🖱️ CONTROLES

Scroll - Zoom
Arrastar personagem - Mudar status
Clique - Ver detalhes
    `.trim();

    const bg = this.scene.add
      .rectangle(
        this.scene.cameras.main.width / 2,
        this.scene.cameras.main.height / 2,
        300,
        250,
        0x000000,
        0.9
      )
      .setDepth(1001)
      .setScrollFactor(0);

    const text = this.scene.add
      .text(this.scene.cameras.main.width / 2, this.scene.cameras.main.height / 2, helpText, {
        fontSize: '12px',
        color: '#ffffff',
        align: 'center',
        lineSpacing: 8,
      })
      .setOrigin(0.5)
      .setDepth(1002)
      .setScrollFactor(0);

    // Fechar com qualquer tecla
    const closeHelp = () => {
      bg.destroy();
      text.destroy();
      this.scene.input.keyboard?.off('keydown', closeHelp);
    };

    this.scene.input.keyboard?.once('keydown', closeHelp);
    bg.setInteractive().on('pointerdown', closeHelp);
  }

  // Cancelar drag atual
  private cancelDrag() {
    if (this.currentDrag) {
      const registered = this.registeredCharacters.get(this.currentDrag.taskId);
      if (registered) {
        // Animação de retorno
        this.scene.tweens.add({
          targets: registered.container,
          scaleX: 1,
          scaleY: 1,
          alpha: 1,
          duration: 200,
        });
      }
      this.currentDrag = null;
    }
  }

  // Configurar eventos de interação
  private setupInteraction() {
    if (!this.config.enabled) return;

    // Eventos de mouse
    this.scene.input.on('pointerdown', this.handlePointerDown, this);
    this.scene.input.on('pointermove', this.handlePointerMove, this);
    this.scene.input.on('pointerup', this.handlePointerUp, this);

    // Suporte a touch para mobile
    this.scene.input.addPointer(2);

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
      this.currentClick = null;
    }
  }

  private handleTouchEnd(pointer: Phaser.Input.Pointer) {
    if (!this.currentClick) return;

    const duration = Date.now() - this.currentClick.startTime;

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

  private handlePointerDown(pointer: Phaser.Geom.Point) {
    if (!this.config.enabled) return;

    this.currentClick = {
      taskId: '',
      x: pointer.x,
      y: pointer.y,
      startTime: this.scene.time.now,
    };
  }

  private handlePointerMove(pointer: Phaser.Geom.Point) {
    if (!this.currentClick || !this.config.enabled) return;

    const dx = pointer.x - this.currentClick!.x;
    const dy = pointer.y - this.currentClick!.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > this.dragThreshold) {
      this.currentClick = null;
    }
  }

  private handlePointerUp(pointer: Phaser.Geom.Point) {
    if (!this.config.enabled || !this.currentClick) return;

    const dx = pointer.x - this.currentClick!.x;
    const dy = pointer.y - this.currentClick!.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const timeElapsed = this.scene.time.now - this.currentClick!.startTime;

    if (distance < this.clickThreshold && timeElapsed < 500) {
      this.triggerClick(pointer.x, pointer.y);
    }

    this.currentClick = null;
  }

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
    const callbacks: DragCallbacks = { onDragStart, onDragMove, onDragEnd };
    this.registeredCharacters.set(taskId, { container, callbacks });

    container.setInteractive({ useHandCursor: true, draggable: true });

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
        scaleX: 1.15,
        scaleY: 1.15,
        duration: 100,
        ease: 'Back.easeOut',
      });

      // Sombra durante drag
      container.setDepth(100);
    });

    container.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.currentDrag && this.currentDrag.taskId === taskId) {
        onDragMove(pointer.x, pointer.y);

        // Efeito visual de drag
        if (container.alpha > 0.8) {
          this.scene.tweens.add({
            targets: container,
            alpha: 0.85,
            duration: 50,
          });
        }
      }
    });

    container.on('pointerup', () => {
      if (this.currentDrag && this.currentDrag.taskId === taskId) {
        const pointer = this.scene.input.activePointer;
        const dx = this.currentDrag.startX - pointer.x;
        const dy = this.currentDrag.startY - pointer.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > this.config.dragDistance) {
          onDragEnd();
        } else {
          this.scene.events.emit('task-click', container.x, container.y);
        }

        // Resetar visual
        this.scene.tweens.add({
          targets: container,
          scaleX: 1,
          scaleY: 1,
          alpha: 1,
          duration: 150,
          ease: 'Back.easeIn',
        });

        container.setDepth(1);
        this.currentDrag = null;
      }
    });

    container.on('pointerout', () => {
      if (this.currentDrag && this.currentDrag.taskId === taskId) {
        // Manter drag ativo mesmo saindo do container
      }
    });

    // Touch events
    container.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown) {
        this.currentDrag = {
          taskId,
          startX: pointer.x,
          startY: pointer.y,
        };
      }
    });
  }

  // Remover personagem registrado
  unregisterCharacter(taskId: string) {
    this.registeredCharacters.delete(taskId);
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
    this.scene.cameras.main.setScroll(0, 0);
  }

  // Ativar/desativar interação
  setEnabled(enabled: boolean) {
    this.config.enabled = enabled;
  }

  // Obter configuração atual
  getConfig(): InteractionConfig {
    return { ...this.config };
  }

  // Obter nível de zoom atual
  getZoomLevel(): number {
    return this.config.zoomLevel;
  }

  // Destruir
  destroy() {
    this.registeredCharacters.clear();
    this.keyboardShortcuts.clear();
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
