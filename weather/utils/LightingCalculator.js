import { Utils } from "../constants.js";

// Cache lighting calculations for static objects like walls and plants
export class LightingCalculator {
  constructor(grid, lights, options = {}) {
    this.grid = grid;
    this.lights = lights;
    this.cachedLightPositions = [];
    this.cachedShadedColors = new Map();
    this.lightMovementThreshold = options.lightMovementThreshold ?? 2;
  }

  haveLightsMoved() {
    if (this.cachedLightPositions.length !== this.lights.length) return true;

    for (let i = 0; i < this.lights.length; i++) {
      const light = this.lights[i];
      const cached = this.cachedLightPositions[i];
      const dx = Math.abs((light.cachedNeoX || light.x) - cached.x);
      const dy = Math.abs((light.cachedNeoY || light.y) - cached.y);
      if (dx > this.lightMovementThreshold || dy > this.lightMovementThreshold) {
        return true;
      }
    }
    return false;
  }

  updateCachedLightPositions() {
    this.cachedLightPositions = this.lights.map(light => ({
      x: light.cachedNeoX || light.x,
      y: light.cachedNeoY || light.y,
    }));
  }

  clearCache() {
    this.cachedShadedColors.clear();
  }

  getShadedColor(pixel, lightsHaveMoved) {
    const key = `${pixel.x},${pixel.y}`;
    if (!lightsHaveMoved && this.cachedShadedColors.has(key)) {
      return this.cachedShadedColors.get(key);
    }

    let minDist = Infinity;
    let closest = null;
    for (const light of this.lights) {
      const dist = light.distance(pixel.x, pixel.y);
      if (dist < minDist) {
        minDist = dist;
        closest = light;
        if (minDist < 0.3) break;
      }
    }

    const color = minDist !== Infinity
      ? Utils.dimColor(pixel.color, minDist, this.grid.resolution, closest?.tintColor)
      : pixel.color;

    this.cachedShadedColors.set(key, color);
    return color;
  }

  render(pixels, callback) {
    if (!pixels?.length) return;

    const moved = this.haveLightsMoved();
    for (const px of pixels) {
      callback(px, this.getShadedColor(px, moved));
    }
    if (moved) this.updateCachedLightPositions();
  }
}
