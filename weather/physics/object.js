export class PhysicsObject {
  constructor(x, y, mass, friction = 0) {
    this.position = { x, y };
    this.velocity = { x: 0, y: 0 };
    this.acceleration = { x: 0, y: 0 };
    this.mass = mass;
    this.friction = friction;
  }

  applyForce(force) {
    // Newton's second law: F = ma
    let forceCopy = { ...force };
    forceCopy.x /= this.mass;
    forceCopy.y /= this.mass;
    this.acceleration.x += forceCopy.x;
    this.acceleration.y += forceCopy.y;
  }

  applySpringForce(k, distance, dx, dy) {
    distance = Math.floor(distance / this.grid.resolution);
    let springForce = {
      x: k * distance * (dx / distance),
      y: k * distance * (dy / distance),
    };
    this.applyForce(springForce);
  }

  update() {
    // Update velocity
    this.velocity.x += this.acceleration.x;
    this.velocity.y += this.acceleration.y;

    // Apply friction
    let frictionForce = {
      x: this.velocity.x * this.friction,
      y: this.velocity.y * this.friction,
    };
    this.velocity.x -= frictionForce.x;
    this.velocity.y -= frictionForce.y;

    // Update position
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

export class Constraint {
  constructor(link1, link2, length) {
    this.link1 = link1;
    this.link2 = link2;
    this.length = length;
  }

  update() {
    let dx = this.link2.position.x - this.link1.position.x;
    let dy = this.link2.position.y - this.link1.position.y;
    let currentDistance = Math.sqrt(dx * dx + dy * dy);
    // Calculate how much we need to move the links to satisfy the constraint
    let difference = this.length - currentDistance;
    let adjustment = difference / 2; // We'll move each link half the difference

    // Calculate the direction in which to move the links
    let direction = Utils.normalizeVector(
      Utils.subtractVector(this.link2.position, this.link1.position)
    );

    // Adjust the positions of the links
    this.link1.position = Utils.addVector(
      this.link1.position,
      Utils.multiplyVector(direction, -adjustment)
    );

    this.link2.position = Utils.addVector(
      this.link2.position,
      Utils.multiplyVector(direction, adjustment)
    );
  }
}
