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
      // Physics mode constants
      PHYSICS: {
        GRAVITY_FACTOR: 0.25,           // Multiplier for PHYSICS.GRAVITY.y
        DAMPING: 0.92,                  // Velocity damping per frame
        DAMPING_NO_ANCHOR: 0.9,         // Damping when no anchor present
        GRAVITY_EXTRA_DAMPING: 0.85,    // Extra gravity damping factor
        MAX_SPEED: 2.3,                 // Maximum physics velocity magnitude
        DEFAULT_ATTRACTION: 0.1,        // Default attraction to anchor
        DEFAULT_ORBIT_IMPULSE: 0.12,    // Default tangential orbit force
        WIND_VERTICAL_FACTOR: 0.015,    // Wind vertical component factor
        CLEAR_ANCHOR_DAMPING_X: 0.9,    // X velocity damping when clearing anchor
        CLEAR_ANCHOR_DAMPING_Y: 0.99,   // Y velocity damping when clearing anchor
      },
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
      DEFAULT_ANGLE_DEG: -12,
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
        INTENSITY_MULTIPLIER: 1,
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
        stemColor: "rgba(34, 139, 34, 1)",       // Vert forêt vibrant (H=120°, S=61%, L=34%)
        leafColor: "rgba(50, 205, 50, 1)",       // Lime green éclatant (H=120°, S=61%, L=50%)
        fadedLeafColor: "rgba(107, 142, 35, 1)", // Olive vibrant (H=80°, S=61%, L=35%)
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
        radius: 10,
        color: "rgba(138, 43, 226, 0.22)",      // BlueViolet vibrant (S=68%, augmente alpha)
        maxParticles: 40,
        spawnPerFrame: 1,
        particleLife: 8,
        particleSpeed: 0.4,
        particleRadiusRange: [1, 4],
        particleColor: "rgba(147, 51, 255, 1)", // Violet saturé intense (S=80%)
        auraRings: 3,
        baseAlpha: 0.15,                        // Augmenté pour plus de présence
        particleBoostAlpha: 0.32,               // Augmenté pour particules plus visibles
        burstParticles: 36,
        burstLife: 12,
        burstSpeed: 1.2,
        attractionStrength: 0.4,
        orbitImpulse: 0.18,
        radiusMultiplier: 2.6,
        gravityFallSpeedMultiplier: 0.9,
        physicsDamping: 0.88,
      },
      INTENSITY_MULTIPLIER: 1,
    },
    RAIN: {
      DROPS_PER_FRAME: 1,
    },
    LIGHTING: {
      INTENSITY_MULTIPLIER: 0.7,
      MIN_ALPHA: 0.05,
      MAX_ALPHA: 1,
    },
    CONTROL_PANEL: {
      CONTAINER_ID: "control-panel",
      CONTROLS: [
        {
          id: "playing",
          label: "playback",
          type: "toggle",
          default: true,
        },
        {
          id: "lightIntensity",
          label: "light intensity",
          type: "range",
          min: 0.2,
          max: 1,
          step: 0.05,
          default: 0.7,
        },
        {
          id: "rainDensity",
          label: "rain density",
          type: "range",
          min: 0,
          max: 5,
          step: 0.5,
          default: 1,
        },
        {
          id: "auraRadiusMultiplier",
          label: "aura reach",
          type: "range",
          min: 1,
          max: 5,
          step: 0.1,
          default: 2.6,
        },
        {
          id: "auraAttraction",
          label: "aura pull",
          type: "range",
          min: 0.01,
          max: 0.4,
          step: 0.01,
          default: 0.4,
        },
        {
          id: "windIntensity",
          label: "wind strength",
          type: "range",
          min: 0,
          max: 2,
          step: 0.05,
          default: 1,
        },
        {
          id: "windAngle",
          label: "wind angle",
          type: "range",
          min: -45,
          max: 45,
          step: 1,
          default: -12,
        },
        {
          id: "auraIntensity",
          label: "aura glow",
          type: "range",
          min: 0,
          max: 2,
          step: 0.05,
          default: 1,
        },
        {
          id: "burstIntensity",
          label: "click burst",
          type: "range",
          min: 1,
          max: 2,
          step: 0.05,
          default: 1.25,
        },
        {
          id: "orbitImpulse",
          label: "orbit spin",
          type: "range",
          min: 0,
          max: 0.3,
          step: 0.01,
          default: 0.18,
        },
      ],
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
  static dimColor(color, distance, resolution, lightTint = null) {
    const parsed = this.parseRgba(color);
    if (!parsed) {
      return color;
    }
    const lighting = this.CONSTANTS.LIGHTING || {};
    const multiplier =
      typeof lighting.INTENSITY_MULTIPLIER === "number"
        ? lighting.INTENSITY_MULTIPLIER
        : 1;

    const distanceFactor = Number.isFinite(distance)
      ? Math.max(0, 1 - distance / resolution)
      : 0;
    const lightStrength = distanceFactor * multiplier;

    // Convert to HSL to preserve hue and saturation
    const hsl = this.rgbToHsl(parsed.r, parsed.g, parsed.b);

    // Only dim the lightness, keep hue and saturation intact
    const minLightness = 0.05; // Minimum lightness to avoid pure black
    const targetLightness = hsl.l * lightStrength;
    // Cap lightness to never exceed original (prevents white desaturation when lightStrength > 1)
    hsl.l = Math.max(minLightness, Math.min(hsl.l, targetLightness));

    // Convert back to RGB
    let rgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);

    // Apply light tint if present (subtle warm/cool shift)
    if (lightTint && typeof lightTint.r === "number") {
      const tintStrength = Math.max(0, Math.min(0.15, lightStrength * 0.25));
      rgb.r = rgb.r + (lightTint.r - rgb.r) * tintStrength;
      rgb.g = rgb.g + (lightTint.g - rgb.g) * tintStrength;
      rgb.b = rgb.b + (lightTint.b - rgb.b) * tintStrength;
    }

    return this.composeRgba(rgb.r, rgb.g, rgb.b, parsed.a);
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

  static parseRgba(color) {
    if (!color) return null;
    const cleaned = color.replace(/\s+/g, "");
    const match = /rgba?\(([^)]+)\)/.exec(cleaned);
    if (!match) return null;
    const parts = match[1].split(",").map(Number);
    if (parts.length < 3) return null;
    const [r, g, b, a = 1] = parts;
    return {
      r: Number.isFinite(r) ? r : 0,
      g: Number.isFinite(g) ? g : 0,
      b: Number.isFinite(b) ? b : 0,
      a: Number.isFinite(a) ? a : 1,
    };
  }

  static composeRgba(r, g, b, a) {
    const clamp = (val) => Math.max(0, Math.min(255, val));
    const clampAlpha = Math.max(0, Math.min(1, a));
    return `rgba(${Math.round(clamp(r))}, ${Math.round(clamp(g))}, ${Math.round(
      clamp(b)
    )}, ${clampAlpha.toFixed(2)})`;
  }

  // Convert RGB to HSL (preserves hue and saturation)
  static rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;

    if (max === min) {
      return { h: 0, s: 0, l };
    }

    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    let h;
    if (max === r) {
      h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    } else if (max === g) {
      h = ((b - r) / d + 2) / 6;
    } else {
      h = ((r - g) / d + 4) / 6;
    }

    return { h, s, l };
  }

  // Convert HSL back to RGB
  static hslToRgb(h, s, l) {
    if (s === 0) {
      const gray = Math.round(l * 255);
      return { r: gray, g: gray, b: gray };
    }

    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    return {
      r: Math.round(hue2rgb(p, q, h + 1/3) * 255),
      g: Math.round(hue2rgb(p, q, h) * 255),
      b: Math.round(hue2rgb(p, q, h - 1/3) * 255)
    };
  }

  /**
   * Applies the global lighting multiplier to a color string.
   * @param {string} color
   * @returns {string}
   * @static
   */
  static applyLighting(color) {
    const parsed = this.parseRgba(color);
    if (!parsed) return color;
    const lighting = this.CONSTANTS.LIGHTING || {};
    const multiplier =
      typeof lighting.INTENSITY_MULTIPLIER === "number"
        ? lighting.INTENSITY_MULTIPLIER
        : 1;
    const minAlpha =
      typeof lighting.MIN_ALPHA === "number" ? lighting.MIN_ALPHA : 0;
    const maxAlpha =
      typeof lighting.MAX_ALPHA === "number" ? lighting.MAX_ALPHA : 1;

    const adjustedAlpha = Math.max(
      minAlpha,
      Math.min(maxAlpha, parsed.a * multiplier)
    );
    return this.composeRgba(parsed.r, parsed.g, parsed.b, adjustedAlpha);
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
    if (!image || !Number.isFinite(resolution) || resolution <= 0) {
      return [];
    }

    if (
      (!image.pixels || !image.pixels.length) &&
      typeof image.loadPixels === "function"
    ) {
      image.loadPixels();
    }

    const width = image.width || 0;
    const height = image.height || 0;
    if (!width || !height) {
      return [];
    }

    const data = image.pixels || [];
    const pixels = [];

    for (let y = 0; y < height; y += resolution) {
      const row = [];
      for (let x = 0; x < width; x += resolution) {
        const sampleWidth = Math.min(resolution, width - x);
        const sampleHeight = Math.min(resolution, height - y);
        if (sampleWidth <= 0 || sampleHeight <= 0) {
          row.push("rgba(0, 0, 0, 0)");
          continue;
        }

        const sum = [0, 0, 0, 0];
        let count = 0;

        for (let j = 0; j < sampleHeight; j++) {
          const rowOffset = y + j;
          for (let i = 0; i < sampleWidth; i++) {
            const col = x + i;
            const index = (rowOffset * width + col) * 4;

            sum[0] += data[index] ?? 0;
            sum[1] += data[index + 1] ?? 0;
            sum[2] += data[index + 2] ?? 0;
            sum[3] += data[index + 3] ?? 0;
            count++;
          }
        }

        if (count === 0) {
          row.push("rgba(0, 0, 0, 0)");
          continue;
        }

        const avg = sum.map((c) => c / count);
        const r = Math.round(Math.max(0, Math.min(255, avg[0])));
        const g = Math.round(Math.max(0, Math.min(255, avg[1])));
        const b = Math.round(Math.max(0, Math.min(255, avg[2])));
        const alpha = Math.max(0, Math.min(1, avg[3] / 255));
        row.push(`rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`);
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
