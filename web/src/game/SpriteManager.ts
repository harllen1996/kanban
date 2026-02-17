/**
 * Sistema de Sprites Pixel Art
 * Sprint 4: Substituir emojis por sprites profissionais
 */

// Tipos de sprites
export type SpriteType =
  | 'character-idle'
  | 'character-walk'
  | 'character-work'
  | 'character-celebrate'
  | 'character-blocked'
  | 'furniture-desk'
  | 'furniture-chair'
  | 'furniture-computer'
  | 'decoration-plant'
  | 'decoration-coffee'
  | 'obstacle-cone'
  | 'obstacle-barrier';

// Configuração de sprites
export interface SpriteConfig {
  width: number;
  height: number;
  frameRate: number;
  scale: number;
}

// Spritesheets definidos
export const SPRITE_CONFIGS: Record<SpriteType, SpriteConfig> = {
  'character-idle': { width: 32, height: 32, frameRate: 4, scale: 1.5 },
  'character-walk': { width: 32, height: 32, frameRate: 8, scale: 1.5 },
  'character-work': { width: 32, height: 32, frameRate: 6, scale: 1.5 },
  'character-celebrate': { width: 32, height: 32, frameRate: 8, scale: 1.5 },
  'character-blocked': { width: 32, height: 32, frameRate: 4, scale: 1.5 },
  'furniture-desk': { width: 48, height: 32, frameRate: 0, scale: 1 },
  'furniture-chair': { width: 24, height: 32, frameRate: 0, scale: 1 },
  'furniture-computer': { width: 32, height: 24, frameRate: 0, scale: 1 },
  'decoration-plant': { width: 16, height: 24, frameRate: 0, scale: 1 },
  'decoration-coffee': { width: 12, height: 16, frameRate: 0, scale: 1 },
  'obstacle-cone': { width: 16, height: 24, frameRate: 0, scale: 1 },
  'obstacle-barrier': { width: 48, height: 32, frameRate: 0, scale: 1 },
};

// Classe para gerenciar sprites pixel art
export class SpriteManager {
  private scene: Phaser.Scene;
  private loadedSprites: Map<SpriteType, Phaser.GameObjects.Sprite> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  // Gerar sprite pixel art programaticamente (sem assets externos)
  generatePixelSprite(type: SpriteType): Phaser.GameObjects.Graphics {
    const graphics = this.scene.add.graphics();
    const config = SPRITE_CONFIGS[type];

    switch (type) {
      case 'character-idle':
        this.drawCharacterIdle(graphics, config);
        break;
      case 'character-walk':
        this.drawCharacterWalk(graphics, config);
        break;
      case 'character-work':
        this.drawCharacterWork(graphics, config);
        break;
      case 'character-celebrate':
        this.drawCharacterCelebrate(graphics, config);
        break;
      case 'character-blocked':
        this.drawCharacterBlocked(graphics, config);
        break;
      case 'furniture-desk':
        this.drawDesk(graphics, config);
        break;
      case 'furniture-chair':
        this.drawChair(graphics, config);
        break;
      case 'furniture-computer':
        this.drawComputer(graphics, config);
        break;
      case 'decoration-plant':
        this.drawPlant(graphics, config);
        break;
      case 'decoration-coffee':
        this.drawCoffee(graphics, config);
        break;
      case 'obstacle-cone':
        this.drawCone(graphics, config);
        break;
      case 'obstacle-barrier':
        this.drawBarrier(graphics, config);
        break;
    }

    return graphics;
  }

  // Personagem idle (parado)
  private drawCharacterIdle(graphics: Phaser.GameObjects.Graphics, config: SpriteConfig) {
    const scale = config.scale;
    graphics.scale(scale, scale);

    // Corpo
    graphics.fillStyle(0x4a90d9, 1);
    graphics.fillRect(10, 10, 12, 14);

    // Cabeça
    graphics.fillStyle(0xffdbac, 1);
    graphics.fillCircle(16, 8, 6);

    // Olhos
    graphics.fillStyle(0x000000, 1);
    graphics.fillRect(13, 7, 2, 2);
    graphics.fillRect(17, 7, 2, 2);

    // Pernas
    graphics.fillStyle(0x2c3e50, 1);
    graphics.fillRect(11, 24, 4, 6);
    graphics.fillRect(17, 24, 4, 6);

    // Braços
    graphics.fillStyle(0xffdbac, 1);
    graphics.fillRect(6, 12, 4, 8);
    graphics.fillRect(22, 12, 4, 8);
  }

