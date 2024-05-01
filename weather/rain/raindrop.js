import { Utils } from "../constants.js";

export class Raindrop {
  /**
   * Responsible for generating and moving raindrops.
   *
   * @param { NeoPixelGrid } grid
   * @param { { x: number, y: number } } mouse
   * @property { number } lineLength
   * @property { number } x
   * @property { number } y
   * @property { number } width
   * @property { number } speed
   */
  constructor(grid, mouse) {
    this.grid = grid;
    this.mouse = mouse;
    this.lineLength = Math.floor(
      Utils.randomBetween(
        Utils.CONSTANTS.MIN_LINE_LENGTH,
        Utils.CONSTANTS.MAX_LINE_LENGTH
      )
    );
    this.x = Math.floor(Utils.randomBetween(-this.grid.width, this.grid.width));
    this.y = -this.lineLength;
    this.width = Utils.randomBetween(
      Utils.CONSTANTS.MIN_WIDTH,
      Utils.CONSTANTS.MAX_WIDTH
    );
    this.speed = Math.floor(
      Utils.calculateSpeed(this.grid.resolution) + this.width
    );
    this.angle = Math.PI / 2 - 0.2;
    this.cosAngle = Math.cos(this.angle);
    this.sinAngle = Math.sin(this.angle);
  }

  /**
   * Moves the raindrop.
   */
  move() {
    let newX = this.x + this.cosAngle * this.speed;
    let newY = this.y + this.sinAngle * this.speed;

    if (newX | (0 !== this.x) | 0 || newY | (0 !== this.y) | 0) {
      this.x = newX;
      this.y = newY;
    }
  }

  /**
   * Renders the raindrop.
   */
  render() {
    let cosI = this.cosAngle;
    let sinI = this.sinAngle;
    for (let i = 0; i < this.lineLength; i++) {
      let x = (this.x + cosI * i) | 0;
      let y = (this.y + sinI * i) | 0;
      this.grid.setPixel(x, y, Utils.CONSTANTS.RAINDROP_COLOR);
      cosI += this.cosAngle;
      sinI += this.sinAngle;
    }
  }

  /**
   * Checks if the raindrop is on the ground.
   *
   * @returns { boolean }
   */
  isOnTheGround() {
    return this.y >= this.grid.height - Utils.CONSTANTS.GROUND_LEVEL;
  }

  /**
   * Checks if the raindrop is on the canvas.
   *
   * @returns { boolean }
   */
  isOnCanvas() {
    return (
      this.x <= this.grid.width &&
      this.y <= this.grid.height - Utils.CONSTANTS.GROUND_LEVEL
    );
  }

  /**
   * Checks if the raindrop is in the mouse radius.
   *
   * @returns { boolean }
   */
  isInMouseRadius() {
    return (
      this.x <= this.mouse.x + Utils.CONSTANTS.MOUSE_RADIUS &&
      this.x >= this.mouse.x - Utils.CONSTANTS.MOUSE_RADIUS &&
      this.y <= this.mouse.y + Utils.CONSTANTS.MOUSE_RADIUS &&
      this.y >= this.mouse.y - Utils.CONSTANTS.MOUSE_RADIUS
    );
  }

  /**
   * Checks if the raindrop is overlapping an image.
   *
   * @param { array } images
   * @returns { boolean }
   */
  isOverlappingImage(images) {
    const raindropRect = {
      left: this.a - this.width * 2,
      right: this.a + Math.cos(angle) * this.y + this.width * 2,
      top: this.b - this.width * 2,
      bottom: this.b + Math.sin(angle) * this.y + this.width * 2,
    };

    return Array.from(images).some((image) => {
      let rect = image.getBoundingClientRect();
      return (
        raindropRect.left <= rect.right + 10 &&
        raindropRect.right >= rect.left - 10 &&
        raindropRect.top <= rect.bottom &&
        raindropRect.bottom >= rect.top - 10
      );
    });
  }
}
