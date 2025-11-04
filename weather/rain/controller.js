import { Raindrop } from "./raindrop.js";
import { Splash } from "./splash.js";
import { Utils } from "../constants.js";
import { LightSource } from "../light.js";

export class RainController {
  /**
   * Generating and moving raindrops and splashes.
   *
   * @param { NeoPixelGrid } grid   The grid to draw the raindrops and splashes on.
   * @param { { x: number, y: number } } mouse  The mouse position.
   * @param { LightSource[] } lights  The light sources.
   * @property { Raindrop[] } raindrops  The raindrops to be generated and moved.
   * @property { Splash[] } splashes The splashes to be generated and moved.
   */
  constructor(grid, mouse, lights) {
    this.grid = grid;
    this.mouse = mouse;
    this.lights = lights;
    this.aura = Array.isArray(lights)
      ? lights.find((light) => light && light.isAura)
      : null;
    this.raindrops = [];
    this.splashes = [];
    this.frameCounter = 0;
    this.spawnRate = Math.max(0, Number(Utils.CONSTANTS.RAIN?.DROPS_PER_FRAME ?? 1));
    this.spawnAccumulator = 0;
    this.isActive = true;
    this.mouseHeld = false;
    this.auraPulseFrames = 0;
    this.auraPulseOrbitSpeed = 0.8;
    this.auraPulseRadius = 0;
    this.auraRadiusMultiplier = Utils.CONSTANTS.AURA.DEFAULTS.radiusMultiplier;
    this.auraAttractionStrength = Utils.CONSTANTS.AURA.DEFAULTS.attractionStrength;
    this.windIntensity = Utils.CONSTANTS.PHYSICS.WIND.INTENSITY_MULTIPLIER ?? 1;
    this.windAngleDeg = Utils.CONSTANTS.WIND.DEFAULT_ANGLE_DEG ?? -12;
    const angleRad = (this.windAngleDeg * Math.PI) / 180;
    this.windDirection = {
      x: Math.cos(angleRad),
      y: Math.sin(angleRad),
    };
    const windX = this.windDirection.x * this.windIntensity * Utils.CONSTANTS.PHYSICS.WIND.VARIATION_STRENGTH;
    const windY = this.windDirection.y * this.windIntensity * 0.05;
    this.currentWindForce = { x: windX, y: windY };

    window.addEventListener("raindropCollision", (e) => {
      this.handleSplashCollision(e.detail);
    });
  }

  /**
   * Generates a raindrop and pushes it to the raindrops array.
   */
  generateRaindrop() {
    const newDrop = new Raindrop(this.grid, this.mouse, this.lights);
    if (!newDrop.windForce) {
      newDrop.windForce = { ...this.currentWindForce };
    }
    newDrop.updateWind(this.currentWindForce);
    this.raindrops.push(newDrop);
  }

  /**
   * Generates splashes and pushes them to the splashes array.
   *
   * @param { number } dropX  The x-coordinate of the raindrop.
   * @param { number } dropY  The y-coordinate of the raindrop.
   * @param { number } size  The size of the splash.
   *
   * @todo This method is not used. Remove it or use it in the future.
   */
  generateSplashes(dropX, dropY, size) {
    const numSplashes =
      Math.floor(Math.random() * Utils.CONSTANTS.SPLASH.MAX_SPLASHES) +
      Utils.CONSTANTS.SPLASH.MIN_SPLASHES;
    for (let i = 0; i < numSplashes; i++) {
      this.splashes.push(new Splash(this.grid, this.mouse, dropX, dropY, this.lights));
    }
  }

  /**
   * Handles the collision between a raindrop and the ground.
   *
   * @param { Raindrop } drop The raindrop that collided with the ground.
   */
  handleSplashCollision(drop) {
    const splashSize = drop.w;
    this.generateSplashes(drop.x, drop.y, splashSize);
  }

  /**
   * Moves the raindrops.
   */
  moveRaindrops() {
    for (let i = this.raindrops.length - 1; i >= 0; i--) {
      const drop = this.raindrops[i];
      drop.move();
      if (drop.isOnTheGround()) {
        const collisionEvent = new CustomEvent("raindropCollision", {
          detail: drop,
        });
        window.dispatchEvent(collisionEvent);
      }
      if (drop.isOnCanvas()) {
        drop.render();
      } else {
        this.raindrops[i] = this.raindrops[this.raindrops.length - 1];
        this.raindrops.pop();
      }
    }
  }

  /**
   * Moves the splashes.
   */
  moveSplashes() {
    for (let i = this.splashes.length - 1; i >= 0; i--) {
      const splash = this.splashes[i];
      splash.update();
      if (
        splash.y > this.grid.height ||
        splash.x > this.grid.width ||
        splash.currentTime - splash.startTime > Utils.CONSTANTS.SPLASH.DURATION
      ) {
        this.splashes[i] = this.splashes[this.splashes.length - 1];
        this.splashes.pop();
      }
    }
  }

