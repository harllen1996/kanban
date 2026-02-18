/**
 * Sistema de Spritesheets - Pixel Art Profissional
 * Sprint 4: Pixel Art profissional
 */

import Phaser from 'phaser';

// Tipos de sprites
export enum SpriteType {
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  BLOCKED = 'blocked',
  DONE = 'done',
  CODE = 'code',
  BUG = 'bug',
  FEATURE = 'feature',
  RESEARCH = 'research',
  DOCS = 'docs',
  DESIGN = 'design',
  DEFAULT = 'default',
}

// Configuração de spritesheets
export interface SpritesheetConfig {
  key: string;
  frames: number;
  frameWidth: number;
  frameHeight: number;
  spacing?: number;
  margin?: number;
}

// Classe de gerenciamento de spritesheets
export class SpritesheetManager {
  private scene: Phaser.Scene;
  private spritesheets: Map<string, Phaser.GameObjects.Image> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  // Configurações de spritesheets
  private getSpriteConfig(type: SpriteType): SpritesheetConfig {
    const configs: Record<SpriteType, SpritesheetConfig> = {
      [SpriteType.TODO]: {
        key: 'sprite-todo',
        frames: 4,
        frameWidth: 32,
        frameHeight: 32,
        spacing: 2,
        margin: 2,
      },
      [SpriteType.IN_PROGRESS]: {
        key: 'sprite-inprogress',
        frames: 4,
        frameWidth: 32,
        frameHeight: 32,
        spacing: 2,
        margin: 2,
      },
      [SpriteType.BLOCKED]: {
        key: 'sprite-blocked',
        frames: 4,
        frameWidth: 32,
        frameHeight: 32,
        spacing: 2,
        margin: 2,
      },
      [SpriteType.DONE]: {
        key: 'sprite-done',
        frames: 4,
        frameWidth: 32,
        frameHeight: 32,
        spacing: 2,
        margin: 2,
      },
      [SpriteType.CODE]: {
        key: 'sprite-code',
        frames: 6,
        frameWidth: 40,
        frameHeight: 40,
        spacing: 4,
        margin: 4,
      },
      [SpriteType.BUG]: {
        key: 'sprite-bug',
        frames: 6,
        frameWidth: 40,
        frameHeight: 40,
        spacing: 4,
        margin: 4,
      },
      [SpriteType.FEATURE]: {
        key: 'sprite-feature',
        frames: 6,
        frameWidth: 40,
        frameHeight: 40,
        spacing: 4,
        margin: 4,
      },
      [SpriteType.RESEARCH]: {
        key: 'sprite-research',
        frames: 6,
        frameWidth: 40,
        frameHeight: 40,
        spacing: 4,
        margin: 4,
      },
      [SpriteType.DOCS]: {
        key: 'sprite-docs',
        frames: 6,
        frameWidth: 40,
        frameHeight: 40,
        spacing: 4,
        margin: 4,
      },
      [SpriteType.DESIGN]: {
        key: 'sprite-design',
        frames: 6,
        frameWidth: 40,
        frameHeight: 40,
        spacing: 4,
        margin: 4,
      },
      [SpriteType.DEFAULT]: {
        key: 'sprite-default',
        frames: 4,
        frameWidth: 32,
        frameHeight: 32,
        spacing: 2,
        margin: 2,
      },
    };
    return configs[type];
  }

