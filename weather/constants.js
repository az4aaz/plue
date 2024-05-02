export class Utils {
    /**
     * Contains constants used in the rain animation.
     */
    static CONSTANTS = {
        CANVAS_ID: "rain",
        MIN_LINE_LENGTH: 2,
        MAX_LINE_LENGTH: 4,
        MIN_WIDTH: 2,
        MAX_WIDTH: 5,
        MIN_SPLASHES: 1,
        MAX_SPLASHES: 5,
        MIN_SPEED: 20,
        MAX_SPEED: 90,
        MAX_SPLASH_SIZE: 5,
        MOUSE_RADIUS: 45,
        RAIN_STEPS: 10,
        RAINDROP_COLOR: "rgba(255, 255, 255, 1)",
        SPLASH_DURATION: 100,
        GROUND_LEVEL: 5,
        RESOLUTION: 5,
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

    /**
     * Dims the color based on the distance from the light source.
     * The closer the object is to the light source, the brighter it is.
     * The farther the object is from the light source, the dimmer it is.
     *
     * @param { string } color  The color to dim.
     * @param { number } distance The distance from the light source.
     * @param { number } resolution The resolution of the grid.
     * @returns { string }
     */
    static dimColor(color, distance, resolution) {
        let alpha = Math.max(0.1, Math.min(1, 1 - distance / resolution));
        return color.replace(
            /rgba\((\d+), (\d+), (\d+), (\d+)\)/,
            `rgba($1, $2, $3, ${alpha})`
        );
    }

    /**
     * Lerp function.
     * Linear interpolation between two values.
     * @param { number } a The first value.
     * @param { number } b The second value.
     * @param { number } t The interpolation factor.
     * @returns { number }
     */
    static lerp(a, b, t) {
        return (1 - t) * a + t * b;
    }
}
