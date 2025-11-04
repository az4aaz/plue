import { Utils } from "../constants.js";
import { LightingCalculator } from "../utils/LightingCalculator.js";

export class ClimbingPlants {
  constructor(grid, lights, options = {}) {
    this.grid = grid;
    this.lights = lights;
    this.options = Utils.mergeOptions(
      Utils.CONSTANTS.PLANTS.DEFAULTS,
      options
    );
    this.groundLevel = this.grid.height - Utils.CONSTANTS.GROUND.LEVEL;
    this.pixelMap = new Map();
    this.generatePlants();
    this.pixels = Array.from(this.pixelMap.values());

    this.lightingCalculator = new LightingCalculator(grid, lights, {
      lightMovementThreshold: 2
    });
  }

  get cachedShadedColors() {
    return this.lightingCalculator.cachedShadedColors;
  }

  generatePlants() {
    const startXs = this.pickStartColumns();
    for (const startX of startXs) {
      this.generateVine(startX);
    }
  }

  pickStartColumns() {
    const columns = [];
    const margin = 2;
    const maxColumns = Math.max(1, Math.min(this.options.vineCount, this.grid.width));
    const availableRange = Math.max(0, this.grid.width - margin * 2 - 1);

    for (let i = 0; i < maxColumns; i++) {
      const fraction = i / Math.max(1, maxColumns - 1);
      const column = Math.floor(margin + fraction * availableRange);
      columns.push(this.clampX(column));
    }

    return columns;
  }

  generateVine(startX) {
    let currentX = startX;
    let longBranchesMade = 0;
    const opts = this.options;
    for (let y = this.groundLevel; y >= 0; y--) {
      this.addPixel(currentX, y, opts.stemColor);

      if (Math.random() < opts.leafProbability) {
        this.addLeafCluster(currentX, y);
      } else if (Math.random() < opts.sparseLeafProbability) {
        this.addSparseLeaf(currentX, y);
      }

      if (
        y < this.groundLevel - 4 &&
        longBranchesMade < opts.maxLongBranches &&
        Math.random() < opts.longBranchProbability
      ) {
        const direction = Math.random() < 0.5 ? -1 : 1;
        const branchLength = this.randomLength(
          opts.minLongBranchLength,
          opts.maxLongBranchLength
        );
        this.generateLongBranch(currentX, y, direction, branchLength);
        longBranchesMade++;
      } else if (Math.random() < opts.branchProbability) {
        const direction = Math.random() < 0.5 ? -1 : 1;
        const branchLength =
          1 + Math.floor(Math.random() * Math.max(1, opts.branchLength));
        this.generateBranch(currentX, y, direction, branchLength);
      }

      const drift = Math.floor(
        Utils.randomBetween(-opts.meander, opts.meander + 1)
      );
      currentX = this.clampX(currentX + drift);
    }
  }

  generateBranch(startX, startY, direction, length) {
    let x = startX;
    const sparseLeafProbability = this.options.sparseLeafProbability;
    for (let i = 1; i <= length; i++) {
      x = this.clampX(x + direction);
      const y = Math.max(0, startY - i);
      this.addPixel(x, y, this.options.stemColor);
      if (Math.random() < 0.4) {
        this.addLeafCluster(x, y);
      } else if (Math.random() < sparseLeafProbability) {
        this.addSparseLeaf(x, y);
      }
    }
  }

  generateLongBranch(startX, startY, direction, length) {
    let x = startX;
    let y = startY;
    const opts = this.options;
    for (let i = 1; i <= length; i++) {
      const horizontalStep =
        1 + (Math.random() < opts.longBranchExtraHorizontalChance ? 1 : 0);
      x = this.clampX(x + direction * horizontalStep);

      if (Math.random() < opts.longBranchVerticalRiseChance) {
        y = this.clampY(y - 1);
      } else if (Math.random() < opts.longBranchDroopChance) {
        y = this.clampY(y + 1);
      }

      this.addPixel(x, y, opts.stemColor);

      if (Math.random() < 0.5) {
        this.addLeafCluster(x, y);
      } else if (Math.random() < opts.sparseLeafProbability) {
        this.addSparseLeaf(x, y);
      }

      if (Math.random() < opts.longBranchSproutChance) {
        const sproutDirection = Math.random() < 0.5 ? -direction : direction;
        this.generateSprout(x, y, sproutDirection);
      }
    }
  }

  generateSprout(startX, startY, direction) {
    let x = startX;
    let y = startY;
    const sproutLength = this.options.sproutLength;
    const length = 1 + Math.floor(Math.random() * sproutLength);
    for (let i = 0; i < length; i++) {
      x = this.clampX(x + direction);
      y = this.clampY(y - 1);
      this.addPixel(x, y, this.options.stemColor);
      if (Math.random() < 0.3) {
        this.addSparseLeaf(x, y);
      }
    }
  }

  addLeafCluster(x, y) {
    const leafColor = this.options.leafColor;
    const offsets = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: -1 },
      { x: 1, y: -1 },
      { x: -1, y: -1 },
    ];
    const clusterSize = 2 + Math.floor(Math.random() * offsets.length);
    for (let i = 0; i < clusterSize; i++) {
      const offset = offsets[Math.floor(Math.random() * offsets.length)];
      this.addPixel(x + offset.x, y + offset.y, leafColor);
    }
  }

  addSparseLeaf(x, y) {
    const fadedLeafColor = this.options.fadedLeafColor;
    this.addPixel(x, y, fadedLeafColor);
    if (Math.random() < 0.3) {
      const offsetX = Math.random() < 0.5 ? -1 : 1;
      this.addPixel(this.clampX(x + offsetX), y, fadedLeafColor);
    }
  }

  addPixel(x, y, color) {
    const clampedX = this.clampX(x);
    const clampedY = this.clampY(y);
    const key = `${clampedX},${clampedY}`;
    this.pixelMap.set(key, { x: clampedX, y: clampedY, color });
  }

  clampX(x) {
    return Math.min(this.grid.width - 1, Math.max(0, x));
  }

  clampY(y) {
    return Math.min(this.grid.height - 1, Math.max(0, y));
  }

  render() {
    this.lightingCalculator.render(this.pixels, (px, color) => {
      this.grid.setPixel(px.x, px.y, color);
    });
  }

  randomLength(min, max) {
    return Math.max(min, Math.floor(Utils.randomBetween(min, max + 1)));
  }
}
