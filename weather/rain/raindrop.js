import { Utils } from "../constants.js";
import { LightSource } from "../light.js";

export class Raindrop {
  /**
   * Responsible for generating and moving a single raindrop.
   *
   * @param { NeoPixelGrid } grid The grid to draw the raindrops on.
   * @param { { x: number, y: number } } mouse  The mouse position.
   * @param { LightSource[] } lights  The light sources.
   * @property { number } lineLength  The length of the raindrop.
   * @property { number } x The x-coordinate of the raindrop.
   * @property { number } y The y-coordinate of the raindrop.
   * @property { number } mass The mass of the raindrop.
   * @property { number } weight The weight of the raindrop.
   * @property { number } speed The speed of the raindrop.
   *
   * @todo Adapt width and speed to the new weight system | constants.js -> weight()
   */
  constructor(grid, mouse, lights) {
    this.grid = grid;
    this.mouse = mouse;
    this.lights = lights;
    this.lineLength = Math.floor(
      Utils.randomBetween(
        Utils.CONSTANTS.RAINDROP.MIN_LINE_LENGTH,
        Utils.CONSTANTS.RAINDROP.MAX_LINE_LENGTH
      )
    );
    this.x = Math.floor(Utils.randomBetween(-this.grid.width, this.grid.width));
    this.y = -this.lineLength;
    this.mass = this.lineLength / 10;
    this.weight = Utils.weight(this.mass);
    this.speed = Utils.calculateSpeed(this.grid.resolution) + this.weight;
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
    for (let i = 0; i < this.lineLength; i++) {
      let x = (this.x + this.cosAngle * i) | 0;
      let y = (this.y + this.sinAngle * i) | 0;

      let minDistance = Infinity;
      for (const light of this.lights) {
        const dist = light.distance(x, y);
        if (dist < minDistance) {
          minDistance = dist;
          if (minDistance < 0.3) break;
        }
      }

      let color = Utils.dimColor(
        Utils.CONSTANTS.RAINDROP.COLOR,
        minDistance,
        this.grid.resolution
      );
      this.grid.setPixel(x, y, color);
    }
  }

  /**
   * Checks if the raindrop is on the ground.
   *
   * @returns { boolean } True if the raindrop is on the ground, false otherwise.
   */
  isOnTheGround() {
    return this.y >= this.grid.height - Utils.CONSTANTS.GROUND.LEVEL;
  }

  /**
   * Checks if the raindrop is on the canvas.
   *
   * @returns { boolean } True if the raindrop is on the canvas, false otherwise.
   */
  isOnCanvas() {
    return (
      this.x <= this.grid.width &&
      this.y <= this.grid.height - Utils.CONSTANTS.GROUND.LEVEL
    );
  }

  /**
   * Checks if the raindrop is in the mouse radius.
   *
   * @returns { boolean } True if the raindrop is in the mouse radius, false otherwise.
   */
  isInMouseRadius() {
    return (
      this.x <= this.mouse.x + Utils.CONSTANTS.MOUSE.RADIUS &&
      this.x >= this.mouse.x - Utils.CONSTANTS.MOUSE.RADIUS &&
      this.y <= this.mouse.y + Utils.CONSTANTS.MOUSE.RADIUS &&
      this.y >= this.mouse.y - Utils.CONSTANTS.MOUSE.RADIUS
    );
  }
}
