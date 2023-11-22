console.log("rain/element.js");

export class RectElement {
    constructor(CONSTANTS, canvas, minX, minY, maxX, maxY) {
        this.CONSTANTS = CONSTANTS;
        this.canvas = canvas;
        this.ctx = canvas.ctx;
        this.minX = minX;
        this.minY = minY;
        this.maxX = maxX;
        this.maxY = maxY;
    }

    render() {
        this.ctx.fillStyle = this.CONSTANTS.GROUND_COLOR;
        this.ctx.fillRect(
            this.minX,
            this.minY,
            this.maxX - this.minX,
            this.maxY - this.minY
        );
    }

    isInElement(x, y) {
        return x > this.minX && x < this.maxX && y > this.minY && y < this.maxY;
    }
}
