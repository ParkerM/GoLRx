/**
 *  @abstract
 */
export class Ordering {
  /** @member {number} - leading dimension */
  ld;

  constructor(ld) {
    this.ld = ld;
  }

  /**
   * @abstract
   * @param {number} row - row accessor
   * @param {number} col - col accessor
   * @returns {number} - address i
   */
  toI(row, col) {}

  /**
   * @abstract
   * @param {number} i - address i
   * @returns {[number, number]} - [row, col] accessors
   */
  fromI(i) {}
}
class RowMajor extends Ordering {
  constructor(width) {
    super(width);
  }

  toI(row, col) {
    return this.ld * row + col;
  }

  fromI(i) {
    const row = Math.floor(i / this.ld);
    const col = i - row * this.ld;
    return [row, col];
  }
}

class ColMajor extends Ordering {
  constructor(height) {
    super(height);
  }

  toI(row, col) {
    return this.ld * col + row;
  }

  fromI(i) {
    const col = Math.floor(i / this.ld);
    const row = i - col * this.ld;
    return [row, col];
  }
}

export { ColMajor, RowMajor };
