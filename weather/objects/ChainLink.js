import { PhysicsObject } from "../physics/object.js";
import { Utils } from "../constants.js";

export class ChainLink extends PhysicsObject {
  constructor(grid, x, y, mass, chainLinkLength, lights, color = "rgba(255, 255, 255, 1)", radius = 20) {
    super(grid, x, y, mass, 0.05, 0.98);
    this.radius = radius;
    this.color = color;
    this.chainLinkLength = chainLinkLength;
    this.lights = lights;
  }

  setLights(lights) {
    this.lights = lights;
  }

  render(index) {
    let color = this.color;
    if (index % 2 === 0) {
      color = Utils.alternateColor(color, 0.5);
    }
    for (let i = 0; i < this.chainLinkLength; i++) {
      let x = Math.floor(this.position.x / this.grid.resolution);
      let y = Math.floor(this.position.y / this.grid.resolution);
      let shaded = color;
      if (Array.isArray(this.lights) && this.lights.length) {
        let minDistance = Infinity;
        let closestLight = null;
        for (const light of this.lights) {
          const distance = light.distance(x, y + i);
          if (distance < minDistance) {
            minDistance = distance;
            closestLight = light;
            if (minDistance < 0.3) break;
          }
        }
        if (minDistance !== Infinity) {
          shaded = Utils.dimColor(
            shaded,
            minDistance,
            this.grid.resolution,
            closestLight?.tintColor
          );
        }
      }
      const finalColor = Utils.applyLighting(shaded);
      this.grid.setPixel(x, y + i, finalColor);
    }
  }
}
