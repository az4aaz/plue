import { RectElement } from "./rectelement.js";
console.log("rain/raindrop.js has been loaded.");

export class Raindrop {
    /**
     * Responsible for generating and moving raindrops.
     *
     * @param { Object.<string, number> } CONSTANTS
     * @param { Canvas } canvas
     * @param { { x: number, y: number } } mouse
     * @param { Array.{RectElement} } elements
     * @property { number } lineLength
     * @property { number } x
     * @property { number } y
     * @property { number } width
     * @property { number } speed
     * @property { number } angle
     *
     */
    constructor(CONSTANTS, canvas, mouse, elements) {
        this.CONSTANTS = CONSTANTS;
        this.canvas = canvas;
        this.mouse = mouse;
        this.elements = elements;
        this.ctx = this.canvas.ctx;
        this.lineLength = Math.random() * CONSTANTS.MAX_LINE_LENGTH;
        this.x =
            this.canvas.canvasElement.width -
            Math.random() * 2 * this.canvas.canvasElement.width;
        this.y = -this.lineLength;
        this.width = Math.random() * 2;
        this.speed =
            Math.random() *
                (this.CONSTANTS.MAX_SPEED - this.CONSTANTS.MIN_SPEED) +
            this.CONSTANTS.MIN_SPEED;
        this.speed += this.CONSTANTS.GRAVITY * this.width;
        this.selfMaxSpeed = this.speed;
        this.angle = 10 * (Math.PI / 180);
        this.startTime = performance.now();
        this.currentTime = this.startTime;
        this.isDead = false;
    }

    /**
     * Moves the raindrop.
     */
    move() {
        this.x += this.speed * Math.sin(this.angle);
        this.y += this.speed * Math.cos(this.angle);
    }

    /**
     * Renders the raindrop.
     */
    render() {
        this.ctx.strokeStyle = this.CONSTANTS.RAINDROP_COLOR;
        this.ctx.lineWidth = this.width;
        this.ctx.beginPath();
        this.ctx.moveTo(this.x, this.y);
        this.ctx.lineTo(
            this.x + Math.cos(this.angle),
            this.y + Math.sin(this.angle) * this.lineLength
        );
        this.ctx.closePath();
        this.ctx.stroke();
    }

    /**
     * Updates the raindrop.
     */
    update() {
        this.currentTime = performance.now();
        this.move();
        if (this.speed < this.selfMaxSpeed) {
            this.speed += this.CONSTANTS.GRAVITY * this.width;
        }
        if (this.isHittingSmth()) {
            this.speed = 0;
            this.angle = 0;
        }
        if (this.isOnTheGround()) {
            this.triggerCollisionEvent();
            this.isDead = true;
        }
    }

    /**
     * Handles the collision between a raindrop and the ground.
     */
    triggerCollisionEvent() {
        const collisionEvent = new CustomEvent("raindropCollision", {
            detail: this,
        });
        window.dispatchEvent(collisionEvent);
    }

    /**
     * Checks if the raindrop is on the ground.
     *
     * @returns { boolean }
     */
    isOnTheGround() {
        return this.y >= this.ctx.canvas.height - this.CONSTANTS.GROUND_LEVEL;
    }

    /**
     * Checks if the raindrop is on the canvas.
     *
     * @returns { boolean }
     */
    isOnCanvas() {
        return (
            this.x <= this.canvas.canvasElement.width &&
            this.y <=
                this.canvas.canvasElement.height - this.CONSTANTS.GROUND_LEVEL
        );
    }

    /**
     * Checks if the raindrop will hit something.
     *
     * @returns { boolean }
     */
    isHittingSmth() {
        const steps = Math.ceil(this.speed);
        const stepX = (this.speed * Math.cos(this.angle)) / steps;
        const stepY = (this.speed * Math.sin(this.angle)) / steps;

        for (let i = 1; i <= steps; i++) {
            const nextX = this.x + stepX * i;
            const nextY = this.y + stepY * i;

            for (const element of this.elements) {
                if (element.isInElement(nextX, nextY)) {
                    return true;
                }
            }
        }
        return false;
    }
}
