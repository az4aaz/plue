import { Utils } from "../constants.js";
import { LightSource } from "../light.js";

export class Raindrop {
    /**
     * Responsible for generating and moving a single raindrop.
     *
     * @param { NeoPixelGrid } grid The grid to draw the raindrops on.
     * @param { { x: number, y: number } } mouse  The mouse position.
     * @param { LightSource } light  The light source.
     * @property { number } lineLength  The length of the raindrop.
     * @property { number } x The x-coordinate of the raindrop.
     * @property { number } y The y-coordinate of the raindrop.
     * @property { number } width The width of the raindrop.
     * @property { number } speed The speed of the raindrop.
     */
    constructor(grid, mouse, light) {
        this.grid = grid;
        this.mouse = mouse;
        this.light = light;
        this.lineLength = Math.floor(
            Utils.randomBetween(
                Utils.CONSTANTS.MIN_LINE_LENGTH,
                Utils.CONSTANTS.MAX_LINE_LENGTH
            )
        );
        this.x = Math.floor(
            Utils.randomBetween(-this.grid.width, this.grid.width)
        );
        this.y = -this.lineLength;
        this.width = Utils.randomBetween(
            Utils.CONSTANTS.MIN_WIDTH,
            Utils.CONSTANTS.MAX_WIDTH
        );
        this.speed = Math.floor(
            Utils.calculateSpeed(this.grid.resolution) + this.width
        );
        this.angle = Math.PI / 2 - 0.2;
        this.cosAngle = Math.cos(this.angle);
        this.sinAngle = Math.sin(this.angle);
    }

    /**
     * Moves the raindrop.
     */
    move() {
        let newX = this.x + this.cosAngle * this.speed;
        let newY = this.y + this.sinAngle * this.speed;

        if (newX | (0 !== this.x) | 0 || newY | (0 !== this.y) | 0) {
            this.x = newX;
            this.y = newY;
        }
    }

    /**
     * Renders the raindrop.
     */
    render() {
        let cosI = this.cosAngle;
        let sinI = this.sinAngle;
        for (let i = 0; i < this.lineLength; i++) {
            let x = (this.x + cosI * i) | 0;
            let y = (this.y + sinI * i) | 0;
            // We dim the color of the raindrop depending on the distance from the light source.
            let distance = this.light.distance(x, y);
            let color = Utils.dimColor(
                Utils.CONSTANTS.RAINDROP_COLOR,
                distance,
                this.grid.resolution
            );
            this.grid.setPixel(x, y, color);
            cosI += this.cosAngle;
            sinI += this.sinAngle;
        }
    }

    /**
     * Checks if the raindrop is on the ground.
     *
     * @returns { boolean } True if the raindrop is on the ground, false otherwise.
     */
    isOnTheGround() {
        return this.y >= this.grid.height - Utils.CONSTANTS.GROUND_LEVEL;
    }

    /**
     * Checks if the raindrop is on the canvas.
     *
     * @returns { boolean } True if the raindrop is on the canvas, false otherwise.
     */
    isOnCanvas() {
        return (
            this.x <= this.grid.width &&
            this.y <= this.grid.height - Utils.CONSTANTS.GROUND_LEVEL
        );
    }

    /**
     * Checks if the raindrop is in the mouse radius.
     *
     * @returns { boolean } True if the raindrop is in the mouse radius, false otherwise.
     */
    isInMouseRadius() {
        return (
            this.x <= this.mouse.x + Utils.CONSTANTS.MOUSE_RADIUS &&
            this.x >= this.mouse.x - Utils.CONSTANTS.MOUSE_RADIUS &&
            this.y <= this.mouse.y + Utils.CONSTANTS.MOUSE_RADIUS &&
            this.y >= this.mouse.y - Utils.CONSTANTS.MOUSE_RADIUS
        );
    }
}