  // Personagem andando
  private drawCharacterWalk(graphics: Phaser.GameObjects.Graphics, config: SpriteConfig) {
    const scale = config.scale;
    graphics.scale(scale, scale);

    // Similar ao idle, mas com pernas em posição de caminhada
    graphics.fillStyle(0x4a90d9, 1);
    graphics.fillRect(10, 10, 12, 14);

    graphics.fillStyle(0xffdbac, 1);
    graphics.fillCircle(16, 8, 6);

    graphics.fillStyle(0x000000, 1);
    graphics.fillRect(13, 7, 2, 2);
    graphics.fillRect(17, 7, 2, 2);

    // Pernas em movimento
    graphics.fillStyle(0x2c3e50, 1);
    graphics.fillRect(9, 24, 4, 6);
    graphics.fillRect(19, 24, 4, 6);

    graphics.fillStyle(0xffdbac, 1);
    graphics.fillRect(6, 12, 4, 8);
    graphics.fillRect(22, 12, 4, 8);
  }

  // Personagem trabalhando
  private drawCharacterWork(graphics: Phaser.GameObjects.Graphics, config: SpriteConfig) {
    const scale = config.scale;
    graphics.scale(scale, scale);

    // Corpo inclinado
    graphics.fillStyle(0x4a90d9, 1);
    graphics.fillRect(8, 12, 14, 12);

    graphics.fillStyle(0xffdbac, 1);
    graphics.fillCircle(16, 10, 6);

    graphics.fillStyle(0x000000, 1);
    graphics.fillRect(13, 9, 2, 2);
    graphics.fillRect(17, 9, 2, 2);

    // Braços na posição de digitação
    graphics.fillStyle(0xffdbac, 1);
    graphics.fillRect(4, 18, 8, 4);
    graphics.fillRect(20, 18, 8, 4);

    graphics.fillStyle(0x2c3e50, 1);
    graphics.fillRect(11, 24, 4, 6);
    graphics.fillRect(17, 24, 4, 6);
  }

  // Personagem comemorando
  private drawCharacterCelebrate(graphics: Phaser.GameObjects.Graphics, config: SpriteConfig) {
    const scale = config.scale;
    graphics.scale(scale, scale);

    graphics.fillStyle(0x27ae60, 1);
    graphics.fillRect(10, 10, 12, 14);

    graphics.fillStyle(0xffdbac, 1);
    graphics.fillCircle(16, 8, 6);

    // Olhos felizes (arco)
    graphics.lineStyle(2, 0x000000);
    graphics.beginPath();
    graphics.arc(14, 8, 2, 0, Math.PI);
    graphics.strokePath();
    graphics.beginPath();
    graphics.arc(18, 8, 2, 0, Math.PI);
    graphics.strokePath();

    // Braços levantados
    graphics.fillStyle(0xffdbac, 1);
    graphics.fillRect(4, 4, 4, 8);
    graphics.fillRect(24, 4, 4, 8);

    graphics.fillStyle(0x2c3e50, 1);
    graphics.fillRect(11, 24, 4, 6);
    graphics.fillRect(17, 24, 4, 6);
  }

  // Personagem bloqueado
  private drawCharacterBlocked(graphics: Phaser.GameObjects.Graphics, config: SpriteConfig) {
    const scale = config.scale;
    graphics.scale(scale, scale);

    graphics.fillStyle(0x95a5a6, 1);
    graphics.fillRect(10, 10, 12, 14);

    graphics.fillStyle(0xffdbac, 1);
    graphics.fillCircle(16, 8, 6);

    // Expressão triste
    graphics.fillStyle(0x000000, 1);
    graphics.fillRect(13, 7, 2, 2);
    graphics.fillRect(17, 7, 2, 2);

    // Boca triste
    graphics.lineStyle(2, 0x000000);
    graphics.beginPath();
    graphics.arc(16, 14, 3, Math.PI, 0);
    graphics.strokePath();

    graphics.fillStyle(0x2c3e50, 1);
    graphics.fillRect(11, 24, 4, 6);
    graphics.fillRect(17, 24, 4, 6);

    graphics.fillStyle(0xffdbac, 1);
    graphics.fillRect(6, 12, 4, 8);
    graphics.fillRect(22, 12, 4, 8);
  }

