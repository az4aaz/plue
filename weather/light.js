import { Utils } from "./constants.js";
import { Lantern } from "./objects/Lantern.js";
import { ChainLink } from "./objects/ChainLink.js";

export class LightSource {
  /**
   * A single light source that emits to a certain radius around it.
   *
   * @param { NeoPixelGrid } grid   The grid to draw the light source on.
   * @param { { x: number, y: number } } mouse  The mouse position.
   * @param { number } radius   The radius of the light source.
   * @param { string } color    The color of the light source.
   * @property { number } lightingArea The area around the light source that is lit.
   */
  constructor(grid, mouse, radius = 20, color = "rgba(255, 255, 255)") {
    this.grid = grid;
    this.mouse = mouse;
    this.radius = radius;
    this.color = color;
    this.x = this.mouse.x;
    this.y = this.mouse.y;
    this.lightingArea = (radius * 3) / this.grid.resolution;
  }

  /**
   * Renders the light source.
   */
  render() {
    this.grid.p.fill(this.color);
    this.grid.p.ellipse(this.x, this.y, this.radius, this.radius);
  }

  /**
   * Moves the light source.
   */
  move() {
    this.x = this.mouse.x;
    this.y = this.mouse.y;
  }

  /**
   * How far is this object from the light source ?
   * @param { number } x The x-coordinate of the object.
   * @param { number } y The y-coordinate of the object.
   * @returns { number } The distance from the light source
   */
  distance(x, y) {
    let neoX = this.x / this.grid.resolution;
    let neoY = this.y / this.grid.resolution;
    return Math.sqrt((neoX - x) ** 2 + (neoY - y) ** 2) / this.lightingArea;
  }
}

export class SuspendedLantern extends LightSource {
  /**
   * The interpolation factor for the chain links.
   */
  INTERPOLATION_FACTOR = 0.5;

  /**
   * A single light source that emits to a certain radius around it and is suspended by a chain.
   */
  constructor(grid, mouse, radius = 50, color = "rgba(255, 255, 255, 0.5)") {
    super(grid, mouse, radius, color);

    this.chainLinkProperties = {
      mass: 10,
      number: 12,
      length: 3,
    };

    this.lanternProperties = {
      mass: 5,
      radius: 5,
    };

    this.generateChainLinks();
    this.generateLantern();
  }

  /**
   * Calculates lantern properties.
   * @param { number } resolutionFactor The resolution factor.
   */
  generateLantern() {
    let lanternX = this.x;
    let lanternY =
      this.y +
      this.chainLinkProperties.number * this.chainLinkProperties.length;
    this.lantern = new Lantern(
      this.grid,
      lanternX,
      lanternY,
      this.lanternProperties.mass,
      this.chainLinkProperties.length,
      "rgba(255, 255, 255, 0.5)",
      this.lanternProperties.radius
    );
  }

  /**
   * Generates the chain links.
   */
  generateChainLinks() {
    this.chainLinks = [];
    for (let i = 0; i < this.chainLinkProperties.number; i++) {
      let x = Math.floor(this.x);
      let y = Math.floor(this.y + i * this.chainLinkProperties.length);
      if (i > 0) {
        x = this.chainLinks[i - 1].position.x;
        y = this.chainLinks[i - 1].position.y + this.chainLinkProperties.length;
      }
      let newLink = new ChainLink(
        this.grid,
        x,
        y,
        this.chainLinkProperties.mass,
        this.chainLinkProperties.length,
        "rgba(255, 255, 255, 1)"
      );
      this.chainLinks.push(newLink);
    }
  }

  /**
   * Updates the position of the first chain link.
   */
  updateFirstChainLink() {
    this.chainLinks[0].position.x = this.mouse.x;
    this.chainLinks[0].position.y = this.mouse.y;
  }

  /**
   * Updates the position of a chain link using interpolation.
   * @param { number } i The index of the chain link.
   * @param { number } newX The new x-coordinate of the chain link.
   * @param { number } newY The new y-coordinate of the chain link.
   */
  updateChainLinkwithLerp(i, newX, newY) {
    // Apply a delay to the movement of the chain link
    this.chainLinks[i].position.x = Utils.lerp(
      this.chainLinks[i].position.x,
      newX,
      this.INTERPOLATION_FACTOR
    );
    this.chainLinks[i].position.y = Utils.lerp(
      this.chainLinks[i].position.y,
      newY,
      this.INTERPOLATION_FACTOR
    );
  }

  /**
   * Updates the position of the lantern.
   * The lantern is always at the end of the chain.
   */
  updateLantern() {
    let x = this.chainLinks[this.chainLinks.length - 1].position.x;
    let y = this.chainLinks[this.chainLinks.length - 1].position.y;
    this.lantern.position.x = Math.floor(x / this.grid.resolution);
    this.lantern.position.y = Math.floor(
      (y + this.lanternProperties.radius) / this.grid.resolution
    );
  }

  move() {
    const k = 0.3; // Spring constant

    // Update the first chain link based on the mouse position
    this.updateFirstChainLink();

    for (let i = 1; i < this.chainLinks.length; i++) {
      let link = this.chainLinks[i];
      let prevLink = this.chainLinks[i - 1];

      link.applySpringForce(
        k,
        this.chainLinkProperties.length,
        prevLink.position.x - link.position.x,
        prevLink.position.y - link.position.y
      );
      link.update();
    }

    // Apply the forces and update the lantern
    this.lantern.applyForce(Utils.CONSTANTS.PHYSICS.GRAVITY);
    this.lantern.applySpringForce(
      k,
      this.chainLinkProperties.length,
      this.lantern.position.x -
        this.chainLinks[this.chainLinks.length - 1].position.x,
      this.lantern.position.y -
        this.chainLinks[this.chainLinks.length - 1].position.y
    );
    this.lantern.update();

    // Update the lantern's position based on the last chain link's position
    this.updateLantern();
  }

  /**
   * Renders the lantern and the chain.
   * @override
   */
  render() {
    this.drawChain();
    this.lantern.render();
  }

  /**
   * Draw chain (rectangles).
   */
  drawChain() {
    let i = 0;
    for (const chainLink of this.chainLinks) {
      chainLink.render(i);
      i++;
    }
  }

  /**
   * How far is this object from the light source ? The light source being the lantern.
   * @param { number } x The x-coordinate of the object.
   * @param { number } y The y-coordinate of the object.
   * @returns { number } The distance from the light source
   * @override
   */
  distance(x, y) {
    let neoX = this.lantern.position.x;
    let neoY = this.lantern.position.y;
    return Math.sqrt((neoX - x) ** 2 + (neoY - y) ** 2) / this.lightingArea;
  }
}
