export class NeoPixelGrid {
  /**
   * A custom grid class to handle pixels.
   * @param { p5 } p
   * @param { number } resolution
   * @param { number } height
   * @param { number } width
   */
  constructor(p, resolution, height, width) {
    this.p = p;
    this.resolution = resolution;
    this.height = Math.ceil(height / resolution);
    this.width = Math.ceil(width / resolution);
    // Initialize a 2D array with null values
    this.pixels = Array.from({ length: this.width }, () =>
      Array(this.height).fill(null)
    );
  }

  setPixel(x, y, color) {
    // Check if the coordinates are within the grid
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.pixels[x][y] = color;
    }
  }

  getPixel(x, y) {
    // Check if the coordinates are within the grid
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      return this.pixels[x][y];
    }
    return null;
  }

  clear() {
    // Clear the grid by setting all pixels to null
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.pixels[x][y] = null;
      }
    }
  }

  render() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let color = this.getPixel(x, y);
        if (color) {
          this.p.noStroke();
          this.p.fill(color);
          this.p.rect(
            x * this.resolution,
            y * this.resolution,
            this.resolution,
            this.resolution
          );
        }
      }
    }
  }
}
