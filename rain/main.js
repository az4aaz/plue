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
event.addEventListeners();

// Main animation loop
function animate() {
  canvas.clearAll();
  rainController.updateAndRender();
  requestAnimationFrame(animate);
}

// Start animation
animate();
