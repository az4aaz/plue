import { Utils } from "./constants.js";
import { Lantern } from "./objects/Lantern.js";
import { ChainLink } from "./objects/ChainLink.js";
import { Constraint } from "./physics/object.js";
import { WindSystem } from "./physics/wind.js";

export class LightSource {
  constructor(grid, mouse, radius = 20, color = "rgba(255, 255, 255)") {
    this.grid = grid;
    this.mouse = mouse;
    this.radius = radius;
    this.color = color;
    this.tintColor = Utils.parseRgba(color) || { r: 255, g: 255, b: 255 };
    this.x = this.mouse.x;
    this.y = this.mouse.y;
    this.lightingArea = (radius * 3) / this.grid.resolution;
    this.cachedNeoX = this.x / this.grid.resolution;
    this.cachedNeoY = this.y / this.grid.resolution;
  }

  /**
   * Renders the light source.
   */
  render() {
    let renderColor = this.color;
    const lighting = Utils.CONSTANTS.LIGHTING || {};
    const multiplier =
      typeof lighting.INTENSITY_MULTIPLIER === "number"
        ? lighting.INTENSITY_MULTIPLIER
        : 1;
    if (renderColor.includes("rgba")) {
      const lastComma = renderColor.lastIndexOf(",");
      const endParen = renderColor.lastIndexOf(")");
      if (lastComma !== -1 && endParen !== -1) {
        const baseAlpha = parseFloat(
          renderColor.substring(lastComma + 1, endParen)
        );
        if (!Number.isNaN(baseAlpha)) {
          const adjustedAlpha = Math.min(
            1,
            Math.max(0, baseAlpha * multiplier)
          );
          renderColor = `${renderColor.substring(0, lastComma)}, ${adjustedAlpha})`;
        }
      }
    }
    this.grid.p.fill(renderColor);
    this.grid.p.ellipse(this.x, this.y, this.radius, this.radius);
  }

  move() {
    this.x = this.mouse.x;
    this.y = this.mouse.y;
    this.cachedNeoX = this.x / this.grid.resolution;
    this.cachedNeoY = this.y / this.grid.resolution;
  }

