import { RainController } from "./rain/controller.js";
import { SuspendedLantern } from "./light.js";
import { Utils } from "./constants.js";
import { NeoPixelGrid } from "./grid.js";
import { Image } from "./image.js";

// Initialize mouse position
const mouse = {
  x: 100,
  y: 100,
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
    let cnv = p.createCanvas(p.windowWidth, p.windowHeight);
    cnv.id(Utils.CONSTANTS.CANVAS.ID);
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
    if (!playing) {
      p.clear();
      p.background(Utils.CONSTANTS.CANVAS.BACKGROUND_COLOR);
      grid.clear();
      // rainController.render();
      light.move();
      light.render();
      img.render();
      grid.render();
    } else {
      p.clear();
      p.background(Utils.CONSTANTS.CANVAS.BACKGROUND_COLOR);
      grid.clear();
      light.move();
      light.render();
      img.render();

      //rainController.updateAndRender(p);
      grid.render();
    }
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
