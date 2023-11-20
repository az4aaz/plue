import { CONSTANTS } from "./constants.js";
import { RainController } from "./controller.js";
import { Event } from "./event.js";
import { Canvas } from "./canvas.js";

console.log("rain/main.js has been loaded.");

// Get canvas and context
const canvas = new Canvas(CONSTANTS.CANVAS_ID);

// Initialize mouse position
const mouse = { x: 0, y: 0 };

// Initialize rain controller
const rainController = new RainController(CONSTANTS, canvas, mouse);

// Initialize event handlers
const event = new Event(CONSTANTS, window, canvas, mouse);
let frameCount = 0;
let updateEveryFrames = 1;
event.addEventListeners();

let animationFrameId = null;

function start() {
  animationFrameId = requestAnimationFrame(animate.bind(this));
}

function pause() {
  cancelAnimationFrame(animationFrameId);
}

function nextStep() {
  canvas.clearAll();
  rainController.updateAndRender();
}
window.start = start;
window.pause = pause;
window.nextStep = nextStep;
window.raindrops = rainController.raindrops;
window.splashes = rainController.splashes;
window.updateEveryFrames = updateEveryFrames;

// Main animation loop
function animate() {
  if (frameCount % updateEveryFrames === 0) {
    canvas.clearAll();
    rainController.updateAndRender();
  }
  frameCount++;
  animationFrameId = requestAnimationFrame(animate);
}

// Start animation
animate();
