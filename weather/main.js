import { RainController } from "./rain/controller.js";
import { SuspendedLantern } from "./light.js";
import { Utils } from "./constants.js";
import { NeoPixelGrid } from "./grid.js";

// Initialize mouse position
const mouse = { x: 0, y: 0 };

// Initialize grid
let grid;

// Initialize rain controller
let rainController;

// Initialize light
let light = new SuspendedLantern(grid, mouse);

// Initialize weather
let weather = "rain";

// Initialize playing boolean
let playing = true;

// Initialize p5 instance
const pInstance = new p5((p) => {
    p.setup = () => {
        let cnv = p.createCanvas(p.windowWidth, p.windowHeight);
        cnv.id(Utils.CONSTANTS.CANVAS_ID);
        p.background("#131313");
        grid = new NeoPixelGrid(
            p,
            Utils.CONSTANTS.RESOLUTION,
            p.height,
            p.width
        );
        light = new SuspendedLantern(grid, mouse);
        rainController = new RainController(grid, mouse, light);
    };

    p.draw = () => {
        if (!playing) {
            p.clear();
            p.background("#131313");
            rainController.render();
            light.render();
            grid.render();
        } else {
            p.clear();
            p.background("#131313");
            grid.clear();
            light.render();
            rainController.updateAndRender(p);
            grid.render();
        }
    };

    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    };

    // Play the loop
    document
        .getElementById("play_pause")
        .addEventListener("click", function () {
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
        light.move();
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
