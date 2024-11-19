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
    if (
      !(constraint instanceof Constraint) &&
      !(constraint instanceof FixedConstraint)
    ) {
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

export class FixedConstraint {
  constructor(link1, link2, length) {
    this.link1 = link1;
    this.link2 = link2;
    this.length = length;
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

  apply() {
    if (this.broken) {
      return;
    }
    let distance = this.calculateDistance();
    let difference = this.length * Utils.CONSTANTS.CANVAS.RESOLUTION - distance;
    let direction = this.calculateDirection(distance);
  }
}

export class Constraint {
  constructor(link1, link2, length, stiffness = 0.1) {
    this.link1 = link1;
    this.link2 = link2;
    this.length = length;
    this.stiffness = stiffness;
    this.breakThreshold = 200;
    this.broken = false;
  }

  calculateDistance() {
    const deltaX = this.link2.position.x - this.link1.position.x;
    const deltaY = this.link2.position.y - this.link1.position.y;
    return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  }

  calculateDirection(distance) {
    const deltaX = this.link2.position.x - this.link1.position.x;
    const deltaY = this.link2.position.y - this.link1.position.y;
    return { x: deltaX / distance, y: deltaY / distance };
  }

  calculateAdjustment(difference, totalMass) {
    const adjustment1 = difference * (this.link2.mass / totalMass);
    const adjustment2 = difference * (this.link1.mass / totalMass);
    return { adjustment1, adjustment2 };
  }

  calculateVelocityCorrection(adjustment, direction) {
    return {
      x: adjustment * direction.x,
      y: adjustment * direction.y,
    };
  }

  applyVelocityCorrection(velocityCorrection1, velocityCorrection2) {
    this.link1.velocity.x -= velocityCorrection1.x;
    this.link1.velocity.y -= velocityCorrection1.y;
    this.link2.velocity.x += velocityCorrection2.x;
    this.link2.velocity.y += velocityCorrection2.y;
  }

  applyErrorCorrection(adjustment, direction) {
    return {
      x: this.stiffness * adjustment * direction.x,
      y: this.stiffness * adjustment * direction.y,
    };
  }

  apply() {
    if (this.broken) {
      return;
    }

    const distance = this.calculateDistance();
    this.checkIfBroken(distance);

    const difference = this.calculateDifference(distance);
    const direction = this.calculateDirection(distance);
    const totalMass = this.link1.mass + this.link2.mass;
    const { adjustment1, adjustment2 } = this.calculateAdjustment(
      difference,
      totalMass
    );

    const velocityCorrection1 = this.calculateAndLimitVelocityCorrection(
      adjustment1,
      direction
    );
    const velocityCorrection2 = this.calculateAndLimitVelocityCorrection(
      adjustment2,
      direction
    );

    this.applyVelocityCorrection(velocityCorrection1, velocityCorrection2);

    const errorCorrection1 = this.applyErrorCorrection(adjustment1, direction);
    this.link1.position.x -= errorCorrection1.x;
    this.link1.position.y -= errorCorrection1.y;

    const errorCorrection2 = this.applyErrorCorrection(adjustment2, direction);
    this.link2.position.x += errorCorrection2.x;
    this.link2.position.y += errorCorrection2.y;
  }

  checkIfBroken(distance) {
    if (distance > this.breakThreshold) {
      // this.broken = true;
    }
  }

  calculateDifference(distance) {
    let difference = this.length * Utils.CONSTANTS.CANVAS.RESOLUTION - distance;
    return Math.min(
      Math.max(difference, -Utils.CONSTANTS.PHYSICS.MAX_DIFFERENCE),
      Utils.CONSTANTS.PHYSICS.MAX_DIFFERENCE
    );
  }

  calculateAndLimitVelocityCorrection(adjustment, direction) {
    let velocityCorrection = this.calculateVelocityCorrection(
      adjustment,
      direction
    );
    velocityCorrection.x = Math.min(
      Math.max(
        velocityCorrection.x,
        -Utils.CONSTANTS.PHYSICS.MAX_VELOCITY_CORRECTION
      ),
      Utils.CONSTANTS.PHYSICS.MAX_VELOCITY_CORRECTION
    );
    velocityCorrection.y = Math.min(
      Math.max(
        velocityCorrection.y,
        -Utils.CONSTANTS.PHYSICS.MAX_VELOCITY_CORRECTION
      ),
      Utils.CONSTANTS.PHYSICS.MAX_VELOCITY_CORRECTION
    );
    return velocityCorrection;
  }
}
