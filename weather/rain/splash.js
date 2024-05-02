import { Utils } from "../constants.js";
export class Splash {
  /**
   * Responsible for generating and moving a single splash.
   *
   * @param { NeoPixelGrid } grid The grid to draw the splashes on.
   * @param { { x: number, y: number } } mouse  The mouse position.
   * @param { number } dropX  The x-coordinate of the raindrop.
   * @param { number } dropY  The y-coordinate of the raindrop.
   * @property { number } x The x-coordinate of the splash.
   * @property { number } y The y-coordinate of the splash.
   * @property { number } size The size of the splash.
   * @property { number } speed The speed of the splash.
   * @property { number } startTime The time when the splash was created.é
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
