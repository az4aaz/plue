import { Utils } from "../constants.js";

const BRICK_PATTERNS = [
  [
    [2, 1, 1, 2],
    [1, 0, 1, 1],
    [2, 1, 1, 2],
  ],
  [
    [1, 1, 2, 1, 1],
    [2, 1, 1, 1, 2],
  ],
  [
    [2, 1, 1, 2, 1],
    [1, 0, 1, 1, 1],
    [2, 1, 1, 2, 1],
  ],
  [
    [1, 2, 1, 2, 1],
    [1, 1, 1, 1, 1],
  ],
];

export class WallFragments {
  constructor(grid, lights, options = {}) {
    this.grid = grid;
    this.lights = lights;
    this.options = Utils.mergeOptions(
      Utils.CONSTANTS.WALL.DEFAULTS,
      options
    );
    this.clusterCount =
      options.clusterCount ??
      Math.max(
        this.options.minClusterCount,
        Math.floor(
          (this.grid.width * this.grid.height) / this.options.clusterCountFactor
        )
      );
    this.groundLevel = this.grid.height - Utils.CONSTANTS.GROUND.LEVEL;
    this.pixelMap = new Map();
    this.generateFragments();
    this.pixels = Array.from(this.pixelMap.values());

    this.cachedLightPositions = [];
    this.cachedShadedColors = new Map();
    this.lightMovementThreshold = 2;
  }

  generateFragments() {
    const clusters = this.clusterCount;
    const { minHeightFactor, maxHeightFactor } = this.options;
    const minYBase = Math.floor(this.grid.height * minHeightFactor);
    const maxYBase = Math.min(
      Math.floor(this.grid.height * maxHeightFactor),
      this.groundLevel - 2
    );

    for (let i = 0; i < clusters; i++) {
      const pattern =
        BRICK_PATTERNS[Math.floor(Math.random() * BRICK_PATTERNS.length)];
      const patternHeight = pattern.length;
      const patternWidth = pattern[0].length;

      const startX = this.randomIntBetween(
        0,
        Math.max(0, this.grid.width - patternWidth)
      );
      const startY = this.randomIntBetween(
        minYBase,
        Math.max(minYBase, maxYBase - patternHeight)
      );

      this.placePattern(startX, startY, pattern);
    }
  }

  placePattern(startX, startY, pattern) {
    const {
      brickGrayRange,
      brickAlphaRange,
      mortarGrayRange,
      mortarAlphaRange,
      erosionChance,
    } = this.options;

    for (let row = 0; row < pattern.length; row++) {
      for (let col = 0; col < pattern[row].length; col++) {
        const cell = pattern[row][col];
        if (cell === 0) {
          continue;
        }

        const x = this.clampX(startX + col);
        const y = this.clampY(startY + row);

        if (Math.random() < erosionChance) {
          continue;
        }

        if (cell === 1) {
          const gray = this.randomIntBetween(
            brickGrayRange[0],
            brickGrayRange[1]
          );
          const alpha = Utils.randomBetween(
            brickAlphaRange[0],
            brickAlphaRange[1]
          );
          this.addPixel(x, y, this.toRgba(gray, alpha));
        } else if (cell === 2) {
          const gray = this.randomIntBetween(
            mortarGrayRange[0],
            mortarGrayRange[1]
          );
          const alpha = Utils.randomBetween(
            mortarAlphaRange[0],
            mortarAlphaRange[1]
          );
          this.addPixel(x, y, this.toRgba(gray, alpha));
        }
      }
    }
  }

  addPixel(x, y, color) {
    const key = `${x},${y}`;
    this.pixelMap.set(key, { x, y, color });
  }

  clampX(x) {
    return Math.min(this.grid.width - 1, Math.max(0, x));
  }

  clampY(y) {
    return Math.min(this.grid.height - 1, Math.max(0, y));
  }

  toRgba(gray, alpha) {
    return `rgba(${gray}, ${gray}, ${gray}, ${alpha})`;
  }

  randomIntBetween(min, max) {
    return Math.floor(Utils.randomBetween(min, max + 1));
  }

  haveLightsMoved() {
    if (this.cachedLightPositions.length !== this.lights.length) {
      return true;
    }
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
    this.cachedLightPositions = this.lights.map((light) => ({
      x: light.cachedNeoX || light.x,
      y: light.cachedNeoY || light.y,
    }));
  }

  render() {
    if (!this.pixels.length) {
      return;
    }

    const lightsHaveMoved = this.haveLightsMoved();

    for (const pixel of this.pixels) {
      const pixelKey = `${pixel.x},${pixel.y}`;
      let shadedColor;

      if (!lightsHaveMoved && this.cachedShadedColors.has(pixelKey)) {
        shadedColor = this.cachedShadedColors.get(pixelKey);
      } else {
        let minDistance = Infinity;
        for (const light of this.lights) {
          const distance = light.distance(pixel.x, pixel.y);
          if (distance < minDistance) {
            minDistance = distance;
            if (minDistance < 0.3) break;
          }
        }

        shadedColor =
          minDistance !== Infinity
            ? Utils.dimColor(pixel.color, minDistance, this.grid.resolution)
            : pixel.color;

        this.cachedShadedColors.set(pixelKey, shadedColor);
      }

      this.grid.setPixel(pixel.x, pixel.y, shadedColor);
    }

    if (lightsHaveMoved) {
      this.updateCachedLightPositions();
    }
  }
}
