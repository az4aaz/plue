import { LightSource } from "../light.js";
import { Utils } from "../constants.js";

export class PurpleAura extends LightSource {
  constructor(grid, mouse, options = {}) {
    const defaults = Utils.CONSTANTS.AURA.DEFAULTS;
    const mergedOptions = Utils.mergeOptions(defaults, options);
    const { radius, color, ...rest } = mergedOptions;
    super(grid, mouse, radius, color);
    this.isAura = true;
    this.options = rest;
    this.particles = [];
    this.burstParticles = [];
    const fallbackBase = this.extractRgb(defaults.color);
    const fallbackParticle = this.extractRgb(defaults.particleColor);
    this.baseColor = this.extractRgb(color) ?? fallbackBase;
    this.particleColor =
      this.extractRgb(this.options.particleColor) ?? fallbackParticle;
    this.maxParticleRadius = this.options.particleRadiusRange[1];
    this.centerOffsetRadius = Math.max(1, Math.floor(this.radius / this.grid.resolution));
    this.falloffKernel = this.buildFalloffKernel();
  }

  move() {
    super.move();
    this.spawnParticles();
    this.updateParticles();
    this.updateBurstParticles();
  }

  spawnParticles() {
    const {
      maxParticles,
      spawnPerFrame,
      particleSpeed,
      particleLife,
      particleRadiusRange,
    } = this.options;
    const [minRadius, maxRadius] = particleRadiusRange;

    for (let i = 0; i < spawnPerFrame; i++) {
      if (this.particles.length >= maxParticles) {
        break;
      }
      const angle = Utils.randomBetween(0, Math.PI * 2);
      const speed = Utils.randomBetween(particleSpeed * 0.4, particleSpeed);
      const radius = Utils.randomBetween(minRadius, maxRadius);
      this.particles.push({
        x: this.x + Utils.randomBetween(-6, 6),
        y: this.y + Utils.randomBetween(-6, 6),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: particleLife,
        maxLife: particleLife,
        radius,
      });
    }
  }

  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= 0.96;
      particle.vy *= 0.96;
      particle.life -= 1;

