import { Raindrop } from "./raindrop.js";
import { Splash } from "./splash.js";

console.log("rain/controller.js has been loaded.");

export class RainController {
  /**
   * Generating and moving raindrops and splashes.
   *
   * @param { Object.<string, number> } CONSTANTS
   * @param { Canvas } canvas
   * @param { { x: number, y: number } } mouse
   */
  constructor(CONSTANTS, canvas, mouse) {
    this.CONSTANTS = CONSTANTS;
    this.canvas = canvas;
    this.mouse = mouse;
    this.ctx = this.canvas.ctx;
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
    this.raindrops.push(new Raindrop(this.CONSTANTS, this.canvas, this.mouse));
  }

  /**
   * Generates splashes and pushes them to the splashes array.
   *
   * @param { number } dropX
   * @param { number } dropY
   * @param { number } size
   */
  generateSplashes(dropX, dropY, size) {
    const numSplashes =
      Math.floor(Math.random() * this.CONSTANTS.MAX_SPLASHES) + 1;

    for (let i = 0; i < numSplashes; i++) {
      const splashSize = Math.random() * size;
      const splashSpeed = Math.random() * 2;

      this.splashes.push(new Splash(dropX, dropY, splashSize, splashSpeed));
    }
  }

  /**
   * Handles the collision between a raindrop and the ground.
   *
   * @param { Raindrop } drop
   */
  handleSplashCollision(drop) {
    const splashSize = drop.w;
    this.generateSplash(drop.a, drop.b, splashSize);
  }

  /**
   * Moves the raindrops.
   */
  moveRaindrops() {
    for (const drop of this.raindrops) {
      drop.move();
      if (drop.isOnCanvas() && !drop.isOverlappingImage(images)) {
        if (drop.isInMouseRadius()) {
          this.delRaindrop(drop);
        } else {
          this.render();
        }
      } else {
        this.delRaindrop(drop);
      }

      if (drop.isOnTheGround()) {
        const collisionEvent = new CustomEvent("raindropCollision", {
          detail: drop,
        });
        window.dispatchEvent(collisionEvent);
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
        splash.y > this.ctx.height ||
        splash.x > this.ctx.width ||
        splash.currentTime - splash.startTime > CONSTANTS.SPLASH_DURATION
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
