import { RainController } from "./rain/controller.js";
import { Utils } from "./constants.js";
import { NeoPixelGrid } from "./grid.js";

// Initialize mouse position
const mouse = { x: 0, y: 0 };

// Initialize grid
let grid;

// Initialize rain controller
let rainController;

let weather = "rain";

const pInstance = new p5((p) => {
  p.setup = () => {
    let cnv = p.createCanvas(p.windowWidth, p.windowHeight);
    cnv.id(Utils.CONSTANTS.CANVAS_ID);
    p.background("#131313");
    grid = new NeoPixelGrid(p, Utils.CONSTANTS.RESOLUTION, p.height, p.width);
    rainController = new RainController(grid, mouse);
    document.getElementById("play").disabled = true;
  };

  p.draw = () => {
    p.clear();
    p.background("#131313");
    grid.clear();
    rainController.updateAndRender(p);
    grid.render();
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
  };

  // Play the loop
  document.getElementById("play").addEventListener("click", function () {
    p.loop();
    document.getElementById("play").disabled = true;
    document.getElementById("pause").disabled = false;
  });

  // Pause the loop
  document.getElementById("pause").addEventListener("click", function () {
    p.noLoop();
    document.getElementById("pause").disabled = true;
    document.getElementById("play").disabled = false;
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
});
