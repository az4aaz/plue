import { Utils } from "../constants.js";
export class Splash {
  /**
   * Responsible for generating and moving splashes.
   *
   * @param { NeoPixelGrid } grid
   * @param { { x: number, y: number } } mouse
   * @param { number } dropX
   * @param { number } dropY
   * @property { number } x
   * @property { number } y
   * @property { number } size
   * @property { number } speed
   * @property { number } startTime
   */
  constructor(grid, mouse, dropX, dropY) {
    this.grid = grid;
    this.mouse = mouse;
    this.x = dropX;
    this.y = dropY;
    this.speed = Math.random() * 2;
    this.startTime = performance.now();
    this.currentTime = this.startTime;
  }

  move() {
    this.y -= this.speed;
    this.x += Math.floor(Math.random() * 2 - 1);
  }

  update() {
    this.currentTime = performance.now();
    this.move();
    this.render();
  }

  render() {
    if (this.y < this.grid.height - 1 && this.y > this.grid.height) {
      this.grid.setPixel(this.x, this.y, Utils.CONSTANTS.RAINDROP_COLOR);
    }
  }
}
