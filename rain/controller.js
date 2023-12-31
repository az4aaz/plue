import { Raindrop } from "./raindrop.js";
import { RectElement } from "./rectelement.js";
import { Splash } from "./splash.js";

console.log("rain/controller.js has been loaded.");

export class RainController {
    /**
     * Generating and moving raindrops and splashes.
     *
     * @param { Object.<string, number> } CONSTANTS
     * @param { Canvas } canvas
     * @param { { x: number, y: number } } mouse
     * @param { Event } event
     * @param { Array.<RectElement> } elements
     */
    constructor(CONSTANTS, canvas, mouse, event, elements) {
        this.CONSTANTS = CONSTANTS;
        this.canvas = canvas;
        this.mouse = mouse;
        this.event = event;
        this.elements = elements;
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
        let scrollValue = this.event.getScroll() + 1;
        if (isNaN(scrollValue)) {
            scrollValue = 1;
        }
        window.scrollValue = this.event;
        for (let numDrops = 0; numDrops < scrollValue; numDrops++) {
            const newDrop = new Raindrop(
                this.CONSTANTS,
                this.canvas,
                this.mouse,
                this.elements
            );
            this.raindrops.push(newDrop);
        }
    }

    /**
     * Generates splashes and pushes them to the splashes array.
     *
     * @param { number } dropX
     * @param { number } dropY
     * @param { number } size
     */
    generateSplashes(dropX, dropY) {
        const numSplashes =
            Math.floor(Math.random() * this.CONSTANTS.MAX_SPLASHES) + 1;
        for (let i = 0; i < numSplashes; i++) {
            this.splashes.push(
                new Splash(
                    this.CONSTANTS,
                    this.canvas,
                    this.mouse,
                    dropX,
                    dropY
                )
            );
        }
    }

    /**
     * Handles the collision between a raindrop and the ground.
     *
     * @param { Raindrop } drop
     */
    handleSplashCollision(drop) {
        this.generateSplashes(drop.x, drop.y);
    }

    /**
     * Moves the raindrops.
     */
    moveRaindrops() {
        for (const drop of this.raindrops) {
            drop.update();
            if (!drop.isDead) {
                drop.render();
            }
        }
        this.deleteDeadRaindrops();
    }

    /**
     * Deletes raindrops that are off the screen.
     */
    deleteDeadRaindrops() {
        this.raindrops = this.raindrops.filter((drop) => !drop.isDead);
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
                splash.currentTime - splash.startTime >
                    this.CONSTANTS.SPLASH_DURATION
            ) {
                this.delSplash(splash);
            }
            splash.render();
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