  distance(x, y) {
    return Math.sqrt((this.cachedNeoX - x) ** 2 + (this.cachedNeoY - y) ** 2) / this.lightingArea;
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
  constructor(grid, mouse, anchorPoint, radius = 50, color = "rgba(255, 255, 255, 0.5)", followMouse = true) {
    super(grid, mouse, radius, color);

    this.chainLinkProperties = {
      mass: 1,
      number: 20,
      length: 1,
    };

    this.lanternProperties = {
      mass: 5,
      radius: 6,
    };

    this.anchorPoint = anchorPoint;
    this.followMouse = followMouse;
    this.windSystem = new WindSystem();

    this.generateChainLinks();
    this.generateLantern();

    this.cachedLanternX = Math.floor(this.lantern.position.x / this.grid.resolution);
    this.cachedLanternY = Math.floor(this.lantern.position.y / this.grid.resolution);
    this.connectedLights = null;
  }

  setLights(lights) {
    this.connectedLights = lights;
    if (Array.isArray(this.chainLinks)) {
      for (const link of this.chainLinks) {
        link.setLights(lights);
      }
    }
  }

  generateLantern() {
    let lanternX = this.anchorPoint.x;
    let lanternY = this.anchorPoint.y + this.chainLinkProperties.number * this.chainLinkProperties.length;

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
        this.chainLinkProperties.length,
        0.9
      )
    );
  }

  generateChainLinks() {
    this.chainLinks = [];
    for (let i = 0; i < this.chainLinkProperties.number; i++) {
      let x = Math.floor(this.anchorPoint.x);
      let y = Math.floor(this.anchorPoint.y + i * this.chainLinkProperties.length);
      if (i > 0) {
        x = Math.floor(this.chainLinks[i - 1].position.x);
        y = Math.floor(this.chainLinks[i - 1].position.y + this.chainLinkProperties.length);
      }
      let link = new ChainLink(
        this.grid,
        x,
        y,
        this.chainLinkProperties.mass,
        this.chainLinkProperties.length,
        this.connectedLights,
        "rgba(255, 255, 255, 1)"
      );
      this.chainLinks.push(link);
      if (i > 0) {
        const constraint = new Constraint(this.chainLinks[i - 1], this.chainLinks[i], this.chainLinkProperties.length, 0.9);
        this.chainLinks[i - 1].addConstraint(constraint);
      }
    }
  }

  updateFirstChainLink() {
    if (this.followMouse) {
      this.chainLinks[0].position.x = this.mouse.x;
      this.chainLinks[0].position.y = this.mouse.y;
    } else {
      this.chainLinks[0].position.x = this.anchorPoint.x;
      this.chainLinks[0].position.y = this.anchorPoint.y;
    }
  }

  updateChainLinkwithLerp(i, newX, newY) {
    this.chainLinks[i].position.x = Utils.lerp(this.chainLinks[i].position.x, newX, this.INTERPOLATION_FACTOR);
    this.chainLinks[i].position.y = Utils.lerp(this.chainLinks[i].position.y, newY, this.INTERPOLATION_FACTOR);
  }

  move() {
    this.windSystem.update();
    const wind = this.windSystem.getWindForce();

    this.updateFirstChainLink();

    const mouseRadius = Utils.CONSTANTS.MOUSE.RADIUS * this.grid.resolution;

    for (let i = 0; i < this.chainLinks.length; i++) {
      if (i === 0) continue;

      this.chainLinks[i].applyGravity();
      this.chainLinks[i].applyWind(wind);
      this.chainLinks[i].applyFriction();
      this.chainLinks[i].checkMouseCollision(this.mouse, mouseRadius);

      this.chainLinks[i].velocity.x += this.chainLinks[i].acceleration.x;
      this.chainLinks[i].velocity.y += this.chainLinks[i].acceleration.y;
      this.chainLinks[i].position.x += this.chainLinks[i].velocity.x;
      this.chainLinks[i].position.y += this.chainLinks[i].velocity.y;

      this.chainLinks[i].checkCollisionWithGround();
      this.chainLinks[i].acceleration = { x: 0, y: 0 };
    }

    this.lantern.applyGravity();
    this.lantern.applyWind(wind);
    this.lantern.applyFriction();
    this.lantern.checkMouseCollision(this.mouse, mouseRadius + this.lantern.collisionRadius);
    this.lantern.velocity.x += this.lantern.acceleration.x;
    this.lantern.velocity.y += this.lantern.acceleration.y;
    this.lantern.position.x += this.lantern.velocity.x;
    this.lantern.position.y += this.lantern.velocity.y;
    this.lantern.checkCollisionWithGround();
    this.lantern.acceleration = { x: 0, y: 0 };

    for (let i = 0; i < Utils.CONSTANTS.PHYSICS.CONSTRAINT_ITERATIONS; i++) {
      for (const link of this.chainLinks) {
        for (const c of link.constraints) {
          c.apply();
        }
      }
      for (const c of this.lantern.constraints) {
        c.apply();
      }
    }

    const topChainX = this.chainLinks[this.chainLinks.length - 1].position.x;
    const horizontalDisplacement = topChainX - this.lantern.position.x;
    const targetTilt = horizontalDisplacement * Utils.CONSTANTS.PHYSICS.TILT.DISPLACEMENT_FACTOR;
    this.lantern.tiltAmount = this.lantern.tiltAmount || 0;
    this.lantern.tiltAmount += (targetTilt - this.lantern.tiltAmount) * Utils.CONSTANTS.PHYSICS.TILT.INTERPOLATION;

    this.cachedLanternX = Math.floor(this.lantern.position.x / this.grid.resolution);
    this.cachedLanternY = Math.floor(this.lantern.position.y / this.grid.resolution);

    this.lantern.fire.update();
  }

  render() {
    this.drawChain();
    this.lantern.render();
  }

  drawChain() {
    let i = 0;
    for (const link of this.chainLinks) {
      link.render(i);
      i++;
    }
  }

  distance(x, y) {
    return Math.sqrt((this.cachedLanternX - x) ** 2 + (this.cachedLanternY - y) ** 2) / this.lightingArea;
  }
}
