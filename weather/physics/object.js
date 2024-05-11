import { Utils } from "../constants.js";

export class PhysicsObject {
  constructor(x, y, mass, friction = 0.1, damping = 0.99) {
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.acceleration = { x: 0, y: 0 };
    this.mass = mass;
    this.friction = friction;
    this.damping = damping;
    this.constraints = [];
  }

  addConstraint(constraint) {
    if (!(constraint instanceof Constraint)) {
      throw new Error("Invalid constraint");
    }
    this.constraints.push(constraint);
  }

  checkCollisionWithGround() {
    let pixelGroundLevel =
      (this.grid.height - Utils.CONSTANTS.GROUND.LEVEL) * this.grid.resolution;
    if (this.position.y > pixelGroundLevel) {
      this.position.y = pixelGroundLevel;
      this.velocity.y = -this.velocity.y * this.friction;
    }
  }

  applyForce(force) {
    this.acceleration.x += force.x / this.mass;
    this.acceleration.y += force.y / this.mass;
    this.velocity.x *= this.damping;
    this.velocity.y *= this.damping;
  }

  applyGravity() {
    let gravity = {
      x: 0,
      y: Utils.weight(this.mass) / Utils.CONSTANTS.PHYSICS.GRAVITY_DIVISOR,
    };
    this.applyForce(gravity);
  }

  applyFriction() {
    let frictionForce = {
      x: -this.velocity.x * this.friction,
      y: -this.velocity.y * this.friction,
    };
    this.applyForce(frictionForce);
  }

  update() {
    this.applyGravity();
    this.applyFriction();

    this.velocity = {
      x: this.velocity.x + this.acceleration.x,
      y: this.velocity.y + this.acceleration.y,
    };

    this.position = {
      x: this.position.x + this.velocity.x,
      y: this.position.y + this.velocity.y,
    };

    this.checkCollisionWithGround();

    this.acceleration = { x: 0, y: 0 };

    for (let i = 0; i < Utils.CONSTANTS.PHYSICS.CONSTRAINT_ITERATIONS; i++) {
      for (let constraint of this.constraints) {
        constraint.apply();
      }
    }
  }
}

export class Constraint {
  constructor(link1, link2, length, stiffness = 0.4) {
    this.link1 = link1;
    this.link2 = link2;
    this.length = length;
    this.stiffness = stiffness;
    this.breakThreshold = 2000;
    this.broken = false;
  }

  calculateDistance() {
    let dx = this.link2.position.x - this.link1.position.x;
    let dy = this.link2.position.y - this.link1.position.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  calculateDirection(distance) {
    let dx = this.link2.position.x - this.link1.position.x;
    let dy = this.link2.position.y - this.link1.position.y;
    return { x: dx / distance, y: dy / distance };
  }

  calculateAdjustment(difference, totalMass) {
    let adjustment1 = difference * (this.link2.mass / totalMass);
    let adjustment2 = difference * (this.link1.mass / totalMass);
    return { adjustment1, adjustment2 };
  }

  calculateVelocityCorrection(adjustment, direction) {
    let velocityCorrection = {
      x: adjustment * direction.x,
      y: adjustment * direction.y,
    };
    return velocityCorrection;
  }

  applyVelocityCorrection(velocityCorrection1, velocityCorrection2) {
    this.link1.velocity.x -= velocityCorrection1.x;
    this.link1.velocity.y -= velocityCorrection1.y;
    this.link2.velocity.x += velocityCorrection2.x;
    this.link2.velocity.y += velocityCorrection2.y;
  }

  applyErrorCorrection(adjustment, direction) {
    let errorCorrection = {
      x: this.stiffness * adjustment * direction.x,
      y: this.stiffness * adjustment * direction.y,
    };
    return errorCorrection;
  }

  apply() {
    if (this.broken) {
      return;
    }
    let distance = this.calculateDistance();
    if (distance > this.breakThreshold) {
      this.broken = true;
    }
    let difference = this.length * Utils.CONSTANTS.CANVAS.RESOLUTION - distance;
    difference = Math.min(
      Math.max(difference, -Utils.CONSTANTS.PHYSICS.MAX_DIFFERENCE),
      Utils.CONSTANTS.PHYSICS.MAX_DIFFERENCE
    );

    let direction = this.calculateDirection(distance);

    let totalMass = this.link1.mass + this.link2.mass;
    let { adjustment1, adjustment2 } = this.calculateAdjustment(
      difference,
      totalMass
    );
    adjustment1 = Math.min(
      Math.max(adjustment1, -Utils.CONSTANTS.PHYSICS.MAX_ADJUSTMENT),
      Utils.CONSTANTS.PHYSICS.MAX_ADJUSTMENT
    );
    adjustment2 = Math.min(
      Math.max(adjustment2, -Utils.CONSTANTS.PHYSICS.MAX_ADJUSTMENT),
      Utils.CONSTANTS.PHYSICS.MAX_ADJUSTMENT
    );

    let velocityCorrection1 = this.calculateVelocityCorrection(
      adjustment1,
      direction
    );
    velocityCorrection1.x = Math.min(
      Math.max(
        velocityCorrection1.x,
        -Utils.CONSTANTS.PHYSICS.MAX_VELOCITY_CORRECTION
      ),
      Utils.CONSTANTS.PHYSICS.MAX_VELOCITY_CORRECTION
    );
    velocityCorrection1.y = Math.min(
      Math.max(
        velocityCorrection1.y,
        -Utils.CONSTANTS.PHYSICS.MAX_VELOCITY_CORRECTION
      ),
      Utils.CONSTANTS.PHYSICS.MAX_VELOCITY_CORRECTION
    );

    let velocityCorrection2 = this.calculateVelocityCorrection(
      adjustment2,
      direction
    );
    velocityCorrection2.x = Math.min(
      Math.max(
        velocityCorrection2.x,
        -Utils.CONSTANTS.PHYSICS.MAX_VELOCITY_CORRECTION
      ),
      Utils.CONSTANTS.PHYSICS.MAX_VELOCITY_CORRECTION
    );
    velocityCorrection2.y = Math.min(
      Math.max(
        velocityCorrection2.y,
        -Utils.CONSTANTS.PHYSICS.MAX_VELOCITY_CORRECTION
      ),
      Utils.CONSTANTS.PHYSICS.MAX_VELOCITY_CORRECTION
    );

    this.applyVelocityCorrection(velocityCorrection1, velocityCorrection2);

    let errorCorrection1 = this.applyErrorCorrection(adjustment1, direction);
    this.link1.position.x -= errorCorrection1.x;
    this.link1.position.y -= errorCorrection1.y;

    let errorCorrection2 = this.applyErrorCorrection(adjustment2, direction);
    this.link2.position.x += errorCorrection2.x;
    this.link2.position.y += errorCorrection2.y;
  }
}
