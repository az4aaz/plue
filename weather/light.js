import { Utils } from "./constants.js";

export class LightSource {
    /**
     * A single light source that emits to a certain radius around it.
     *
     * @param { NeoPixelGrid } grid   The grid to draw the light source on.
     * @param { { x: number, y: number } } mouse  The mouse position.
     * @param { number } radius   The radius of the light source.
     * @param { string } color    The color of the light source.
     * @property { number } lightingArea The area around the light source that is lit.
     */
    constructor(grid, mouse, radius = 20, color = "rgba(255, 255, 255)") {
        this.grid = grid;
        this.mouse = mouse;
        this.radius = radius;
        this.color = color;
        this.x = this.mouse.x;
        this.y = this.mouse.y;
        this.lightingArea = radius * 1.2;
    }

    /**
     * Renders the light source.
     */
    render() {
        this.grid.p.fill(this.color);
        this.grid.p.ellipse(this.x, this.y, this.radius, this.radius);
    }

    /**
     * Moves the light source.
     */
    move() {
        this.x = this.mouse.x;
        this.y = this.mouse.y;
    }

    /**
     * How far is this object from the light source ?
     * @param { number } x The x-coordinate of the object.
     * @param { number } y The y-coordinate of the object.
     * @returns { number } The distance from the light source
     */
    distance(x, y) {
        let neoX = this.x / this.grid.resolution;
        let neoY = this.y / this.grid.resolution;
        return Math.sqrt((neoX - x) ** 2 + (neoY - y) ** 2) / this.lightingArea;
    }
}

export class SuspendedLantern extends LightSource {
    /**
     * A single light source that emits to a certain radius around it and is suspended by a chain.
     *
     * @param { NeoPixelGrid } grid   The grid to draw the light source on.
     * @param { { x: number, y: number } } mouse  The mouse position.
     * @param { number } radius   The radius of the light source.
     * @param { string } color    The color of the light source.
     * @property { number } lightingArea The area around the light source that is lit.
     */
    constructor(grid, mouse, radius = 20, color = "rgba(255, 255, 255)") {
        super(grid, mouse, radius, color);
        this.chainLinkNumber = 10;
        this.chainLinkLength = 10;
        this.chainLinkRadius = 5;
        this.chainLinks = [];
        this.generateChainLinks();

        this.lanternX = this.x;
        this.lanternY = this.y + this.chainLinkNumber * this.chainLinkLength;
    }

    /**
     * Generates the chain links.
     */
    generateChainLinks() {
        for (let i = 0; i < this.chainLinkNumber; i++) {
            this.chainLinks.push({
                x: this.x,
                y: this.y + i * this.chainLinkLength,
            });
        }
        for (let i = 1; i < this.chainLinkNumber; i++) {
            this.chainLinks[i].y =
                this.chainLinks[i - 1].y + this.chainLinkLength;
            this.chainLinks[i].x = this.chainLinks[i - 1].x;
        }
    }
    /**
     * Moves the light source.
     */
    move() {
        // Calculate the difference between the current mouse position and the previous mouse position
        let dx = this.mouse.x - this.x;
        let dy = this.mouse.y - this.y;

        // Calculate the angle of the chain link based on the mouse movement
        let angle = Math.atan2(dy, dx);

        // Update the position of the first chain link
        this.chainLinks[0].x = this.mouse.x;
        this.chainLinks[0].y = this.mouse.y;

        // Update the position of the other chain links
        for (let i = 1; i < this.chainLinkNumber; i++) {
            // Calculate the new position of the chain link
            let newX =
                this.chainLinks[i - 1].x +
                this.chainLinkLength * Math.cos(angle);
            let newY =
                this.chainLinks[i - 1].y +
                this.chainLinkLength * Math.sin(angle);

            // Apply a delay to the movement of the chain link
            this.chainLinks[i].x = Utils.lerp(this.chainLinks[i].x, newX, 0.1);
            this.chainLinks[i].y = Utils.lerp(this.chainLinks[i].y, newY, 0.1);
        }

        // The lantern is the last chain link
        this.lanternX = this.chainLinks[this.chainLinkNumber - 1].x;
        this.lanternY = this.chainLinks[this.chainLinkNumber - 1].y;
    }

    /**
     * Renders the lantern and the chain.
     */
    render() {
        this.grid.p.fill(this.color);
        this.chainLinks.forEach((link) => {
            this.grid.p.ellipse(
                link.x,
                link.y,
                this.chainLinkRadius,
                this.radius
            );
        });
        // The lanter is the last chain link
        this.grid.p.ellipse(
            this.lanternX,
            this.lanternY,
            this.radius,
            this.radius
        );
    }
}
