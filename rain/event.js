import { fetchWindData } from "./api.js";
import { Canvas } from "./canvas.js";

console.log("rain/event.js has been loaded.");

export class Event {
  /**
   * Responsible for handling events.
   *
   * @param { Object.<string, number> } CONSTANTS
   * @param { Window } window
   * @param { Canvas } canvas
   * @param { { x: number, y: number } } mouse
   */
  constructor(CONSTANTS, window, canvas, mouse) {
    this.CONSTANTS = CONSTANTS;
    this.window = window;
    this.canvas = canvas;
    this.mouse = mouse;
  }

  /**
   * Updates mouse position.
   *
   * @param { MouseEvent } e
   */
  handleMouseMove(e) {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
  }

  /**
   * Updates scroll position.
   *
   * @param { Event } e
   */
  handleScroll() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.body.clientHeight,
      document.documentElement.clientHeight,
    );
    const winHeight = window.innerHeight;
    const scrollPercent = scrollTop / (docHeight - winHeight);
    const varscrollSteps = Math.round(
      scrollPercent * this.CONSTANTS.RAIN_STEPS,
    );
  }

  /**
   * Fetches wind data and resizes canvas.
   *
   * @param { Event } e
   */
  handleDOMContentLoad() {
    fetchWindData();
    this.canvas.resize();
  }

  /**
   * Adds event listeners.
   */
  addEventListeners() {
    document.addEventListener("mousemove", this.handleMouseMove.bind(this));
    window.addEventListener("scroll", this.handleScroll.bind(this));
    window.addEventListener(
      "DOMContentLoaded",
      this.handleDOMContentLoad.bind(this),
    );
  }
}
