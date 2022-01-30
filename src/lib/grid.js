import {
  map,
  Observable,
  of,
  sample,
  Subject,
  Subscription,
  switchMap,
  zip,
} from 'rxjs';
import { allPairs } from './util.js';

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

  /** @type {Subject<void>} */
  notifier = new Subject();

  /**
   * Whether the game is currently running.
   * @type {boolean}
   */
  #running = false;

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
    this.#oobCell = new Cell(
      null,
      Number.NEGATIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
    );
    this.xLen = width;
    this.yLen = height;
    this.#initPlane();
    this.#introduceNeighbors();
  }

  #initPlane() {
    this.#plane = new Array(this.xLen);
    for (let x = 0; x < this.xLen; x++) {
      let col = new Array(this.yLen);
      for (let y = 0; y < this.yLen; y++) {
        col[y] = new Cell(this.notifier, x, y);
      }
      this.#plane[x] = col;
    }
  }

  /**
   * Progress the game by 1 step.
   */
  tick() {
    this.notifier.next(void 0);
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  activateCell(x, y) {
    this.getCellAt(x, y).alive = true;
  }

  /**
   * @param {[number, number][]} coords - [x,y] pairs
   */
  activateCells(coords) {
    coords.forEach(([x, y]) => (this.getCellAt(x, y).alive = true));
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
    return this.#plane.map((row) => row.map((cell) => cell.alive));
  }

  /**
   * Returns true if (x,y) are within bounds
   *
   * @param x {number}
   * @param y {number}
   * @return {boolean}
   */
  #insideBounds = ([x, y]) =>
    x >= 0 && y >= 0 && x < this.xLen && y < this.yLen;

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

  transition() {
    if (!this.#running) {
      this.#running = true;
      this.#broadcastStart();
    }
    this.notifier.next(void 0);
  }

  /**
   * @returns {Array<[number, number]>} all coordinate pairs on the grid
   */
  #coordinatePairs() {
    const xRange = Array.from({ length: this.xLen }, (v, k) => k);
    const yRange = Array.from({ length: this.yLen }, (v, k) => k);
    return allPairs(xRange, yRange);
  }

  /**
   * Attaches each cell's notifier to its neighbors' listeners.
   * Each cell's subscription is stored in {@link subscriptions}.
   */
  #introduceNeighbors() {
    return this.#coordinatePairs()
      .map(([x, y]) => [x, y, this.getCellAt(x, y)])
      .map(([x, y, cell]) =>
        cell.listenToNeighbors(
          this.#getAdjacentCells(x, y).map((c) =>
            c.neighborNotifier.asObservable(),
          ),
        ),
      )
      .forEach((subscription) => this.subscriptions.add(subscription));
  }

  /**
   * Kicks off the first notification for each cell.
   */
  #broadcastStart() {
    this.#coordinatePairs()
      .map(([x, y]) => this.getCellAt(x, y))
      .forEach((cell) => cell.start());
  }
}

class Cell {
  /**
   * Subject used to notify neighbors of current state
   * @type {Subject<boolean>}
   */
  neighborNotifier = new Subject();

  /**
   * Indicates a next step signal.
   * @type {Observable<void>}
   */
  #ticker;

  /**
   * X position within the grid.
   * @type {number}
   */
  #posX;

  /**
   * Y position within the grid.
   * @type {number}
   */
  #posY;

  /**
   * Whether the cell is currently alive.
   * @type {boolean}
   */
  alive;

  /**
   * @param {Observable<void>} ticker - the game "clock" that emits whenever state should update
   * @param {number} x
   * @param {number} y
   */
  constructor(ticker, x, y) {
    this.#posX = x;
    this.#posY = y;
    this.alive = false;
    this.#ticker = ticker;
  }

  /**
   * Returns true (alive) or false (dead) for the next state based on number of
   * living neighbor cells.
   *
   * @param livingNeighborCount {number} number of living neighbors
   * @returns {boolean}
   */
  #nextState(livingNeighborCount) {
    if (livingNeighborCount === 3) return true;
    return this.alive && livingNeighborCount === 2;
  }

  /**
   * Updates this cell's state and returns it wrapped in an observable.
   *
   * @param livingNeighborCount {number}
   * @return {Observable<boolean>}
   */
  #updateState(livingNeighborCount) {
    this.alive = this.#nextState(livingNeighborCount);
    return of(this.alive);
  }

  /**
   * Exposed to kick off the initial notification.
   */
  start() {
    this.neighborNotifier.next(this.alive);
  }

  /**
   * Subscribes to each neighbor's notifier and updates state based on the emitted
   * values on each tick signal.
   *
   * @param notifiers {Observable<boolean>[]}
   * @return {Subscription}
   */
  listenToNeighbors(notifiers) {
    return zip(notifiers)
      .pipe(
        sample(this.#ticker),
        map((bools) => bools.filter((b) => !!b).length),
        switchMap((neighborCount) => this.#updateState(neighborCount)),
      )
      .subscribe({
        next: (state) => this.neighborNotifier.next(state),
        error: (err) =>
          console.error(`Error in cell ${this.#posX},${this.#posY}: ${err}`),
      });
  }
}

export { Cell, Grid };