      if (particle.life <= 0) {
        this.particles[i] = this.particles[this.particles.length - 1];
        this.particles.pop();
      }
    }
  }

  updateBurstParticles() {
    for (let i = this.burstParticles.length - 1; i >= 0; i--) {
      const particle = this.burstParticles[i];
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vx *= 0.92;
      particle.vy *= 0.92;
      particle.life -= 1;

      if (particle.life <= 0) {
        this.burstParticles[i] = this.burstParticles[this.burstParticles.length - 1];
        this.burstParticles.pop();
      }
    }
  }

  render() {
    const res = this.grid.resolution;
    const centerX = Math.floor(this.x / res);
    const centerY = Math.floor(this.y / res);
    const width = this.grid.width;
    const height = this.grid.height;
    const maxParticleRadius = this.maxParticleRadius;
    const lighting = Utils.CONSTANTS.LIGHTING || {};
    const auraConfig = Utils.CONSTANTS.AURA || {};
    const lightingScale =
      typeof lighting.INTENSITY_MULTIPLIER === "number"
        ? lighting.INTENSITY_MULTIPLIER
        : 1;
    const auraScale =
      typeof auraConfig.INTENSITY_MULTIPLIER === "number"
        ? auraConfig.INTENSITY_MULTIPLIER
        : 1;
    const auraMultiplier = Math.max(
      0,
      Math.min(1.5, lightingScale * auraScale)
    );

    for (const offset of this.falloffKernel) {
      const gridX = centerX + offset.dx;
      const gridY = centerY + offset.dy;
      if (gridX < 0 || gridX >= width || gridY < 0 || gridY >= height) {
        continue;
      }
      this.applyAuraPixel(
        gridX,
        gridY,
        offset.alpha * auraMultiplier,
        this.baseColor
      );
    }

    for (const particle of this.particles) {
      const lifeProgress = particle.life / particle.maxLife;
      if (lifeProgress <= 0) {
        continue;
      }

      const gridX = Math.floor(particle.x / res);
      const gridY = Math.floor(particle.y / res);
      if (gridX < 0 || gridX >= width || gridY < 0 || gridY >= height) {
        continue;
      }

      const tintAlpha =
        this.options.particleBoostAlpha *
        lifeProgress *
        (particle.radius / maxParticleRadius) *
        auraMultiplier;

      this.applyAuraPixel(gridX, gridY, tintAlpha, this.particleColor);

      if (particle.radius > 3) {
        const neighbors = [
          [gridX + 1, gridY],
          [gridX - 1, gridY],
          [gridX, gridY + 1],
          [gridX, gridY - 1],
        ];
        const neighborAlpha = tintAlpha * 0.35;
        for (const [nx, ny] of neighbors) {
          if (nx < 0 || nx >= width || ny < 0 || ny >= height) {
            continue;
          }
          this.applyAuraPixel(nx, ny, neighborAlpha, this.particleColor);
        }
      }
    }

    for (const particle of this.burstParticles) {
      const lifeProgress = particle.life / particle.maxLife;
      if (lifeProgress <= 0) {
        continue;
      }

      const gridX = Math.floor(particle.x / res);
      const gridY = Math.floor(particle.y / res);
      if (gridX < 0 || gridX >= width || gridY < 0 || gridY >= height) {
        continue;
      }

      const tintAlpha =
        this.options.particleBoostAlpha * 0.45 * lifeProgress * auraMultiplier;

      this.applyAuraPixel(gridX, gridY, tintAlpha, this.particleColor);
    }
  }

  applyAuraPixel(x, y, tintAlpha, tintColor) {
    const baseColor = this.grid.getPixel(x, y);
    if (!baseColor) {
      const colorString = this.composeColor(tintColor, tintAlpha);
      this.grid.setPixel(x, y, colorString);
      return;
    }

    const baseComponents = this.extractRgb(baseColor);
    if (!baseComponents) {
      return this.grid.setPixel(x, y, baseColor);
    }

    const blended = this.blendColors(baseComponents, tintColor, tintAlpha);
    const colorString = this.composeColor(blended.rgb, blended.alpha);
    this.grid.setPixel(x, y, colorString);
  }

  extractRgb(color) {
    if (!color) {
      return null;
    }
    return this.parseRgba(color);
  }

  composeColor(rgb, alpha) {
    const clampedAlpha = Math.min(1, Math.max(0, alpha));
    const roundedAlpha = Math.round(clampedAlpha * 100) / 100;
    return `rgba(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(
      rgb.b
    )}, ${roundedAlpha})`;
  }

  blendColors(base, tint, tintAlpha) {
    const blendAlpha = Math.min(1, tintAlpha);
    const outAlpha = Math.min(1, base.a + blendAlpha * (1 - base.a));
    const weightBase = base.a * (1 - blendAlpha);
    const weightTint = blendAlpha;
    const totalWeight = weightBase + weightTint || 1;

    const r = (base.r * weightBase + tint.r * weightTint) / totalWeight;
    const g = (base.g * weightBase + tint.g * weightTint) / totalWeight;
    const b = (base.b * weightBase + tint.b * weightTint) / totalWeight;

    return {
      rgb: { r, g, b },
      alpha: outAlpha,
    };
  }

  buildFalloffKernel() {
    const offsets = [];
    const radiusCells = this.centerOffsetRadius;
    const maxRadiusSq = radiusCells * radiusCells;
    const baseAlpha = this.options.baseAlpha;
    const stride = radiusCells > 18 ? 2 : 1;
    for (let dy = -radiusCells; dy <= radiusCells; dy += stride) {
      for (let dx = -radiusCells; dx <= radiusCells; dx += stride) {
        const distSq = dx * dx + dy * dy;
        if (distSq > maxRadiusSq) {
          continue;
        }
        const normalized = 1 - distSq / maxRadiusSq;
        if (normalized <= 0) {
          continue;
        }
        const alpha = baseAlpha * (normalized * normalized);
        if (alpha < 0.01) {
          continue;
        }
        offsets.push({ dx, dy, alpha });
      }
    }
    return offsets;
  }

  parseRgba(color) {
    if (!color.startsWith("rgba")) {
      return null;
    }
    const start = color.indexOf("(");
    const end = color.indexOf(")", start);
    if (start === -1 || end === -1) {
      return null;
    }
    const parts = color
      .slice(start + 1, end)
      .split(",")
      .map((value) => value.trim());
    if (parts.length !== 4) {
      return null;
    }

    const [r, g, b, a] = parts;
    return {
      r: Number(r),
      g: Number(g),
      b: Number(b),
      a: Number(a),
    };
  }

  triggerBurst() {
    const count = this.options.burstParticles ?? 24;
    const speed = this.options.burstSpeed ?? 1;
    const life = this.options.burstLife ?? 12;
    for (let i = 0; i < count; i++) {
      const angle = Utils.randomBetween(0, Math.PI * 2);
      const velocity = Utils.randomBetween(speed * 0.6, speed);
      this.burstParticles.push({
        x: this.x + Utils.randomBetween(-3, 3),
        y: this.y + Utils.randomBetween(-3, 3),
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        life,
        maxLife: life,
      });
    }
  }
}
