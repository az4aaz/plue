export class NeoPixelGrid {
  constructor(p, resolution, height, width) {
    this.p = p;
    this.resolution = resolution;
    this.height = Math.ceil(height / resolution);
    this.width = Math.ceil(width / resolution);
    this.pixels = Array.from({ length: this.height }, () => Array(this.width).fill(null));
    this.dirtyPixels = new Set();
  }

  _getKey(x, y) {
    return (y << 16) | x;
  }

  _unpackKey(key) {
    return {
      x: key & 0xFFFF,
      y: key >>> 16
    };
  }

  setPixel(x, y, color) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.pixels[y][x] = color;
      this.dirtyPixels.add(this._getKey(x, y));
    }
  }

  getPixel(x, y) {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      return this.pixels[y][x];
    }
    return null;
  }

  clear() {
    for (const key of this.dirtyPixels) {
      const {x, y} = this._unpackKey(key);
      this.pixels[y][x] = null;
    }
    this.dirtyPixels.clear();
  }

  render() {
    const res = this.resolution;
    this.p.noStroke();

    for (const key of this.dirtyPixels) {
      const {x, y} = this._unpackKey(key);
      const color = this.pixels[y][x];

      if (color) {
        this.p.fill(color);
        this.p.rect(x * res, y * res, res, res);
      }
    }
  }
}
