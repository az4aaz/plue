import { CONSTANTS } from "./constants.js";
import { RainController } from "./controller.js";
import { Event } from "./event.js";
import { Canvas } from "./canvas.js";
import { RectElement } from "./rectelement.js";

console.log("rain/main.js has been loaded.");

// Get canvas and context
const canvas = new Canvas(CONSTANTS.CANVAS_ID);

// Initialize mouse position
const mouse = { x: 0, y: 0 };

// Initialize event handlers
const event = new Event(CONSTANTS, window, canvas, mouse);
event.addEventListeners();

// Initialize a rect element
const elementList = [];
const element = new RectElement(
    CONSTANTS,
    canvas,
    window.innerWidth / 2 - 100,
    window.innerHeight / 2 - 100,
    window.innerWidth / 2 + 100,
    window.innerHeight / 2 + 100
);
elementList.push(element);

// Initialize rain controller
const rainController = new RainController(
    CONSTANTS,
    canvas,
    mouse,
    event,
    elementList
);

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

// Expose some variables to the window
window.start = start;
window.pause = pause;
window.nextStep = nextStep;
window.raindrops = rainController.raindrops;
window.splashes = rainController.splashes;

// Main animation loop
function animate() {
    canvas.clearAll();
    rainController.updateAndRender();
    element.render();
    animationFrameId = requestAnimationFrame(animate);
}

// Start animation
animate();
