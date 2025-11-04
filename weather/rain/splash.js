import { Utils } from "../constants.js";
export class Splash {
  /**
   * Responsible for generating and moving a single splash.
   *
   * @param { NeoPixelGrid } grid The grid to draw the splashes on.
   * @param { { x: number, y: number } } mouse  The mouse position.
   * @param { number } dropX  The x-coordinate of the raindrop.
   * @param { number } dropY  The y-coordinate of the raindrop.
   * @param { LightSource[] } lights  The light sources.
   * @property { number } x The x-coordinate of the splash.
   * @property { number } y The y-coordinate of the splash.
   * @property { number } size The size of the splash.
   * @property { number } speed The speed of the splash.
   * @property { number } startTime The time when the splash was created.é
   */
  constructor(grid, mouse, dropX, dropY, lights) {
    this.grid = grid;
    this.mouse = mouse;
    this.lights = lights;
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

  /**
   * Renders the splash.
   */
  render() {
    const px = Math.floor(this.x);
    const py = Math.floor(this.y);
    if (py >= 0 && py < this.grid.height && px >= 0 && px < this.grid.width) {
      let minDistance = Infinity;
      for (const light of this.lights) {
        const dist = light.distance(px, py);
        if (dist < minDistance) {
          minDistance = dist;
          if (minDistance < 0.3) break;
        }
      }

      const color = Utils.dimColor(
        Utils.CONSTANTS.RAINDROP.COLOR,
        minDistance,
        this.grid.resolution
      );
      this.grid.setPixel(px, py, color);
    }
  }
}