  // Mesa
  private drawDesk(graphics: Phaser.GameObjects.Graphics, config: SpriteConfig) {
    // Tampo da mesa
    graphics.fillStyle(0x8b4513, 1);
    graphics.fillRect(0, 10, 48, 6);

    // Pernas
    graphics.fillStyle(0x5d3a1a, 1);
    graphics.fillRect(4, 16, 4, 16);
    graphics.fillRect(40, 16, 4, 16);

    // Gavetas
    graphics.fillStyle(0x6b4423, 1);
    graphics.fillRect(12, 12, 10, 4);
    graphics.fillRect(26, 12, 10, 4);

    // Puxadores
    graphics.fillStyle(0xc0c0c0, 1);
    graphics.fillRect(16, 13, 2, 2);
    graphics.fillRect(30, 13, 2, 2);
  }

  // Cadeira
  private drawChair(graphics: Phaser.GameObjects.Graphics, config: SpriteConfig) {
    // Assento
    graphics.fillStyle(0x2c3e50, 1);
    graphics.fillRect(4, 14, 16, 6);

    // Encosto
    graphics.fillStyle(0x34495e, 1);
    graphics.fillRect(4, 2, 4, 12);

    // Pernas
    graphics.fillStyle(0x1a252f, 1);
    graphics.fillRect(4, 20, 2, 12);
    graphics.fillRect(18, 20, 2, 12);
  }

  // Computador
  private drawComputer(graphics: Phaser.GameObjects.Graphics, config: SpriteConfig) {
    // Monitor
    graphics.fillStyle(0x2c3e50, 1);
    graphics.fillRect(4, 2, 24, 16);

    // Tela
    graphics.fillStyle(0x3498db, 1);
    graphics.fillRect(6, 4, 20, 12);

    // Base
    graphics.fillStyle(0x34495e, 1);
    graphics.fillRect(12, 18, 8, 4);
    graphics.fillRect(8, 22, 16, 2);
  }

  // Planta
  private drawPlant(graphics: Phaser.GameObjects.Graphics, config: SpriteConfig) {
    // Vaso
    graphics.fillStyle(0xd35400, 1);
    graphics.fillRect(4, 14, 8, 10);

    // Terra
    graphics.fillStyle(0x5d4037, 1);
    graphics.fillRect(5, 14, 6, 3);

    // Folhas
    graphics.fillStyle(0x27ae60, 1);
    graphics.fillCircle(8, 8, 4);
    graphics.fillCircle(4, 10, 3);
    graphics.fillCircle(12, 10, 3);
  }

  // Café
  private drawCoffee(graphics: Phaser.GameObjects.Graphics, config: SpriteConfig) {
    // Xícara
    graphics.fillStyle(0xecf0f1, 1);
    graphics.fillRect(2, 6, 8, 8);

    // Alça
    graphics.lineStyle(2, 0xecf0f1);
    graphics.beginPath();
    graphics.arc(12, 10, 3, -Math.PI / 2, Math.PI / 2);
    graphics.strokePath();

    // Café
    graphics.fillStyle(0x6f4e37, 1);
    graphics.fillRect(3, 7, 6, 4);

    // Vapor
    graphics.lineStyle(1, 0xbdc3c7);
    graphics.beginPath();
    graphics.moveTo(4, 4);
    graphics.lineTo(4, 2);
    graphics.moveTo(6, 5);
    graphics.lineTo(6, 1);
    graphics.moveTo(8, 4);
    graphics.lineTo(8, 2);
    graphics.strokePath();
  }

  // Cone
  private drawCone(graphics: Phaser.GameObjects.Graphics, config: SpriteConfig) {
    // Base
    graphics.fillStyle(0xff6b00, 1);
    graphics.fillRect(2, 20, 12, 4);

    // Corpo
    graphics.fillStyle(0xff6b00, 1);
    graphics.fillRect(4, 16, 8, 4);
    graphics.fillRect(6, 12, 4, 4);
    graphics.fillRect(7, 8, 2, 4);

    // Listras brancas
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(4, 18, 8, 2);
    graphics.fillRect(6, 14, 4, 2);
  }

  // Barreira
  private drawBarrier(graphics: Phaser.GameObjects.Graphics, config: SpriteConfig) {
    // Postes
    graphics.fillStyle(0xe74c3c, 1);
    graphics.fillRect(2, 0, 4, 32);
    graphics.fillRect(42, 0, 4, 32);

    // Barra
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(2, 10, 44, 6);

    // Listras vermelhas
    graphics.fillStyle(0xe74c3c, 1);
    for (let i = 0; i < 4; i++) {
      graphics.fillRect(2 + i * 12, 10, 6, 6);
    }
  }
}

export default SpriteManager;
