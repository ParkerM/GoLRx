import { BehaviorSubject, filter, Subject, Subscription } from 'rxjs';
import { allPairs, State } from './util.js';
import { Cell } from './cell.js';

class Grid {
  /**
   * Dummy cell to represent oob
   * @type {Cell}
   */
  #oobCell;

  /** @type {Array<Array<Cell>>} */
  #plane;

  /** @type {number} */
  width;

  /** @type {number} */
  height;

  /** @type {Subject<void>} */
  notifier = new Subject();

  /** @type {Subject<[number, number, State]>} */
  changeEmitter = new Subject();

  /**
   * Whether the game is currently running.
   * @type {BehaviorSubject<boolean>}
   */
  #running = new BehaviorSubject(false);

  /**
   * All subscriptions observed by cells in the grid.
   * @type {Subscription}
   */
  subscriptions = new Subscription();

  /**
   * @param {number} width - Width of grid (integer)
   * @param {number} height - Height of grid (integer)
   */
  constructor(width, height) {
    this.#oobCell = new Cell(null, NaN, NaN);
    this.width = width;
    this.height = height;
    this.#initPlane();
    this.#introduceNeighbors();
  }

  #initPlane() {
    const hCells = this.width;
    const vCells = this.height;
    this.#plane = [];
    for (let x = 0; x < hCells; x++) {
      this.#plane[x] = [];
      for (let y = 0; y < vCells; y++) {
        this.#plane[x].push(new Cell(this.notifier, x, y, this.changeEmitter));
      }
    }
  }

  /**
   * Attaches each cell's notifier to its neighbors' listeners.
   * Each cell's subscription is stored in {@link subscriptions}.
   */
  #introduceNeighbors() {
    this.#coordinatePairs()
      .map(([x, y]) => [x, y, this.getCellAt(x, y)])
      .forEach(([x, y, cell]) =>
        this.#getAdjacentCells(x, y).forEach((neighbor) =>
          neighbor.addNeighbor(cell),
        ),
      );
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  activateCell(x, y) {
    this.getCellAt(x, y).state = State.ALIVE;
  }

  /**
   * @param {[number, number][]} coords - [x,y] pairs
   */
  activateCells(coords) {
    coords.forEach(([x, y]) => (this.getCellAt(x, y).state = State.ALIVE));
  }

  /**
   * @param {number} x
   * @param {number} y
   * @param {State} state - whether the cell is alive or dead.
   */
  setCellState(x, y, state) {
    this.getCellAt(x, y).state = state;
  }

  /**
   * Sets all cells to the given state
   * @param {State} state
   */
  setAllCellStates(state) {
    this.allCells.forEach((cell) => (cell.state = state));
  }

  /**
   * @param {number} x
   * @param {number} y
   * @returns {Cell}
   */
  getCellAt(x, y) {
    if (!this.#insideBounds([x, y])) return this.#oobCell;
    return this.#plane[x][y];
  }

  /**
   * @returns {boolean[][]} - A grid of live (true) and dead (false) cells
   */
  getGrid() {
    return this.#plane.map((row) => row.map((cell) => cell.state.isAlive));
  }

  /**
   * Returns true if (x,y) are within bounds
   *
   * @param x {number}
   * @param y {number}
   * @return {boolean}
   */
  #insideBounds = ([x, y]) =>
    x >= 0 && y >= 0 && x < this.width && y < this.height;

  /**
   * Gets cells immediately adjacent to the given coordinates, excluding any
   * cells out of bounds.
   *
   * @param {number} xPos
   * @param {number} yPos
   * @returns {Cell[]}
   */
  #getAdjacentCells(xPos, yPos) {
    const neighborCells = [
      [-1 + xPos, -1 + yPos],
      [0 + xPos, -1 + yPos],
      [1 + xPos, -1 + yPos],
      [-1 + xPos, 0 + yPos],
      [1 + xPos, 0 + yPos],
      [-1 + xPos, 1 + yPos],
      [0 + xPos, 1 + yPos],
      [1 + xPos, 1 + yPos],
    ];

    return neighborCells
      .filter(this.#insideBounds)
      .map(([x, y]) => this.getCellAt(x, y));
  }

  tick() {
    this.#running.next(true);
    this.#broadcastStart();
    this.notifier.next(void 0);
    this.#running.next(false);
  }

  transition() {
    if (!this.#running.getValue()) {
      this.#running.next(true);
      this.#broadcastStart();
    }
    this.notifier.next(void 0);
  }

  /**
   * @returns {Array<[number, number]>} all coordinate pairs on the grid
   */
  #coordinatePairs() {
    const xRange = Array.from({ length: this.width }, (v, k) => k);
    const yRange = Array.from({ length: this.height }, (v, k) => k);
    return allPairs(xRange, yRange);
  }

  /**
   * Kicks off the first notification for each cell.
   */
  #broadcastStart() {
    this.allCells.forEach((cell) => cell.start(this.stopSignal));
  }

  get running() {
    return this.#running.getValue();
  }

  get stopSignal() {
    return this.#running.pipe(filter((isRunning) => !isRunning));
  }

  /**
   * @returns {Cell[]} - all cells on the grid.
   */
  get allCells() {
    return this.#coordinatePairs().map(([x, y]) => this.getCellAt(x, y));
  }
}

export { Grid };
