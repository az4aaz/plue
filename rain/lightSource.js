export class LightSource {
    constructor(x, y, brightness) {
        this.x = x;
        this.y = y;
        this.brightness = brightness;
    }

    render(ctx) {
        ctx.beginPath();
        ctx.rect(this.x, this.y - this.brightness, 3, 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fill();
        ctx.closePath();
    }

    move() {
        // Code to move the light source
        // This will depend on how you want the light source to move
    }
}