import { RainController } from "./rain/controller.js";
import { SuspendedLantern } from "./light.js";
import { Utils } from "./constants.js";
import { NeoPixelGrid } from "./grid.js";
import { Image } from "./image.js";

// Initialize mouse position
let mouse = {
  x: 0,
  y: 0,
};

// Initialize grid
let grid;

// Initialize rain controller
let rainController;

// Initialize light
let light;

// Initialize weather
let weather = "rain";

// Initialize playing boolean
let playing = true;

// Make the Utils class global
window.Utils = Utils;

// Initialize the image
let img;

// Initialize the image

// Initialize p5 instance
const pInstance = new p5((p) => {
  p.setup = () => {
    let cnv = p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
    cnv.id(Utils.CONSTANTS.CANVAS.ID);
    mouse = {
      x: p.width / 2,
      y: p.height / 2 - 100,
    };
    p.background(Utils.CONSTANTS.CANVAS.BACKGROUND_COLOR);
    grid = new NeoPixelGrid(
      p,
      Utils.CONSTANTS.CANVAS.RESOLUTION,
      p.height,
      p.width
    );
    img = new Image(grid, "../assets/img/courbet.png", 0, 0);
    light = new SuspendedLantern(grid, mouse);
    rainController = new RainController(grid, mouse, light);
  };

  p.draw = () => {
    p.translate(-p.width / 2, -p.height / 2);
    p.clear();
    p.background(Utils.CONSTANTS.CANVAS.BACKGROUND_COLOR);
    grid.clear();
    img.render();

    if (!playing) {
      rainController.render();
    } else {
      rainController.updateAndRender(p);
    }
    light.move();
    light.render();
    grid.render();
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  // Play the loop
  document.getElementById("play_pause").addEventListener("click", function () {
    changePlayingStatus();
  });

  // Change weather
  document.getElementById("weather").addEventListener("click", function () {
    if (weather === "rain") {
      weather = "sun";
      document.getElementById("weather").innerText = "🌧";
    } else if (weather === "sun") {
      weather = "rain";
      document.getElementById("weather").innerText = "☀";
    }
  });

  // update mouse position
  p.mouseMoved = () => {
    mouse.x = p.mouseX;
    mouse.y = p.mouseY;
  };

  function changePlayingStatus() {
    if (!playing) {
      playing = true;
      document.getElementById("play_pause").innerText = "⏸";
    } else {
      playing = false;
      document.getElementById("play_pause").innerText = "⏵";
    }
  }

  // When the spacebar is pressed, change the loop playing state
  p.keyTyped = () => {
    if (p.keyCode === 32) {
      changePlayingStatus();
    }
  };
});
