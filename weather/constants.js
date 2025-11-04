export class Utils {
  /**
   * Contains constants used in the rain animation.
   */
  static CONSTANTS = {
    CANVAS: {
      ID: "rain",
      BACKGROUND_COLOR: "#131313",
      RESOLUTION: 5,
    },
    RAINDROP: {
      COLOR: "rgba(255, 255, 255, 1)",
      MIN_SPEED: 20,
      MAX_SPEED: 90,
      MIN_LINE_LENGTH: 2,
      MAX_LINE_LENGTH: 4,
      STEPS: 10,
    },
    SPLASH: {
      MIN_SPLASHES: 1,
      MAX_SPLASHES: 5,
      DURATION: 100,
      MAX_SIZE: 5,
    },
    WIND: {
      MIN_STRENGTH: 1,
      MAX_STRENGTH: 4,
    },
    MOUSE: {
      RADIUS: 45,
      REPULSION_STRENGTH: 8,
    },
    GROUND: {
      LEVEL: 5,
    },
    PHYSICS: {
      GRAVITY: {
        x: 0,
        y: 0.3,
      },
      GRAVITY_DIVISOR: 1,
      MAX_DIFFERENCE: 10,
      MAX_ADJUSTMENT: 10,
      MAX_VELOCITY_CORRECTION: 10,
      CONSTRAINT_ITERATIONS: 5,
      WIND: {
        BASE_STRENGTH: 0.1,
        VARIATION_STRENGTH: 0.08,
        FREQUENCY: 0.02,
        GUST_FREQUENCY: 0.005,
        GUST_STRENGTH: 0.2,
      },
      TILT: {
        DISPLACEMENT_FACTOR: 1.5,
        INTERPOLATION: 0.05,
        ANGLE_MULTIPLIER: 0.1,
      },
    },
    PLANTS: {
      DEFAULTS: {
        vineCount: 4,
        branchLength: 3,
        meander: 0.8,
        branchProbability: 0.18,
        leafProbability: 0.25,
        sparseLeafProbability: 0.1,
        maxLongBranches: 2,
        longBranchProbability: 0.2,
        minLongBranchLength: 6,
        maxLongBranchLength: 14,
        longBranchVerticalRiseChance: 0.35,
        longBranchDroopChance: 0.15,
        longBranchExtraHorizontalChance: 0.35,
        longBranchSproutChance: 0.12,
        sproutLength: 2,
        stemColor: "rgba(52, 101, 36, 1)",
        leafColor: "rgba(48, 105, 54, 1)",
        fadedLeafColor: "rgba(68, 120, 68, 1)",
      },
    },
    WALL: {
      DEFAULTS: {
        clusterCountFactor: 3500,
        minClusterCount: 3,
        minHeightFactor: 0.18,
        maxHeightFactor: 0.78,
        mortarAlphaRange: [0.04, 0.08],
        brickAlphaRange: [0.08, 0.16],
        brickGrayRange: [60, 92],
        mortarGrayRange: [45, 65],
        erosionChance: 0.25,
      },
    },
    AURA: {
      DEFAULTS: {
        radius: 20,
        color: "rgba(170, 120, 255, 0.18)",
        maxParticles: 44,
        spawnPerFrame: 1,
        particleLife: 10,
        particleSpeed: 0.5,
        particleRadiusRange: [2, 6],
        particleColor: "rgba(190, 140, 255, 1)",
        auraRings: 3,
        baseAlpha: 0.08,
        particleBoostAlpha: 0.22,
      },
    },
  };

  /**
   * Generates a random number between min and max.
   *
   * @param { number } min
   * @param { number } max
   * @returns { number }
   * @static
   */
  static randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  /**
   * Calculates the speed of the raindrop based on the resolution.
   * The speed is inversely proportional to the resolution.
   *
   * @param { number } resolution
   * @returns { number }
   * @static
   */
  static calculateSpeed(resolution) {
    let randomSpeed = this.randomBetween(
      this.CONSTANTS.RAINDROP.MIN_SPEED,
      this.CONSTANTS.RAINDROP.MAX_SPEED
    );
    return randomSpeed / resolution;
  }

  /**
   * Calculates the splash size based on the resolution.
   * The splash size is directly proportional to the resolution.
   *
   * @param { number } resolution
   * @returns { number }
   * @static
   */
  static calculateSplashSize(resolution) {
    return resolution / 2;
  }

  /**
   * Calculates the mouse radius based on the resolution.
   * The mouse radius is directly proportional to the resolution.
   *
   * @param { number } resolution
   * @returns { number }
   * @static
   */
  static calculateMouseRadius(resolution) {
    return resolution * 15;
  }

  /**
   * Dims the color based on the distance from the light source.
   * The closer the object is to the light source, the brighter it is.
   * The farther the object is from the light source, the dimmer it is.
   *
   * @param { string } color  The color to dim.
   * @param { number } distance The distance from the light source.
   * @param { number } resolution The resolution of the grid.
   * @returns { string }
   * @static
   */
  static dimColor(color, distance, resolution) {
    let alpha = Math.max(0.1, Math.min(1, 1 - distance / resolution));
    // Extract RGB values directly from the color string
    const lastComma = color.lastIndexOf(',');
    if (lastComma === -1) return color;
    const rgbPart = color.substring(0, lastComma);
    return `${rgbPart}, ${alpha})`;
  }

  /**
   * Lerp function.
   * Linear interpolation between two values.
   * @param { number } a The first value.
   * @param { number } b The second value.
   * @param { number } t The interpolation factor.
   * @returns { number }
   * @static
   */
  static lerp(a, b, t) {
    return (1 - t) * a + t * b;
  }

  /**
   * Calculates the weight of an object.
   * @param { number } mass The mass of the object.
   * @returns { number }
   * @static
   */
  static weight(mass) {
    return mass * this.CONSTANTS.PHYSICS.GRAVITY.y;
  }

  /**
   * Apply gravity to an object.
   * @param { number } y The y-coordinate of the object.
   * @param { number } mass The mass of the object.
   * @returns { number }
   * @static
   */
  static applyGravity(y, mass) {
    return y + this.weight(mass);
  }

  /**
   * Apply wind to an object.
   * @param { number } x The x-coordinate of the object.
   * @returns { number }
   * @static
   */
  static applyWind(x) {
    const randomChance = Math.random();
    if (randomChance <= 0.1) {
      return (
        x +
        this.randomBetween(
          this.CONSTANTS.WIND.MIN_STRENGTH,
          this.CONSTANTS.WIND.MAX_STRENGTH
        )
      );
    } else {
      return x + this.CONSTANTS.WIND.MIN_STRENGTH;
    }
  }

  /**
   * Returns the same color but with a different alpha value.
   * @param { string } color The color to change.
   * @param { number } alpha The new alpha value.
   * @returns { string }
   * @static
   */
  static alternateColor(color, alpha) {
    const lastComma = color.lastIndexOf(',');
    if (lastComma === -1) return color;
    const rgbPart = color.substring(0, lastComma);
    return `${rgbPart}, ${alpha})`;
  }

  /**
   * Merge a set of options with defaults without mutating either source.
   * @param {object} defaults
   * @param {object} [overrides]
   * @returns {object}
   * @static
   */
  static mergeOptions(defaults, overrides = {}) {
    return { ...defaults, ...(overrides || {}) };
  }

  /**
   * Convert an image into the grid system using pixel averaging.
   * @param { p5.image } image The image to convert.
   * @param { number } resolution The resolution of the grid.
   * @returns { Array<Array<string>> }
   * @static
   */
  static imageToGrid(image, resolution) {
    let pixels = [];
    let width = image.width;
    let height = image.height;
    for (let y = 0; y < height; y += resolution) {
      let row = [];
      for (let x = 0; x < width; x += resolution) {
        let sum = [0, 0, 0];
        let count = 0;
        for (let j = 0; j < resolution; j++) {
          for (let i = 0; i < resolution; i++) {
            let index = (x + i + (y + j) * width) * 4;
            sum[0] += image.pixels[index];
            sum[1] += image.pixels[index + 1];
            sum[2] += image.pixels[index + 2];
            count++;
          }
        }
        let avg = sum.map((c) => c / count);
        row.push(`rgba(${avg[0]}, ${avg[1]}, ${avg[2]})`);
      }
      pixels.push(row);
    }
    return pixels;
  }

  static normalizeVector(vector) {
    let length = Math.sqrt(vector.x ** 2 + vector.y ** 2);
    return { x: vector.x / length, y: vector.y / length };
  }

  static dotProduct(vector1, vector2) {
    return vector1.x * vector2.x + vector1.y * vector2.y;
  }

  static multiplyVector(vector, scalar) {
    return { x: vector.x * scalar, y: vector.y * scalar };
  }

  static subtractVector(vector1, vector2) {
    return { x: vector1.x - vector2.x, y: vector1.y - vector2.y };
  }

  static addVector(vector1, vector2) {
    return { x: vector1.x + vector2.x, y: vector1.y + vector2.y };
  }
}
