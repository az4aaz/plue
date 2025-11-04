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
    this.raindrops = [];
    this.splashes = [];
    this.frameCounter = 0;

    window.addEventListener("raindropCollision", (e) => {
      this.handleSplashCollision(e.detail);
    });
  }

  /**
   * Generates a raindrop and pushes it to the raindrops array.
   */
  generateRaindrop() {
    const newDrop = new Raindrop(this.grid, this.mouse, this.lights);
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
    if (this.frameCounter % 2 === 0) {
      this.generateRaindrop();
    }
    this.frameCounter++;
    this.moveRaindrops();
    this.moveSplashes();
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
