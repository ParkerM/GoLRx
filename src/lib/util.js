/**
 * Enum representing the state of a cell (alive or dead).
 */
class State {
  static ALIVE = new State(true);
  static DEAD = new State(false);

  /** @param alive {boolean} */
  constructor(alive) {
    this.alive = alive;
  }

  /** @returns {boolean} */
  get isAlive() {
    return this.alive;
  }

  /** @returns {boolean} */
  get isDead() {
    return !this.alive;
  }

  toString() {
    return `State.${this.alive}`;
  }
}

const boolChar = (boolVal) => {
  if (boolVal === true) return '#';
  if (boolVal === false) return '.';
  else return '?';
};

/**
 * @template C
 * @param subGrid {Array<Array<C>>}
 * @param transform {(C) => boolean} optional boolean mapper for elements in {@link subGrid}
 * @return {string} table-formatted grid
 */
function formatGrid(subGrid, transform = (c) => c) {
  let out = '---';
  out += '-'.repeat(subGrid[0].length * 2) + '\n';
  subGrid.forEach((row) => {
    out += '| ';
    out += row.map((cell) => boolChar(transform(cell))).join(' ');
    out += ' |\n';
  });
  out += '---';
  out += '-'.repeat(subGrid[0].length * 2) + '\n';
  return out;
}

/** @param subGrid {Array<Array<Cell>>} */
function printGrid(subGrid) {
  console.log(formatGrid(subGrid, (c) => c.state));
}

/**
 * @template T
 * @param a {Array<T>} first array
 * @param b {Array<T>} second array
 * @return {Array<Array<T>>} all possible pairs from the input arrays
 */
const allPairs = (a, b) => a.flatMap((x) => b.map((y) => [x, y]));

/**
 *  @abstract
 */
class Ordering {
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

export { ColMajor, RowMajor, formatGrid, printGrid, allPairs, State };
