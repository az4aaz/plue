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
    this.size = Math.random() * CONSTANTS.MAX_SPLASH_SIZE;
    this.speed = Math.random() * 2;
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

  render() {
    this.ctx.fillStyle = this.CONSTANTS.RAINDROP_COLOR;
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    this.ctx.closePath();
    this.ctx.fill();
  }
}
