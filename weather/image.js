import { NeoPixelGrid } from "./grid.js";
import { Utils } from "./constants.js";

export class Image {
  /**
   * A custom image class to draw images on the grid.
   *
   * @param { NeoPixelGrid }
   * @param { string } imagePath
   * @param { number } x
   * @param { number } y
   */
  constructor(grid, imagePath, x, y) {
    this.grid = grid;
    this.imagePath = imagePath;
    this.image = this.grid.p.loadImage(this.imagePath);
    this.x = x;
    this.y = y;

    // Convert the image to pixels
    this.imagePixel = Utils.imageToGrid(this.image, this.grid.resolution);
    console.log(this.imagePixel);
  }

  /**
   * Renders the image on the grid.
   */
  render() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        let color = this.imagePixel[y][x];
        this.grid.setPixel(this.x + x, this.y + y, color);
      }
    }
  }
}
