import { Utils } from "../constants.js";

export class WindSystem {
  constructor() {
    this.time = 0;
    this.gustTime = 0;
    this.strength = 0;
  }

  update() {
    this.time += Utils.CONSTANTS.PHYSICS.WIND.FREQUENCY;
    this.gustTime += Utils.CONSTANTS.PHYSICS.WIND.GUST_FREQUENCY;
  }

  getWindForce() {
    const cfg = Utils.CONSTANTS.PHYSICS.WIND;
    const base = Math.sin(this.time) * cfg.VARIATION_STRENGTH;
    const gust = Math.sin(this.gustTime) * Math.sin(this.gustTime * 2.7) * cfg.GUST_STRENGTH;

    this.strength = cfg.BASE_STRENGTH + base + gust;
    return { x: this.strength, y: 0 };
  }

  getCurrentStrength() {
    return this.strength;
  }
}
