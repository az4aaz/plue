import { RainController } from "./rain/controller.js";
import { SuspendedLantern } from "./light.js";
import { Utils } from "./constants.js";
import { NeoPixelGrid } from "./grid.js";
import { WallFragments } from "./background/WallFragments.js";
import { ClimbingPlants } from "./plants/ClimbingPlants.js";
import { PurpleAura } from "./effects/PurpleAura.js";
import { ControlPanel } from "./ui/ControlPanel.js";
import { AppState } from "./AppState.js";
import { ControlValidator } from "./utils/ControlValidator.js";

// Make the Utils class global
window.Utils = Utils;

// Create centralized application state
const state = new AppState();

// Create validator for control inputs
const validator = new ControlValidator();

initializeControlPanel();

// Initialize p5 instance
const pInstance = new p5((p) => {
  p.setup = () => {
    let cnv = p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
    cnv.id(Utils.CONSTANTS.CANVAS.ID);
    state.setMousePosition(p.width / 2, p.height / 2 - 100);
    p.background(Utils.CONSTANTS.CANVAS.BACKGROUND_COLOR);
    state.grid = new NeoPixelGrid(
      p,
      Utils.CONSTANTS.CANVAS.RESOLUTION,
      p.height,
      p.width
    );
    const leftPos = { x: 100, y: 50 };
    const rightPos = { x: p.width - 100, y: 50 };
    state.aura = new PurpleAura(state.grid, state.mouse);
    const leftLantern = new SuspendedLantern(
      state.grid,
      state.mouse,
      leftPos,
      50,
      "rgba(255, 255, 255, 0.5)",
      false
    );
    const rightLantern = new SuspendedLantern(
      state.grid,
      state.mouse,
      rightPos,
      50,
      "rgba(255, 255, 255, 0.5)",
      false
    );
    state.lights = [state.aura, leftLantern, rightLantern];
    for (const light of state.lights) {
      if (typeof light.setLights === "function") {
        light.setLights(state.lights);
      }
    }

    state.rainController = new RainController(state.grid, state.mouse, state.lights);
    state.rainController.setAuraRadiusMultiplier(state.auraRadiusMultiplier);
    state.rainController.setAuraAttraction(state.auraAttractionStrength);
    state.rainController.setWindIntensity(state.windIntensity);
    state.wallFragments = new WallFragments(state.grid, state.lights);
    state.climbingPlants = new ClimbingPlants(state.grid, state.lights);
    // Ensure caches respect current lighting intensity after initialization
    setLightingIntensity(
      Utils.CONSTANTS.LIGHTING?.INTENSITY_MULTIPLIER ?? 1,
      { fromControl: true }
    );
    setRainDensity(Utils.CONSTANTS.RAIN?.DROPS_PER_FRAME ?? 1, { fromControl: true });
  };

  p.draw = () => {
    updateAuraPulseIntensity();
    p.translate(-p.width / 2, -p.height / 2);
    p.clear();
    p.background(Utils.CONSTANTS.CANVAS.BACKGROUND_COLOR);
    state.grid.clear();
    state.wallFragments.render();
    state.climbingPlants.render();

    if (!state.playing) {
      state.rainController.render();
    } else {
      state.rainController.updateAndRender(p);
    }

    for (const light of state.lights) {
      light.move();
      light.render();
    }

    state.grid.render();
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  // update mouse position
  p.mouseMoved = () => {
    state.setMousePosition(p.mouseX, p.mouseY);
  };

  p.mouseDragged = () => {
    state.setMousePosition(p.mouseX, p.mouseY);
  };

  p.mousePressed = () => {
    state.mouseIsDown = true;
    triggerAuraPulse();
  };

  p.mouseReleased = () => {
    state.mouseIsDown = false;
    if (state.rainController) {
      state.rainController.setMouseHeld(false);
    }
    state.auraPulseFrames = Math.max(state.auraPulseFrames, Math.floor(state.AURA_PULSE_DURATION / 2));
  };

  // When the spacebar is pressed, change the loop playing state
  p.keyTyped = () => {
    if (p.keyCode === 32) {
      togglePlaying();
    }
  };
});

function initializeControlPanel() {
  const config = Utils.CONSTANTS.CONTROL_PANEL;
  if (!config) {
    return;
  }
  state.controlPanel = new ControlPanel(config, handleControlChange);
  const initialValues = state.controlPanel.getValues();
  if (Object.prototype.hasOwnProperty.call(initialValues, "playing")) {
    setPlayingState(initialValues.playing, { fromControl: true });
  }
  const initialLight = Utils.CONSTANTS.LIGHTING?.INTENSITY_MULTIPLIER ?? initialValues.lightIntensity;
  if (typeof initialLight === "number") {
    setLightingIntensity(initialLight, { fromControl: false });
  }

  const initialRain = Utils.CONSTANTS.RAIN?.DROPS_PER_FRAME ?? initialValues.rainDensity;
  if (typeof initialRain === "number") {
    setRainDensity(initialRain, { fromControl: false });
  }

  if (Object.prototype.hasOwnProperty.call(initialValues, "auraRadiusMultiplier")) {
    setAuraRadiusMultiplier(initialValues.auraRadiusMultiplier, { fromControl: true });
  } else {
    setAuraRadiusMultiplier(Utils.CONSTANTS.AURA.DEFAULTS.radiusMultiplier, { fromControl: true });
  }

  if (Object.prototype.hasOwnProperty.call(initialValues, "auraAttraction")) {
    setAuraAttraction(initialValues.auraAttraction, { fromControl: true });
  } else {
    setAuraAttraction(Utils.CONSTANTS.AURA.DEFAULTS.attractionStrength, { fromControl: true });
  }

  const initialWind = Utils.CONSTANTS.PHYSICS?.WIND?.INTENSITY_MULTIPLIER ?? initialValues.windIntensity;
  if (typeof initialWind === "number") {
    setWindIntensity(initialWind, { fromControl: false });
  }

  const initialWindAngle = initialValues.windAngle ?? state.windAngleDeg;
  setWindAngle(initialWindAngle, { fromControl: true });

  const initialAura = Utils.CONSTANTS.AURA?.INTENSITY_MULTIPLIER ?? initialValues.auraIntensity;
  if (typeof initialAura === "number") {
    setAuraIntensity(initialAura, { fromControl: false });
  }

  const initialBurst = initialValues.burstIntensity ?? state.AURA_LIGHT_BOOST;
  if (typeof initialBurst === "number") {
    setBurstIntensity(initialBurst, { fromControl: false });
  }

  const initialOrbit = initialValues.orbitImpulse ?? Utils.CONSTANTS.AURA?.DEFAULTS?.orbitImpulse;
  if (typeof initialOrbit === "number") {
    setOrbitImpulse(initialOrbit, { fromControl: false });
  }
}

function handleControlChange(id, value) {
  switch (id) {
    case "playing":
      setPlayingState(value, { fromControl: true });
      break;
    case "lightIntensity":
      setLightingIntensity(value, { fromControl: true });
      break;
    case "rainDensity":
      setRainDensity(value, { fromControl: true });
      break;
    case "auraRadiusMultiplier":
      setAuraRadiusMultiplier(value, { fromControl: true });
      break;
    case "auraAttraction":
      setAuraAttraction(value, { fromControl: true });
      break;
    case "windIntensity":
      setWindIntensity(value, { fromControl: true });
      break;
    case "windAngle":
      setWindAngle(value, { fromControl: true });
      break;
    case "auraIntensity":
      setAuraIntensity(value, { fromControl: true });
      break;
    case "burstIntensity":
      setBurstIntensity(value, { fromControl: true });
      break;
    case "orbitImpulse":
      setOrbitImpulse(value, { fromControl: true });
      break;
    default:
      break;
  }
}

function triggerAuraPulse() {
  state.auraPulseFrames = state.AURA_PULSE_DURATION;
  if (state.rainController) {
    state.rainController.setMouseHeld(true);
    state.rainController.startAuraPulse(state.AURA_PULSE_DURATION, state.AURA_AURA_BOOST, state.auraRadiusMultiplier);
  }
  if (state.aura && typeof state.aura.triggerBurst === "function") {
    state.aura.triggerBurst();
  }
}

function updateAuraPulseIntensity() {
  if (state.mouseIsDown) {
    state.auraPulseFrames = state.AURA_PULSE_DURATION;
    Utils.CONSTANTS.LIGHTING.INTENSITY_MULTIPLIER =
      state.baseLightIntensity * state.AURA_LIGHT_BOOST;
    Utils.CONSTANTS.AURA.INTENSITY_MULTIPLIER =
      state.baseAuraIntensity * state.AURA_AURA_BOOST;
    invalidateLightingCaches();
    if (state.rainController) {
      state.rainController.startAuraPulse(state.AURA_PULSE_DURATION, state.AURA_AURA_BOOST, 2.8);
    }
    return;
  }

  if (state.auraPulseFrames > 0) {
    const ratio = state.auraPulseFrames / state.AURA_PULSE_DURATION;
    Utils.CONSTANTS.LIGHTING.INTENSITY_MULTIPLIER =
      state.baseLightIntensity * (1 + (state.AURA_LIGHT_BOOST - 1) * ratio);
    Utils.CONSTANTS.AURA.INTENSITY_MULTIPLIER =
      state.baseAuraIntensity * (1 + (state.AURA_AURA_BOOST - 1) * ratio);
    invalidateLightingCaches();
    state.auraPulseFrames--;
    if (state.auraPulseFrames === 0) {
      Utils.CONSTANTS.LIGHTING.INTENSITY_MULTIPLIER = state.baseLightIntensity;
      Utils.CONSTANTS.AURA.INTENSITY_MULTIPLIER = state.baseAuraIntensity;
      invalidateLightingCaches();
    }
  }
}

function invalidateLightingCaches() {
  if (state.wallFragments?.cachedShadedColors) {
    state.wallFragments.cachedShadedColors.clear();
  }
  if (state.climbingPlants?.cachedShadedColors) {
    state.climbingPlants.cachedShadedColors.clear();
  }
}

function setPlayingState(value, { fromControl = false } = {}) {
  state.playing = validator.validatePlayingState(value);
  if (!fromControl && state.controlPanel) {
    state.controlPanel.setValue("playing", state.playing, { silent: true });
  }
}

function togglePlaying() {
  setPlayingState(!state.playing);
}

function setLightingIntensity(value, { fromControl = false } = {}) {
  if (!Utils.CONSTANTS.LIGHTING) {
    Utils.CONSTANTS.LIGHTING = {};
  }
  const clamped = validator.validateLightIntensity(value);
  state.baseLightIntensity = clamped;
  if (state.auraPulseFrames === 0) {
    Utils.CONSTANTS.LIGHTING.INTENSITY_MULTIPLIER = state.baseLightIntensity;
  }
  if (!fromControl && state.controlPanel) {
    state.controlPanel.setValue("lightIntensity", clamped, { silent: true });
  }
  invalidateLightingCaches();
}

function setRainDensity(value, { fromControl = false } = {}) {
  if (!Utils.CONSTANTS.RAIN) {
    Utils.CONSTANTS.RAIN = {};
  }
  const clamped = validator.validateRainDensity(value);
  Utils.CONSTANTS.RAIN.DROPS_PER_FRAME = clamped;
  if (state.rainController) {
    state.rainController.setSpawnRate(clamped);
  }
  if (!fromControl && state.controlPanel) {
    state.controlPanel.setValue("rainDensity", clamped, { silent: true });
  }
}

function setAuraRadiusMultiplier(value, { fromControl = false } = {}) {
  const clamped = validator.validateAuraRadiusMultiplier(value);
  state.auraRadiusMultiplier = clamped;
  if (state.rainController) {
    state.rainController.setAuraRadiusMultiplier(clamped);
  }
  if (!fromControl && state.controlPanel) {
    state.controlPanel.setValue("auraRadiusMultiplier", clamped, { silent: true });
  }
}

function setAuraAttraction(value, { fromControl = false } = {}) {
  const clamped = validator.validateAuraAttraction(value);
  state.auraAttractionStrength = clamped;
  if (state.rainController) {
    state.rainController.setAuraAttraction(clamped);
  }
  if (!fromControl && state.controlPanel) {
    state.controlPanel.setValue("auraAttraction", clamped, { silent: true });
  }
}

function setWindIntensity(value, { fromControl = false } = {}) {
  if (!Utils.CONSTANTS.PHYSICS) {
    Utils.CONSTANTS.PHYSICS = {};
  }
  if (!Utils.CONSTANTS.PHYSICS.WIND) {
    Utils.CONSTANTS.PHYSICS.WIND = {};
  }
  const clamped = validator.validateWindIntensity(value);
  Utils.CONSTANTS.PHYSICS.WIND.INTENSITY_MULTIPLIER = clamped;
  state.windIntensity = clamped;
  if (!fromControl && state.controlPanel) {
    state.controlPanel.setValue("windIntensity", clamped, { silent: true });
  }
  if (state.rainController) {
    state.rainController.setWindIntensity(clamped, state.windAngleDeg);
  }
}

function setWindAngle(value, { fromControl = false } = {}) {
  state.windAngleDeg = validator.validateWindAngle(value, state.windAngleDeg);
  if (!fromControl && state.controlPanel) {
    state.controlPanel.setValue("windAngle", state.windAngleDeg, { silent: true });
  }
  if (state.rainController) {
    state.rainController.setWindIntensity(state.windIntensity, state.windAngleDeg);
  }
}

function setAuraIntensity(value, { fromControl = false } = {}) {
  if (!Utils.CONSTANTS.AURA) {
    Utils.CONSTANTS.AURA = {};
  }
  const clamped = validator.validateAuraIntensity(value);
  state.baseAuraIntensity = clamped;
  if (state.auraPulseFrames === 0) {
    Utils.CONSTANTS.AURA.INTENSITY_MULTIPLIER = state.baseAuraIntensity;
  }
  if (!fromControl && state.controlPanel) {
    state.controlPanel.setValue("auraIntensity", clamped, { silent: true });
  }
  invalidateLightingCaches();
}

function setBurstIntensity(value, { fromControl = false } = {}) {
  const clamped = validator.validateBurstIntensity(value);
  state.AURA_LIGHT_BOOST = clamped;
  if (!fromControl && state.controlPanel) {
    state.controlPanel.setValue("burstIntensity", clamped, { silent: true });
  }
}

function setOrbitImpulse(value, { fromControl = false } = {}) {
  const clamped = validator.validateOrbitImpulse(value);
  if (state.rainController?.raindrops) {
    for (const drop of state.rainController.raindrops) {
      if (typeof drop.physicsOrbitImpulse !== "undefined") {
        drop.physicsOrbitImpulse = clamped;
      }
    }
  }
  if (!fromControl && state.controlPanel) {
    state.controlPanel.setValue("orbitImpulse", clamped, { silent: true });
  }
}
