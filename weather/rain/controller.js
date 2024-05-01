import { Raindrop } from "./raindrop.js";
import { Splash } from "./splash.js";
import { Utils } from "../constants.js";

export class RainController {
  /**
   * Generating and moving raindrops and splashes.
   *
   * @param { NeoPixelGrid } grid
   * @param { { x: number, y: number } } mouse
   */
  constructor(grid, mouse) {
    this.grid = grid;
    this.mouse = mouse;
    this.raindrops = [];
    this.splashes = [];

    window.addEventListener("raindropCollision", (e) => {
      this.handleSplashCollision(e.detail);
    });
  }

  /**
   * Generates a raindrop and pushes it to the raindrops array.
   */
  generateRaindrop() {
    const newDrop = new Raindrop(this.grid, this.mouse);
    this.raindrops.push(newDrop);
  }

  /**
   * Generates splashes and pushes them to the splashes array.
   *
   * @param { number } dropX
   * @param { number } dropY
   * @param { number } size
   *
   * @todo This method is not used. Remove it or use it in the future.
   */
  generateSplashes(dropX, dropY, size) {
    const numSplashes =
      Math.floor(Math.random() * Utils.CONSTANTS.MAX_SPLASHES) +
      Utils.CONSTANTS.MIN_SPLASHES;

    for (let i = 0; i < numSplashes; i++) {
      this.splashes.push(new Splash(this.grid, this.mouse, dropX, dropY));
    }
  }

  /**
   * Handles the collision between a raindrop and the ground.
   *
   * @param { Raindrop } drop
   */
  handleSplashCollision(drop) {
    const splashSize = drop.w;
    this.generateSplashes(drop.x, drop.y, splashSize);
  }

  /**
   * Moves the raindrops.
   */
  moveRaindrops() {
    for (const drop of this.raindrops) {
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
        this.delRaindrop(drop);
      }
    }
  }

  /**
   * Moves the splashes.
   */
  moveSplashes() {
    for (const splash of this.splashes) {
      splash.update();
      if (
        splash.y > this.grid.height ||
        splash.x > this.grid.width ||
        splash.currentTime - splash.startTime > Utils.CONSTANTS.SPLASH_DURATION
      ) {
        this.delSplash(splash);
      }
    }
  }

  /**
   * Deletes a raindrop from the raindrops array.
   */
  delRaindrop(drop) {
    const dropIndex = this.raindrops.indexOf(drop);
    if (dropIndex > -1) {
      this.raindrops.splice(dropIndex, 1);
    }
  }

  /**
   * Delete a splash from the splashes array.
   */
  delSplash(splash) {
    const splashIndex = this.splashes.indexOf(splash);
    if (splashIndex > -1) {
      this.splashes.splice(splashIndex, 1);
    }
  }

  /**
   * Updates and renders the raindrops and splashes.
   */
  updateAndRender() {
    this.generateRaindrop();
    this.moveRaindrops();
    this.moveSplashes();
  }
}
