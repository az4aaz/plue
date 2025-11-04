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
    const baseAngleDeg = Utils.CONSTANTS.WIND?.DEFAULT_ANGLE_DEG ?? -12;
    const angleRad = (baseAngleDeg * Math.PI) / 180;
    this.angle = Math.PI / 2 + angleRad;
    this.cosAngle = Math.cos(this.angle);
    this.sinAngle = Math.sin(this.angle);
    this.renderCos = this.cosAngle;
    this.renderSin = this.sinAngle;
    this.physicsEnabled = false;
    this.physicsVelocity = {
      x: this.cosAngle * this.speed,
      y: this.sinAngle * this.speed,
    };
    const physConst = Utils.CONSTANTS.RAINDROP.PHYSICS;
    this.physicsGravity = Utils.CONSTANTS.PHYSICS.GRAVITY.y * physConst.GRAVITY_FACTOR;
    this.physicsDamping = physConst.DAMPING;
    this.physicsAnchor = null;
    this.physicsAttraction = physConst.DEFAULT_ATTRACTION;
    this.physicsOrbitImpulse = physConst.DEFAULT_ORBIT_IMPULSE;
    this.windForce = { x: 0, y: 0 };
  }

  move() {
    const c = Utils.CONSTANTS.RAINDROP.PHYSICS;

    if (this.physicsEnabled) {
      if (this.physicsAnchor) {
        const dx = this.physicsAnchor.x - this.x;
        const dy = this.physicsAnchor.y - this.y;
        const dist = Math.max(1e-3, Math.hypot(dx, dy));
        const dirX = dx / dist;
        const dirY = dy / dist;

        this.physicsVelocity.x += dirX * this.physicsAttraction;
        this.physicsVelocity.y += dirY * this.physicsAttraction;

        this.physicsVelocity.x += -dirY * this.physicsOrbitImpulse;
        this.physicsVelocity.y += dirX * this.physicsOrbitImpulse;
      } else {
        this.physicsVelocity.x *= c.DAMPING_NO_ANCHOR;
      }

      this.physicsVelocity.y += this.physicsGravity;

      if (this.windForce) {
        this.physicsVelocity.x += this.windForce.x;
        this.physicsVelocity.y += this.windForce.y;
      }

      this.physicsVelocity.x *= this.physicsDamping;
      this.physicsVelocity.y = this.physicsVelocity.y * this.physicsDamping
        + this.physicsGravity * c.GRAVITY_EXTRA_DAMPING;

      const mag = Math.hypot(this.physicsVelocity.x, this.physicsVelocity.y);
      if (mag > c.MAX_SPEED) {
        const scale = c.MAX_SPEED / mag;
        this.physicsVelocity.x *= scale;
        this.physicsVelocity.y *= scale;
      }

      this.x += this.physicsVelocity.x;
      this.y += this.physicsVelocity.y;

      const m = Math.max(1e-3, Math.hypot(this.physicsVelocity.x, this.physicsVelocity.y));
      this.renderCos = this.physicsVelocity.x / m;
      this.renderSin = this.physicsVelocity.y / m;
    } else {
      let newX = this.x + this.cosAngle * this.speed;
      let newY = this.y + this.sinAngle * this.speed;

      if (this.windForce) {
        newX += this.windForce.x;
        newY += this.windForce.y;
      }

      if (newX | (0 !== this.x) | 0 || newY | (0 !== this.y) | 0) {
        this.x = newX;
        this.y = newY;
      }

      this.renderCos = this.cosAngle;
      this.renderSin = this.sinAngle;
    }
  }

  render() {
    for (let i = 0; i < this.lineLength; i++) {
      let x = Math.round(this.x + this.renderCos * i);
      let y = Math.round(this.y + this.renderSin * i);

      let minDistance = Infinity;
      let closestLight = null;
      for (const light of this.lights) {
        const dist = light.distance(x, y);
        if (dist < minDistance) {
          minDistance = dist;
          closestLight = light;
          if (minDistance < 0.3) break;
        }
      }

      let color = Utils.dimColor(
        Utils.CONSTANTS.RAINDROP.COLOR,
        minDistance,
        this.grid.resolution,
        closestLight?.tintColor
      );
      this.grid.setPixel(x, y, color);
    }
  }

  isOnTheGround() {
    return this.y >= this.grid.height - Utils.CONSTANTS.GROUND.LEVEL;
  }

  isOnCanvas() {
    return this.x <= this.grid.width && this.y <= this.grid.height - Utils.CONSTANTS.GROUND.LEVEL;
  }

  isInMouseRadius() {
    const r = Utils.CONSTANTS.MOUSE.RADIUS;
    return this.x <= this.mouse.x + r && this.x >= this.mouse.x - r
        && this.y <= this.mouse.y + r && this.y >= this.mouse.y - r;
  }

  enablePhysics() {
    if (this.physicsEnabled) return;
    this.physicsEnabled = true;
    this.physicsVelocity = {
      x: this.renderCos * this.speed,
      y: this.renderSin * this.speed,
    };
    this.windForce = { x: 0, y: 0 };
  }

  setAnchor(center, attraction, orbitImpulse, windIntensity = 0) {
    if (!center) {
      this.physicsAnchor = null;
      this.windForce = { x: 0, y: 0 };
      return;
    }
    this.physicsAnchor = { x: center.x, y: center.y };
    if (Number.isFinite(attraction)) {
      this.physicsAttraction = Math.max(0.01, attraction);
    }
    if (Number.isFinite(orbitImpulse)) {
      this.physicsOrbitImpulse = Math.max(0, orbitImpulse);
    }
    const physConst = Utils.CONSTANTS.RAINDROP.PHYSICS;
    this.updateWind({
      x: Math.max(0, windIntensity) * Utils.CONSTANTS.PHYSICS.WIND.VARIATION_STRENGTH,
      y: Math.max(0, windIntensity) * physConst.WIND_VERTICAL_FACTOR,
    });
  }

  clearAnchor(fallSpeed) {
    const physConst = Utils.CONSTANTS.RAINDROP.PHYSICS;
    this.physicsAnchor = null;
    this.windForce = { x: 0, y: 0 };
    if (Number.isFinite(fallSpeed) && fallSpeed > 0) {
      const mag = Math.hypot(this.physicsVelocity.x, this.physicsVelocity.y);
      if (mag < fallSpeed) {
        const scale = fallSpeed / Math.max(1e-3, mag);
        this.physicsVelocity.x *= scale;
        this.physicsVelocity.y *= scale;
      }
      this.physicsVelocity.x *= physConst.CLEAR_ANCHOR_DAMPING_X;
      this.physicsVelocity.y *= physConst.CLEAR_ANCHOR_DAMPING_Y;
    }
  }

  isPhysicsActive() {
    return this.physicsEnabled;
  }

  updateWind(force) {
    if (!force) return;
    this.windForce = { x: force.x, y: force.y };
  }
}
