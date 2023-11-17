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
   */
  constructor(CONSTANTS, canvas, mouse) {
    this.CONSTANTS = CONSTANTS;
    this.canvas = canvas;
    this.mouse = mouse;
    this.ctx = this.canvas.ctx;
    this.lineLength = Math.random() * CONSTANTS.MAX_LINE_LENGTH;
    this.x = Math.random() * this.canvas.canvasElement.width;
    this.y = -this.lineLength;
    this.width = Math.random() * 2;
    this.speed = Math.random() * 2 + 1;
    this.angle = (Math.random() * Math.PI) / 180;
  }

  /**
   * Updates the raindrop.
   */
  update() {
    this.move();
    this.render();
  }

  /**
   * Moves the raindrop.
   */
  move() {
    this.bPosition += this.speed * Math.sin(this.angle);
    this.aPosition += this.speed * Math.cos(this.angle);
  }

  /**
   * Renders the raindrop.
   */
  render() {
    this.ctx.strokeStyle = this.CONSTANTS.RAINDROP_COLOR;
    this.ctx.lineWidth = this.width;
    this.ctx.beginPath();
    this.ctx.moveTo(this.aPosition, this.bPosition);
    this.ctx.lineTo(
      this.aPosition + Math.cos(this.angle) * this.y,
      this.bPosition + Math.sin(this.angle) * this.y,
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
    return (
      this.bPosition >= this.ctx.canvas.height - this.CONSTANTS.GROUND_LEVEL
    );
  }

  /**
   * Checks if the raindrop is on the canvas.
   *
   * @returns { boolean }
   */
  isOnCanvas() {
    return (
      this.a <= this.ctx.canvas.width &&
      this.b <= this.ctx.canvas.height - this.CONSTANTS.GROUND_LEVEL
    );
  }

  /**
   * Checks if the raindrop is in the mouse radius.
   *
   * @returns { boolean }
   */
  isInMouseRadius() {
    return (
      this.a <= mouse.x + CONSTANTS.MOUSE_RADIUS &&
      this.a >= mouse.x - CONSTANTS.MOUSE_RADIUS &&
      this.b <= mouse.y + CONSTANTS.MOUSE_RADIUS &&
      this.b >= mouse.y - CONSTANTS.MOUSE_RADIUS
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
