import { PhysicsObject } from "../physics/object.js";
import { Fire } from "./Fire.js";
import { Utils } from "../constants.js";

export class Lantern extends PhysicsObject {
  /**
   * A lantern that got physics.
   *
   * @param { NeoPixelGrid } grid The grid to draw the lantern on.
   * @param { number } x The x-coordinate of the lantern.
   * @param { number } y The y-coordinate of the lantern.
   * @param { number } mass The mass of the lantern.
   * @param { number } radius The radius of the lantern.
   * @param { number } chainLinkLength The length of the chain. (needed to calculate the offset for the rendering)
   * @param { string } color The color of the lantern.
   */
  constructor(
    grid,
    x,
    y,
    mass,
    chainLinkLength,
    color = "rgba(255, 255, 255)",
    radius = 20
  ) {
    super(x, y, mass);
    this.grid = grid;
    this.radius = radius;
    this.color = color;
    this.chainLinkLength = chainLinkLength;
    this.fire = new Fire(x, y, this.radius / 3, this.grid);
  }

  /**
   * Updates the lantern.
   * @override
   */
  update() {
    super.update();
    this.fire.update();
  }

  checkCollisionWithGround() {
    let pixelGroundLevel =
      (this.grid.height - Utils.CONSTANTS.GROUND.LEVEL - 2 * this.radius) *
      this.grid.resolution;
    if (this.position.y + this.radius >= pixelGroundLevel) {
      this.position.y = pixelGroundLevel;
      this.velocity.y = -this.velocity.y * 0.5;
      this.velocity.x *= 0.8;
    }
  }

  /**
   * Renders the lantern.
   */
  render() {
    for (
      let i = 0;
      i < 2 * Math.PI;
      i += Math.PI / (this.grid.resolution * 10)
    ) {
      let x = Math.floor(
        (this.position.x + this.radius * this.grid.resolution * Math.cos(i)) /
          this.grid.resolution
      );
      let y = Math.floor(
        (this.position.y + this.radius * this.grid.resolution * Math.sin(i)) /
          this.grid.resolution
      );
      y += this.radius;
      this.grid.setPixel(x, y, this.color);
      this.fire.x = this.position.x;
      this.fire.y = this.position.y + this.radius * this.grid.resolution;
      this.fire.render();
    }
  }
}
