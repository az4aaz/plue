import { Utils } from "./constants.js";
import { Lantern } from "./objects/Lantern.js";
import { ChainLink } from "./objects/ChainLink.js";
import { Constraint } from "./physics/object.js";

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
      mass: 2,
      number: 10,
      length: 2,
    };

    this.lanternProperties = {
      mass: 15,
      radius: 5,
    };

    this.connectedToMouse = true;

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
    this.lantern.addConstraint(
      new Constraint(
        this.chainLinks[this.chainLinks.length - 1],
        this.lantern,
        this.chainLinkProperties.length
      )
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
        x = Math.floor(this.chainLinks[i - 1].position.x);
        y = Math.floor(
          this.chainLinks[i - 1].position.y + this.chainLinkProperties.length
        );
      }
      let newMass = this.chainLinkProperties.mass;
      let newLink = new ChainLink(
        this.grid,
        x,
        y,
        newMass,
        this.chainLinkProperties.length,
        "rgba(255, 255, 255, 1)"
      );
      console.log("New link mass : ", newLink);
      this.chainLinks.push(newLink);
      // Add constraints
      if (i > 0) {
        const stiffness = i == 1 ? 0.9 : 0.5;
        const constraint = new Constraint(
          this.chainLinks[i - 1],
          this.chainLinks[i],
          this.chainLinkProperties.length,
          stiffness
        );
        this.chainLinks[i - 1].addConstraint(constraint);
      }
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

  move() {
    // Update the position of the chain links
    for (const chainLink of this.chainLinks) {
      chainLink.update();
    }
    this.lantern.update();
    // Update the first chain link based on the mouse position
    if (this.connectedToMouse) {
      this.updateFirstChainLink();
    }
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
    let neoX = Math.floor(this.lantern.position.x / this.grid.resolution);
    let neoY = Math.floor(this.lantern.position.y / this.grid.resolution);
    return Math.sqrt((neoX - x) ** 2 + (neoY - y) ** 2) / this.lightingArea;
  }
}
