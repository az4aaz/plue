console.log("rain/raindrop.js has been loaded.");

export class Raindrop {
  /**
   * Responsible for generating and moving raindrops.
   *
   * @param { Object.<string, number> } CONSTANTS
   * @param { Canvas } canvas
   * @param { { x: number, y: number } } mouse
   * @property { number } lineLength
   * @property { number } x
   * @property { number } y
   * @property { number } width
   * @property { number } speed
   * @property { number } angle
   *
   */
  constructor(CONSTANTS, canvas, mouse) {
    this.CONSTANTS = CONSTANTS;
    this.canvas = canvas;
    this.mouse = mouse;
    this.ctx = this.canvas.ctx;
    this.lineLength = Math.random() * CONSTANTS.MAX_LINE_LENGTH;
    this.x =
      this.canvas.canvasElement.width -
      Math.random() * 2 * this.canvas.canvasElement.width;
    this.y = -this.lineLength;
    this.width = Math.random() * 2;
    this.speed =
      Math.random() * (this.CONSTANTS.MAX_SPEED - this.CONSTANTS.MIN_SPEED) +
      this.CONSTANTS.MIN_SPEED;
    this.angle = 10 * (Math.PI / 180);
  }

  /**
   * Moves the raindrop.
   */
  move() {
    this.x += this.speed * Math.sin(this.angle);
    this.y += this.speed * Math.cos(this.angle);
  }

  /**
   * Renders the raindrop.
   */
  render() {
    this.ctx.strokeStyle = this.CONSTANTS.RAINDROP_COLOR;
    this.ctx.lineWidth = this.width;
    this.ctx.beginPath();
    this.ctx.moveTo(this.x, this.y);
    this.ctx.lineTo(
      this.x + Math.cos(this.angle),
      this.y + Math.sin(this.angle) * this.lineLength,
    );
    this.ctx.closePath();
    this.ctx.stroke();
  }

  /**
   * Checks if the raindrop is on the ground.
   *
   * @returns { boolean }
   */
  isOnTheGround() {
    return this.y >= this.ctx.canvas.height - this.CONSTANTS.GROUND_LEVEL;
  }

  /**
   * Checks if the raindrop is on the canvas.
   *
   * @returns { boolean }
   */
  isOnCanvas() {
    return (
      this.x <= this.canvas.canvasElement.width &&
      this.y <= this.canvas.canvasElement.height - this.CONSTANTS.GROUND_LEVEL
    );
  }

  /**
   * Checks if the raindrop is in the mouse radius.
   *
   * @returns { boolean }
   */
  isInMouseRadius() {
    return (
      this.x <= this.mouse.x + this.CONSTANTS.MOUSE_RADIUS &&
      this.x >= this.mouse.x - this.CONSTANTS.MOUSE_RADIUS &&
      this.y <= this.mouse.y + this.CONSTANTS.MOUSE_RADIUS &&
      this.y >= this.mouse.y - this.CONSTANTS.MOUSE_RADIUS
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
