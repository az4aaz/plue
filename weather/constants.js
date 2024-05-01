export class Utils {
  /**
   * Contains constants used in the rain animation.
   */
  static CONSTANTS = {
    CANVAS_ID: "rain",
    MIN_LINE_LENGTH: 3,
    MAX_LINE_LENGTH: 6,
    MIN_WIDTH: 2,
    MAX_WIDTH: 5,
    MIN_SPLASHES: 1,
    MAX_SPLASHES: 5,
    MIN_SPEED: 15,
    MAX_SPEED: 30,
    MAX_SPLASH_SIZE: 5,
    MOUSE_RADIUS: 45,
    RAIN_STEPS: 10,
    RAINDROP_COLOR: "rgba(255, 255, 255)",
    SPLASH_DURATION: 100,
    GROUND_LEVEL: 10,
    RESOLUTION: 2.5,
    GRAVITY: 0.3,
  };

  /**
   * Generates a random number between min and max.
   *
   * @param { number } min
   * @param { number } max
   * @returns { number }
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
   */
  static calculateSpeed(resolution) {
    let randomSpeed = this.randomBetween(
      this.CONSTANTS.MIN_SPEED,
      this.CONSTANTS.MAX_SPEED
    );
    return randomSpeed / resolution;
  }

  /**
   * Calculates the splash size based on the resolution.
   * The splash size is directly proportional to the resolution.
   *
   * @param { number } resolution
   * @returns { number }
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
   */
  static calculateMouseRadius(resolution) {
    return resolution * 15;
  }
}
