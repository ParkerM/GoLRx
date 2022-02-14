import { BehaviorSubject, filter, Subject, Subscription } from '../../_snowpack/pkg/rxjs.js';
import { RowMajor, State } from './util.js';
import { Cell } from './cell.js';

class Grid {
  /**
   * Dummy cell to represent oob
   * @type {Cell}
   */
  #oobCell;

  /** @type {Array<Cell>} */
  #plane;

  /** @member {Ordering} */
  #ordering;

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
    this.#ordering = new RowMajor(width);
    this.#initPlane();
    this.#introduceNeighbors();
  }

  #initPlane() {
    this.#plane = new Array(this.width * this.height);
    for (let i = 0; i < this.#plane.length; i++) {
      const [row, col] = this.#ordering.fromI(i);
      this.#plane[i] = new Cell(this.notifier, col, row, this.changeEmitter);
    }
  }

  /**
   * Attaches each cell's notifier to its neighbors' listeners.
   * Each cell's subscription is stored in {@link subscriptions}.
   */
  #introduceNeighbors() {
    this.#plane.forEach((cell, i) =>
      this.#getNeighborhood(i).forEach((neighbor) =>
        neighbor.addNeighbor(cell),
      ),
    );
  }

  /**
   * @param {number} col
   * @param {number} row
   */
  activateCell(col, row) {
    this.setCellState(col, row, State.ALIVE);
  }

  /**
   * @param {[number, number][]} coords - [col,row] pairs
   */
  activateCells(coords) {
    coords.forEach(([col, row]) => this.setCellState(col, row, State.ALIVE));
  }

  /**
   * @param {number} col
   * @param {number} row
   * @param {State} state - whether the cell is alive or dead.
   */
  setCellState(col, row, state) {
    this.getCellAt(col, row).state = state;
  }

  /**
   * Sets all cells to the given state
   * @param {State} state
   */
  setAllCellStates(state) {
    this.allCells.forEach((cell) => (cell.state = state));
  }

  /**
   * @param {number} col
   * @param {number} row
   * @returns {Cell}
   */
  getCellAt(col, row) {
    if (!this.#insideBounds([col, row])) {
      console.log(`returning oob cell at col=${col},row=${row}`);
      return this.#oobCell;
    }
    const i = this.#ordering.toI(row, col);
    return this.#plane[i];
  }

  /**
   * @returns {boolean[][]} - A grid of live (true) and dead (false) cells
   */
  getGrid() {
    // assumes row-major
    const majorAttribute = this.width;
    const minorAttribute = this.height;

    const arr = new Array(minorAttribute);
    for (let row = 0; row < arr.length; row++) {
      arr[row] = new Array(majorAttribute);
      for (let col = 0; col < arr[row].length; col++) {
        arr[row][col] = this.getCellAt(col, row).state.isAlive;
      }
    }

    return arr;
  }

  /**
   * Returns true if (x,y) are within bounds
   *
   * @param col {number}
   * @param row {number}
   * @return {boolean}
   */
  #insideBounds = ([col, row]) => {
    const i = this.#ordering.toI(row, col);
    return this.#insidePlane(i);
  };

  /**
   * Returns true if i is within plane
   *
   * @param {number} i - index
   * @returns {boolean} - 0 <= i < plane.length
   */
  #insidePlane = (i) => i >= 0 && i < this.width * this.height;

  /**
   * Gets cells immediately adjacent to the given accessor, excluding any
   * cells out of bounds.
   *
   * @param {number} i - cell's index in the plane
   * @returns {Cell[]}
   */
  #getNeighborhood(i) {
    const isTopEdge = i < this.width;
    const isBottomEdge = i >= this.#plane.length - this.width;
    const isLeftEdge = i % this.width === 0;
    const isRightEdge = i % this.width === this.width - 1;
    const n = i - this.width;
    const w = i - 1;
    const e = i + 1;
    const s = i + this.width;
    const nw = n - 1;
    const ne = n + 1;
    const sw = s - 1;
    const se = s + 1;

    const neighborhood = [];
    if (!isTopEdge) {
      neighborhood.push(n);
    }
    if (!isBottomEdge) {
      neighborhood.push(s);
    }
    if (!isLeftEdge) {
      neighborhood.push(w, nw, sw);
    }
    if (!isRightEdge) {
      neighborhood.push(e, ne, se);
    }

    return neighborhood.filter(this.#insidePlane).map((i) => this.#plane[i]);
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
   * Kicks off the first notification for each cell.
   */
  #broadcastStart() {
    this.allCells.forEach((cell) => cell.start(this.stopSignal));
  }

  get running() {
    return this.#running.getValue();
  }

  get stopSignal() {
    return this.#running.asObservable().pipe(filter((isRunning) => !isRunning));
  }

  /**
   * @returns {Cell[]} - all cells on the grid.
   */
  get allCells() {
    return this.#plane;
  }
}

export { Grid };
