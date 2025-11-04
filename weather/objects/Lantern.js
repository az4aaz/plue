import { PhysicsObject } from "../physics/object.js";
import { Fire } from "./Fire.js";
import { Utils } from "../constants.js";

export class Lantern extends PhysicsObject {
  constructor(
    grid,
    x,
    y,
    mass,
    chainLinkLength,
    color = "rgba(255, 255, 255)",
    radius = 20
  ) {
    super(grid, x, y, mass, 0.05, 0.98);
    this.radius = radius;
    this.color = color;
    this.chainLinkLength = chainLinkLength;
    this.fire = new Fire(x, y, this.radius * 0.35, this.grid);
    this.tiltAmount = 0;
    this.collisionRadius = this.radius * 2 * this.grid.resolution;
  }

  update() {
    super.update();
    this.fire.update();
  }

  checkCollisionWithGround() {
    const lanternHeight = this.radius * 2 * this.grid.resolution;
    let groundLevel = (this.grid.height - Utils.CONSTANTS.GROUND.LEVEL) * this.grid.resolution;

    if (this.position.y + lanternHeight >= groundLevel) {
      this.position.y = groundLevel - lanternHeight;
      this.velocity.y = -this.velocity.y * 0.6;
      this.velocity.x *= 0.9;
    }
  }

  render() {
    const px = Math.floor(this.position.x / this.grid.resolution);
    const py = Math.floor(this.position.y / this.grid.resolution);
    const w = this.radius;
    const h = this.radius * 2;

    const roofColor = Utils.applyLighting("rgba(120, 80, 40, 1)");
    const frameColor = Utils.applyLighting("rgba(80, 60, 40, 1)");
    const baseColor = Utils.applyLighting("rgba(100, 70, 40, 1)");
    const glassTop = Utils.applyLighting("rgba(255, 230, 170, 0.9)");
    const glassBottom = Utils.applyLighting("rgba(255, 220, 150, 0.7)");

    const angle = (this.tiltAmount || 0) * Utils.CONSTANTS.PHYSICS.TILT.ANGLE_MULTIPLIER;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const rotate = (dx, dy) => {
      return {
        x: Math.round(px + dx * cos - dy * sin),
        y: Math.round(py + dx * sin + dy * cos)
      };
    };

    this.grid.setPixel(px, py, frameColor);
    const hook = rotate(0, 1);
    this.grid.setPixel(hook.x, hook.y, frameColor);

    const roofH = Math.ceil(h * 0.2);
    const roofFactor = 0.6;
    for (let dy = 0; dy < roofH; dy++) {
      const roofW = Math.ceil((roofH - dy) * roofFactor);
      for (let dx = -roofW; dx <= roofW; dx++) {
        const pos = rotate(dx, 2 + dy);
        this.grid.setPixel(pos.x, pos.y, roofColor);
      }
    }

    const bodyH = Math.ceil(h * 0.7);
    const bodyW = Math.ceil(w * 0.8);
    const bodyHalfW = Math.floor(bodyW * 0.5);
    const bodyHalf = bodyH >> 1;
    for (let dy = 0; dy < bodyH; dy++) {
      const glass = dy < bodyHalf ? glassTop : glassBottom;
      for (let dx = -bodyW; dx <= bodyW; dx++) {
        const absDx = dx < 0 ? -dx : dx;
        const isBar = (dx === 0 || absDx === bodyHalfW);
        const pos = rotate(dx, 2 + roofH + dy);

        if (absDx === bodyW || dy === 0 || dy === bodyH - 1 || isBar) {
          this.grid.setPixel(pos.x, pos.y, frameColor);
        } else {
          this.grid.setPixel(pos.x, pos.y, glass);
        }
      }
    }

    const baseH = Math.ceil(h * 0.1);
    const baseW = Math.ceil(w * 0.9);
    for (let dy = 0; dy < baseH; dy++) {
      for (let dx = -baseW; dx <= baseW; dx++) {
        const pos = rotate(dx, 2 + roofH + bodyH + dy);
        this.grid.setPixel(pos.x, pos.y, baseColor);
      }
    }

    const firePos = rotate(0, h * 0.5);
    this.fire.x = firePos.x * this.grid.resolution;
    this.fire.y = firePos.y * this.grid.resolution;
    this.fire.render();
  }
}
