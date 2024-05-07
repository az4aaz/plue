import { PhysicsObject } from "../physics/object.js";

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
      let x = Math.floor(this.position.x + this.radius * Math.cos(i));
      let y = Math.floor(this.position.y + this.radius * Math.sin(i));
      y += this.radius;
      this.grid.setPixel(x, y, this.color);
    }
  }
}
