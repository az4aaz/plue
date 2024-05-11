import { Utils } from "../constants.js";

export class Fire {
  /**
   * A tiny fire effect.
   */
  constructor(
    x,
    y,
    radius,
    grid,
    colors = ["rgba(255, 100, 100, 1)", "rgba(255, 200, 100, 1)"]
  ) {
    this.x = x;
    this.y = y;
    this.radius = Math.floor(radius);
    this.colors = colors;
    this.grid = grid;
    this.particles = [];
    this.counter = 0;
  }

  generateParticles() {
    for (let i = 0; i < 2; i++) {
      let radius = this.radius * this.grid.resolution;
      let x = this.x + Math.random() * radius - radius / 2;
      let y = this.y + Math.random() * radius - radius / 2;
      let vx = Math.random() * 2 - 1;
      let vy = Math.random() * 2 - 1 - 0.5;
      let life = Math.random() * 20;
      let color = this.colors[Math.floor(Math.random() * this.colors.length)];
      this.particles.push({ x, y, vx, vy, life, color });
    }
  }

  update() {
    if (this.counter === 3) {
      this.generateParticles();
      this.updateParticles();
      this.counter = 0;
    } else {
      this.counter++;
    }
  }

  updateParticles() {
    for (let particle of this.particles) {
      particle.life--;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy -= 0.5;
    }
  }

  renderParticles() {
    for (let particle of this.particles) {
      if (particle.life > 0) {
        let px = Math.floor(particle.x / this.grid.resolution);
        let py = Math.floor(particle.y / this.grid.resolution);
        let color = Utils.alternateColor(particle.color, particle.life / 10);
        this.grid.setPixel(px, py, color);
      } else {
        this.particles = this.particles.filter((p) => p !== particle);
      }
    }
  }

  render() {
    for (
      let i = 0;
      i < 2 * Math.PI;
      i += Math.PI / (this.grid.resolution * 50)
    ) {
      let x = Math.floor(
        (this.x + this.radius * this.grid.resolution * Math.cos(i)) /
          this.grid.resolution
      );
      let y = Math.floor(
        (this.y + this.radius * this.grid.resolution * Math.sin(i)) /
          this.grid.resolution
      );
      y += this.radius;
      this.grid.setPixel(x, y, this.colors[0]);
      this.grid.setPixel(
        Math.floor(x - 1.5 * Math.cos(i)),
        Math.floor(y - 1.5 * Math.sin(i)),
        this.colors[1]
      );
    }
    this.renderParticles();
  }
}