  // Obter cores baseadas no tipo
  private getSpriteColors(type: SpriteType): {
    bg: string;
    primary: string;
    secondary: string;
    accent: string;
  } {
    const colors: Record<
      SpriteType,
      { bg: string; primary: string; secondary: string; accent: string }
    > = {
      [SpriteType.TODO]: {
        bg: '#2d3436',
        primary: '#636e72',
        secondary: '#b2bec3',
        accent: '#74b9ff',
      },
      [SpriteType.IN_PROGRESS]: {
        bg: '#0984e3',
        primary: '#74b9ff',
        secondary: '#0984e3',
        accent: '#0984e3',
      },
      [SpriteType.BLOCKED]: {
        bg: '#d63031',
        primary: '#ff7675',
        secondary: '#d63031',
        accent: '#d63031',
      },
      [SpriteType.DONE]: {
        bg: '#00b894',
        primary: '#55efc4',
        secondary: '#00b894',
        accent: '#00b894',
      },
      [SpriteType.CODE]: {
        bg: '#6c5ce7',
        primary: '#a29bfe',
        secondary: '#6c5ce7',
        accent: '#6c5ce7',
      },
      [SpriteType.BUG]: {
        bg: '#e17055',
        primary: '#fab1a0',
        secondary: '#e17055',
        accent: '#e17055',
      },
      [SpriteType.FEATURE]: {
        bg: '#00cec9',
        primary: '#81ecec',
        secondary: '#00cec9',
        accent: '#00cec9',
      },
      [SpriteType.RESEARCH]: {
        bg: '#fdcb6e',
        primary: '#ffeaa7',
        secondary: '#fdcb6e',
        accent: '#fdcb6e',
      },
      [SpriteType.DOCS]: {
        bg: '#e84393',
        primary: '#fab1a0',
        secondary: '#e84393',
        accent: '#e84393',
      },
      [SpriteType.DESIGN]: {
        bg: '#fd79a8',
        primary: '#e84393',
        secondary: '#fd79a8',
        accent: '#fd79a8',
      },
      [SpriteType.DEFAULT]: {
        bg: '#2d3436',
        primary: '#636e72',
        secondary: '#b2bec3',
        accent: '#74b9ff',
      },
    };
    return colors[type];
  }

  // Gerar spritesheet proceduralmente
  private generateSpritesheet(type: SpriteType): Phaser.GameObjects.Image {
    const config = this.getSpriteConfig(type);
    const margin = config.margin || 0;
    const spacing = config.spacing || 0;

    const canvas = document.createElement('canvas');
    canvas.width = config.frameWidth * config.frames + margin * 2 + spacing * (config.frames - 1);
    canvas.height = config.frameHeight + margin * 2;
    const ctx = canvas.getContext('2d')!;

    const colors = this.getSpriteColors(type);

    for (let frame = 0; frame < config.frames; frame++) {
      const x = margin + frame * (config.frameWidth + spacing);
      const y = margin;
      this.drawFrame(ctx, x, y, config.frameWidth, config.frameHeight, colors, frame, type);
    }

    this.scene.textures.addCanvas(config.key, canvas);
    const sprite = this.scene.add.image(0, 0, config.key);
    return sprite;
  }

  // Desenhar frame do sprite
  private drawFrame(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    colors: { bg: string; primary: string; secondary: string; accent: string },
    frame: number,
    type: SpriteType
  ) {
    // Fundo
    ctx.fillStyle = colors.bg;
    ctx.fillRect(x, y, width, height);

    // Pixel art baseado no tipo
    const pixelSize = 4;

    if (type === SpriteType.CODE) {
      this.drawCodeSprite(ctx, x, y, width, height, frame);
    } else if (type === SpriteType.BUG) {
      this.drawBugSprite(ctx, x, y, pixelSize, colors, frame);
    } else if (type === SpriteType.FEATURE) {
      this.drawFeatureSprite(ctx, x, y, pixelSize, colors, frame);
    } else if (type === SpriteType.DONE) {
      this.drawDoneSprite(ctx, x, y, width, height, frame);
    } else if (type === SpriteType.BLOCKED) {
      this.drawBlockedSprite(ctx, x, y, width, height, frame);
    } else {
      this.drawDefaultSprite(ctx, x, y, pixelSize, colors, frame);
    }
  }