  /**
   * Deletes a raindrop from the raindrops array.
   */
  delRaindrop(drop) {
    const dropIndex = this.raindrops.indexOf(drop);
    if (dropIndex > -1) {
      this.raindrops[dropIndex] = this.raindrops[this.raindrops.length - 1];
      this.raindrops.pop();
    }
  }

  /**
   * Delete a splash from the splashes array.
   */
  delSplash(splash) {
    const splashIndex = this.splashes.indexOf(splash);
    if (splashIndex > -1) {
      this.splashes[splashIndex] = this.splashes[this.splashes.length - 1];
      this.splashes.pop();
    }
  }

  /**
   * Updates and renders the raindrops and splashes.
   */
  updateAndRender() {
    if (this.auraPulseFrames > 0 && this.aura) {
      this.applyAuraPulseEffect();
      this.auraPulseFrames--;
    }

    if (this.isActive) {
      this.spawnAccumulator += this.spawnRate;
      while (this.spawnAccumulator >= 1) {
        this.generateRaindrop();
        this.spawnAccumulator -= 1;
      }
    }
    this.frameCounter++;
    this.moveRaindrops();
    this.moveSplashes();
  }

  setSpawnRate(value) {
    const numeric = Number(value);
    const clamped = Math.max(0, Number.isNaN(numeric) ? this.spawnRate : numeric);
    this.spawnRate = clamped;
  }

  setActive(active) {
    this.isActive = Boolean(active);
    if (!this.isActive) {
      // Allow existing drops to finish without spawning new ones
      this.frameCounter = 0;
      this.spawnAccumulator = 0;
    }
  }

  clear() {
    this.raindrops.length = 0;
    this.splashes.length = 0;
  }

  setMouseHeld(isHeld) {
    this.mouseHeld = Boolean(isHeld);
    if (!this.mouseHeld) {
      this.releaseOrbitingDrops();
    }
  }

  setAuraRadiusMultiplier(multiplier) {
    this.auraRadiusMultiplier = Math.max(0.1, multiplier);
  }

  setAuraAttraction(strength) {
    this.auraAttractionStrength = Math.max(0.01, strength);
  }

  setWindIntensity(value, angleDeg = this.windAngleDeg) {
    this.windIntensity = Math.max(0, value ?? 0);
    this.windAngleDeg = angleDeg;
    const angleRad = (this.windAngleDeg * Math.PI) / 180;
    this.windDirection = {
      x: Math.cos(angleRad),
      y: Math.sin(angleRad),
    };
    const windX = this.windDirection.x * this.windIntensity * Utils.CONSTANTS.PHYSICS.WIND.VARIATION_STRENGTH;
    const windY = this.windDirection.y * this.windIntensity * 0.05;
    this.currentWindForce = { x: windX, y: windY };
  }

  startAuraPulse(frames, speedMultiplier = 1, radiusMultiplier = 2) {
    if (!this.aura) return;
    this.auraPulseFrames = Math.max(this.auraPulseFrames, Math.floor(frames));
    const baseSpeed = 0.6;
    this.auraPulseOrbitSpeed = baseSpeed * speedMultiplier;
    const baseRadius = this.aura.radius / this.grid.resolution;
    const multiplier = Math.max(0.1, radiusMultiplier ?? this.auraRadiusMultiplier);
    const mouseRadius = Utils.CONSTANTS.MOUSE.RADIUS * 0.4;
    this.auraPulseRadius = baseRadius * multiplier + mouseRadius;
  }

  applyAuraPulseEffect() {
    if (!this.aura || !this.mouseHeld) return;
    const centerX = this.aura.x / this.grid.resolution;
    const centerY = this.aura.y / this.grid.resolution;
    const radius =
      this.auraPulseRadius || (this.aura.radius / this.grid.resolution);
    if (!Number.isFinite(radius) || radius <= 0) {
      return;
    }

    const baseAttraction = 0.09;
    for (const drop of this.raindrops) {
      const dx = drop.x - centerX;
      const dy = drop.y - centerY;
      const distance = Math.hypot(dx, dy);
      if (distance < radius) {
        if (!drop.isPhysicsActive()) {
          drop.enablePhysics();
        }
        const proximity = 1 - distance / Math.max(radius, 1);
        const attraction = this.auraAttractionStrength * (0.6 + proximity * 1.2);
        const orbitImpulse = this.auraPulseOrbitSpeed * (0.22 + proximity * 0.4);
        drop.setAnchor({ x: centerX, y: centerY }, attraction, orbitImpulse, this.windIntensity);
      }
    }
  }

  releaseOrbitingDrops() {
    const fallSpeed = Utils.calculateSpeed(this.grid.resolution) * 0.85;
    for (const drop of this.raindrops) {
      if (drop && drop.isPhysicsActive()) {
        drop.clearAnchor(fallSpeed);
      }
    }
  }

  /**
   * Render the raindrops and splashes without moving them.
   * This is used when the animation is paused.
   */
  render() {
    for (const drop of this.raindrops) {
      drop.render();
    }
    for (const splash of this.splashes) {
      splash.render();
    }
  }
}
