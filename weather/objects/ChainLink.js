import { PhysicsObject, Constraint } from "../physics/object.js";
import { Utils } from "../constants.js";

export class ChainLink extends PhysicsObject {
  /**
   * A chain link that got physics.
   *
   * @param { NeoPixelGrid } grid The grid to draw the lantern on.
   * @param { number } x The x-coordinate of the lantern.
   * @param { number } y The y-coordinate of the lantern.
   * @param { number } mass The mass of the lantern.
   * @param { number } chainLinkLength The length of the chain link.
   * @param { string } color The color of the lantern.
   */
  constructor(
    grid,
    x,
    y,
    mass,
    chainLinkLength,
    color = "rgba(255, 255, 255, 1)",
    radius = 20
  ) {
    super(x, y, mass);
    this.grid = grid;
    this.radius = radius;
    this.color = color;
    this.chainLinkLength = chainLinkLength;
    this.constraints = [];
  }

  /**
   * Adds a constraint to the chain link.
   * @param { Constraint } constraint The constraint to add.
   */
  addConstraint(constraint) {
    this.constraints.push(constraint);
  }

  update() {
    super.update();
    for (let constraint of this.constraints) {
      constraint.update();
    }
    this.acceleration = { x: 0, y: 0 };
    this.velocity = { x: 0, y: 0 };
  }

  /**
   * Renders the lantern.
   * @param { number } index The index of the chain link.
   */
  render(index) {
    let color = this.color;
    if (index % 2 === 0) {
      color = Utils.alternateColor(color, 0.5);
    }
    for (let i = 0; i < this.chainLinkLength - 1; i++) {
      let x = Math.floor(this.position.x / this.grid.resolution);
      let y = Math.floor(this.position.y / this.grid.resolution);
      this.grid.setPixel(x, y + i, color);
    }
  }
}