  // Sprite de código
  private drawCodeSprite(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    _width: number,
    _height: number,
    frame: number
  ) {
    const chars = ['{', '<', '>', '}', '|', '/', '\\', '[', ']'];
    const char = chars[frame % chars.length];
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(char, x + 20, y + 20);
  }

  // Sprite de bug
  private drawBugSprite(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    pixelSize: number,
    colors: { primary: string },
    frame: number
  ) {
    ctx.fillStyle = colors.primary;
    const offset = (frame % 2) * pixelSize;
    ctx.fillRect(x + 12 + offset, y + 8, pixelSize * 2, pixelSize * 2);
    ctx.fillRect(x + 24 - offset, y + 8, pixelSize * 2, pixelSize * 2);
    ctx.fillRect(x + 16, y + 16, pixelSize * 2, pixelSize * 4);
    ctx.fillRect(x + 8, y + 20, pixelSize * 6, pixelSize * 2);
  }

  // Sprite de feature
  private drawFeatureSprite(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    pixelSize: number,
    colors: { primary: string },
    frame: number
  ) {
    ctx.fillStyle = colors.primary;
    const offset = (frame % 2) * pixelSize;
    // Estrela
    ctx.fillRect(x + 16 + offset, y + 4, pixelSize * 2, pixelSize * 2);
    ctx.fillRect(x + 12 + offset, y + 12, pixelSize * 10, pixelSize * 2);
    ctx.fillRect(x + 8 + offset, y + 20, pixelSize * 6, pixelSize * 2);
    ctx.fillRect(x + 20 + offset, y + 20, pixelSize * 6, pixelSize * 2);
  }

  // Sprite de done
  private drawDoneSprite(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    _width: number,
    _height: number,
    frame: number
  ) {
    ctx.fillStyle = '#55efc4';
    const offset = (frame % 2) * 2;
    // Checkmark
    ctx.fillRect(x + 8 + offset, y + 16, 4, 4);
    ctx.fillRect(x + 12 + offset, y + 20, 4, 4);
    ctx.fillRect(x + 16 + offset, y + 12, 4, 12);
  }

  // Sprite de blocked
  private drawBlockedSprite(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    _width: number,
    _height: number,
    frame: number
  ) {
    ctx.fillStyle = '#ff7675';
    const offset = (frame % 2) * 2;
    // X
    ctx.fillRect(x + 10 + offset, y + 10, 4, 4);
    ctx.fillRect(x + 18 + offset, y + 10, 4, 4);
    ctx.fillRect(x + 14 + offset, y + 14, 4, 4);
    ctx.fillRect(x + 10 + offset, y + 18, 4, 4);
    ctx.fillRect(x + 18 + offset, y + 18, 4, 4);
  }

  // Sprite padrão
  private drawDefaultSprite(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    pixelSize: number,
    colors: { primary: string },
    frame: number
  ) {
    ctx.fillStyle = colors.primary;
    const offset = (frame % 2) * pixelSize * 0.5;
    // Robô simples
    ctx.fillRect(x + 8 + offset, y + 8, pixelSize * 2, pixelSize * 2);
    ctx.fillRect(x + 20 + offset, y + 8, pixelSize * 2, pixelSize * 2);
    ctx.fillRect(x + 8, y + 16, pixelSize * 4, pixelSize * 2);
    ctx.fillRect(x + 20, y + 16, pixelSize * 4, pixelSize * 2);
    ctx.fillRect(x + 12, y + 24, pixelSize * 2, pixelSize * 2);
  }

  // Obter sprite
  getSprite(type: SpriteType): Phaser.GameObjects.Image {
    const key = `sprite-${type}`;
    if (this.spritesheets.has(key)) {
      return this.spritesheets.get(key)!;
    }
    const sprite = this.generateSpritesheet(type);
    this.spritesheets.set(key, sprite);
    return sprite;
  }

  // Destruir
  destroy() {
    this.spritesheets.forEach((sprite) => sprite.destroy());
    this.spritesheets.clear();
  }
}

export default SpritesheetManager;
