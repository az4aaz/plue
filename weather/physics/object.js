export class PhysicsObject {
  constructor(x, y, mass, friction = 0.1) {
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
