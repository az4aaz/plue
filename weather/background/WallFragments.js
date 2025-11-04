import { Utils } from "../constants.js";
import { LightingCalculator } from "../utils/LightingCalculator.js";

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

    this.lightingCalculator = new LightingCalculator(grid, lights, {
      lightMovementThreshold: 2
    });
  }

  get cachedShadedColors() {
    return this.lightingCalculator.cachedShadedColors;
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

  render() {
    this.lightingCalculator.render(this.pixels, (px, color) => {
      this.grid.setPixel(px.x, px.y, color);
    });
  }
}
