export class Canvas {
  /**
   * Responsible for handling the canvas.
   *
   * @param { string } canvasId
   * @property { HTMLCanvasElement } canvasElement
   * @property { CanvasRenderingContext2D } ctx
   */
  constructor(canvasId) {
    this.canvasElement = document.getElementById(canvasId);
    this.ctx = this.canvasElement.getContext("2d");
  }

  /**
   * Resizes the canvas to the window's width and height.
   */
  resize() {
    this.canvasElement.width = window.innerWidth;
    this.canvasElement.height = window.innerHeight;
  }

  /**
   * Clears the entire canvas.
   */
  clearAll() {
    this.ctx.clearRect(
      0,
      0,
      this.canvasElement.width,
      this.canvasElement.height,
    );
  }
}
