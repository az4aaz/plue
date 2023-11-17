import { Canvas } from "./canvas.js";

console.log("rain/splash.js has been loaded.");

export class Splash {
  /**
   * Responsible for generating and moving splashes.
   *
   * @param { Object.<string, number> } CONSTANTS
   * @param { Canvas } canvas
   * @param { { x: number, y: number } } mouse
   * @param { number } dropX
   * @param { number } dropY
   * @property { number } x
   * @property { number } y
   * @property { number } size
   * @property { number } speed
   * @property { number } angle
   * @property { number } startTime
   */
  constructor(CONSTANTS, canvas, mouse, dropX, dropY) {
    this.CONSTANTS = CONSTANTS;
    this.canvas = canvas;
    this.mouse = mouse;
    this.ctx = this.canvas.ctx;
    this.x = dropX;
    this.y = dropY;
    this.startTime = performance.now();
    this.currentTime = this.startTime;
  }

  move() {
    this.y += this.speed * Math.sin(this.angle);
    this.x += this.speed * Math.cos(this.angle);
  }

  update() {
    this.currentTime = performance.now();
    this.move();
    this.render();
  }

  render(ctx, lightSource) {
    // Calculate distance to light source
    let dx = this.x - lightSource.x;
    let dy = this.y - lightSource.y;
    let distance = Math.sqrt(dx * dx + dy * dy);

    // If distance is within range
    if (distance <= lightSource.brightness) {
      let alpha =
        1 - (distance / lightSource.brightness) * (this.y / ctx.canvas.height);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.rect(this.x, this.y, this.size, this.size);
      ctx.fill();
      ctx.closePath();
    }
  }
}
