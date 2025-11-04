import { Utils } from "../constants.js";

// Simple validation helpers for control inputs
export class ControlValidator {
  clamp(value, min, max) {
    const n = Number(value);
    if (Number.isNaN(n)) return min;
    return Math.min(max, Math.max(min, n));
  }

  validateLightIntensity(value) {
    const ctrl = Utils.CONSTANTS.CONTROL_PANEL?.CONTROLS?.find(c => c.id === "lightIntensity");
    return this.clamp(value, ctrl?.min ?? 0, ctrl?.max ?? 1);
  }

  validateRainDensity(value) {
    return Math.max(0, Number(value) || 1);
  }

  validateAuraRadiusMultiplier(value) {
    const def = Utils.CONSTANTS.AURA?.DEFAULTS?.radiusMultiplier ?? 1;
    return Math.max(1, Number(value) || def);
  }

  validateAuraAttraction(value) {
    const def = Utils.CONSTANTS.AURA?.DEFAULTS?.attractionStrength ?? 0.01;
    return Math.max(0.01, Number(value) || def);
  }

  validateWindIntensity(value) {
    return Math.max(0, Number(value) || 1);
  }

  validateWindAngle(value, fallback = -12) {
    const n = Number(value);
    return Number.isNaN(n) ? fallback : n;
  }

  validateAuraIntensity(value) {
    return Math.max(0, Number(value) || 1);
  }

  validateBurstIntensity(value) {
    const ctrl = Utils.CONSTANTS.CONTROL_PANEL?.CONTROLS?.find(c => c.id === "burstIntensity");
    return this.clamp(value, ctrl?.min ?? 1, ctrl?.max ?? 2);
  }

  validateOrbitImpulse(value) {
    const ctrl = Utils.CONSTANTS.CONTROL_PANEL?.CONTROLS?.find(c => c.id === "orbitImpulse");
    return this.clamp(value, ctrl?.min ?? 0, ctrl?.max ?? 0.3);
  }

  validatePlayingState(value) {
    return Boolean(value);
  }
}
