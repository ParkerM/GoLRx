import {Subject} from "rxjs";
import {EventEmitter} from 'events';

class Grid {

  /**
   * Dummy cell to represent oob
   * @type {Cell}
   */
  #oobCell;

  /** @type {Array<Array<Cell>>} */
  #plane;

  /** @type {number} */
  xLen;

  /** @type {number} */
  yLen;

  /** @type {EventEmitter} */
  emitter = new EventEmitter();

  /**
   * @param {number} width - Width of grid (integer)
   * @param {number} height - Height of grid (integer)
   */
  constructor(width, height) {
    this.#oobCell = new Cell(null, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);
    this.xLen = width;
    this.yLen = height;
    this.initPlane();
  }

  initPlane() {
    this.#plane = new Array(this.xLen);
    for (let x = 0; x < this.xLen; x++) {
      let col = new Array(this.yLen);
      for (let y = 0; y < this.yLen; y++) {
        col[y] = new Cell(this, x, y);
      }
      this.#plane[x] = col;
    }
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  activateCell(x, y) {
    this.getCellAt(x, y).alive = true;
  }

  /**
   * @param {number} x
   * @param {number} y
   * @returns {Cell}
   */
  getCellAt(x, y) {
    if (!this.insideBounds([x, y])) return this.#oobCell;
    return this.#plane[x][y];
  }

  /**
   * @returns {boolean[][]} - A grid of live (true) and dead (false) cells
   */
  getGrid() {
    return this.#plane.map(row => row.map(cell => cell.alive));
  }

  /**
   * Returns true if (x,y) are within bounds
   *
   * @param x {number}
   * @param y {number}
   * @return {boolean}
   */
  insideBounds = ([x, y]) =>
      x >= 0 &&
      y >= 0 &&
      x < this.xLen &&
      y < this.yLen;

  /**
   * Gets cells immediately adjacent to the given coordinates
   * @param {number} xPos
   * @param {number} yPos
   * @returns {Cell[]}
   */
  getAdjacentCells(xPos, yPos) {
    const neighborCells = [
        [-1 + xPos, -1 + yPos],
        [ 0 + xPos, -1 + yPos],
        [ 1 + xPos, -1 + yPos],
        [-1 + xPos,  0 + yPos],
        [ 1 + xPos,  0 + yPos],
        [-1 + xPos,  1 + yPos],
        [ 0 + xPos,  1 + yPos],
        [ 1 + xPos,  1 + yPos],
    ];

    return neighborCells
        .filter(this.insideBounds)
        .map(([x, y]) => this.getCellAt(x, y));
  }

  /**
   * Notifies all cells to prepare and perform their next state change.
   */
  transition() {
    for (let x = 0; x < this.xLen; x++) {
      for (let y = 0; y < this.yLen; y++) {
        this.getCellAt(x, y).prepareNextState();
      }
    }

    for (let x = 0; x < this.xLen; x++) {
      for (let y = 0; y < this.yLen; y++) {
        this.getCellAt(x, y).transitionToNextState();
      }
    }
  }
}

class Cell {

  subject;

  /**
   * Reference to the parent grid
   * @type {Grid}
   */
  grid;

  /**
   * X position within {@link grid}
   * @type {number}
   */
  #posX;

  /**
   * Y position within {@link grid}
   * @type {number}
   */
  #posY;

  /**
   * Whether the cell is currently alive.
   * See: {@link #next}
   * @type {boolean}
   */
  alive;

  /**
   * The state the cell will transition to on the next tick.
   * See: {@link alive}
   * @type {boolean}
   */
  #next;

  /**
   * @param {Grid} grid
   * @param {number} x
   * @param {number} y
   */
  constructor(grid, x, y) {
    this.#posX = x;
    this.#posY = y;
    this.grid = grid;
    this.alive = false;
    this.subject = new Subject();
  }

  /**
   * Determine and set the {@link #next} state for this cell based on
   * how many of its neighbors' are currently {@link alive}.
   */
  prepareNextState() {
    let livingNeighborCount = this.grid
        .getAdjacentCells(this.#posX, this.#posY)
        .filter(cell => cell.alive)
        .length;

    if (this.alive) {
      if (livingNeighborCount < 2) {
        this.#next = false;
      } else if (livingNeighborCount === 2 || livingNeighborCount === 3) {
        this.#next = true;
      } else if (livingNeighborCount > 3) {
        this.#next = false;
      }
    } else this.#next = livingNeighborCount === 3;
  }

  /**
   * Update this cell's state
   */
  transitionToNextState() {
    this.alive = this.#next;
    this.#next = undefined;
  }
}

export {Cell, Grid};
