import { Utils } from "./constants.js";

// Centralized app state - everything that was scattered in main.js
export class AppState {
  constructor() {
    this.grid = null;
    this.rainController = null;
    this.lights = [];
    this.climbingPlants = null;
    this.wallFragments = null;
    this.aura = null;
    this.controlPanel = null;

    this.mouse = { x: 0, y: 0 };
    this.mouseIsDown = false;
    this.playing = true;

    this.windIntensity = Utils.CONSTANTS.PHYSICS?.WIND?.INTENSITY_MULTIPLIER ?? 1;
    this.baseLightIntensity = Utils.CONSTANTS.LIGHTING?.INTENSITY_MULTIPLIER ?? 0.7;
    this.baseAuraIntensity = Utils.CONSTANTS.AURA?.INTENSITY_MULTIPLIER ?? 1;
    this.auraRadiusMultiplier = Utils.CONSTANTS.AURA?.DEFAULTS?.radiusMultiplier ?? 1;
    this.auraAttractionStrength = Utils.CONSTANTS.AURA?.DEFAULTS?.attractionStrength ?? 0.01;
    this.windAngleDeg = Utils.CONSTANTS.WIND?.DEFAULT_ANGLE_DEG ?? -12;
    this.auraPulseFrames = 0;

    this.AURA_PULSE_DURATION = 60;
    this.AURA_LIGHT_BOOST = 1.25;  // Réduit pour éviter le burst blanc trop fort
    this.AURA_AURA_BOOST = 1.5;    // Réduit mais garde un effet visible
  }

  reset() {
    this.grid = null;
    this.rainController = null;
    this.lights = [];
    this.climbingPlants = null;
    this.wallFragments = null;
    this.aura = null;
    this.controlPanel = null;
    this.mouse = { x: 0, y: 0 };
    this.mouseIsDown = false;
    this.playing = true;
    this.auraPulseFrames = 0;
    this.windIntensity = Utils.CONSTANTS.PHYSICS?.WIND?.INTENSITY_MULTIPLIER ?? 1;
    this.baseLightIntensity = Utils.CONSTANTS.LIGHTING?.INTENSITY_MULTIPLIER ?? 0.7;
    this.baseAuraIntensity = Utils.CONSTANTS.AURA?.INTENSITY_MULTIPLIER ?? 1;
    this.auraRadiusMultiplier = Utils.CONSTANTS.AURA?.DEFAULTS?.radiusMultiplier ?? 1;
    this.auraAttractionStrength = Utils.CONSTANTS.AURA?.DEFAULTS?.attractionStrength ?? 0.01;
    this.windAngleDeg = Utils.CONSTANTS.WIND?.DEFAULT_ANGLE_DEG ?? -12;
  }

  setMousePosition(x, y) {
    this.mouse.x = x;
    this.mouse.y = y;
  }

  isInitialized() {
    return this.grid && this.rainController && this.lights.length > 0;
  }
}
