import {
  Observable,
  Subject,
  Subscription,
  map,
  switchMapTo,
  tap,
  zip,
  zipWith,
    combineLatest,
  combineLatestWith,
  sample,
  of, switchMap
} from "rxjs";
import {allPairs} from "./util";

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
    this.#oobCell = new Cell(null, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);
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
        // this.subscriptions.add(this.notifier.subscribe(col[y].tickListener));
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
    return this.#plane.map(row => row.map(cell => cell.alive));
  }

  /**
   * Returns true if (x,y) are within bounds
   *
   * @param x {number}
   * @param y {number}
   * @return {boolean}
   */
  #insideBounds = ([x, y]) =>
      x >= 0 &&
      y >= 0 &&
      x < this.xLen &&
      y < this.yLen;

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
        [ 0 + xPos, -1 + yPos],
        [ 1 + xPos, -1 + yPos],
        [-1 + xPos,  0 + yPos],
        [ 1 + xPos,  0 + yPos],
        [-1 + xPos,  1 + yPos],
        [ 0 + xPos,  1 + yPos],
        [ 1 + xPos,  1 + yPos],
    ];

    return neighborCells
        .filter(this.#insideBounds)
        .map(([x, y]) => this.getCellAt(x, y));
  }

  // /**
  //  * Notifies all cells to prepare and perform their next state change.
  //  */
  // transition() {
  //   this.#coordinatePairs()
  //       .map(([x, y]) => this.getCellAt(x, y))
  //       .forEach(c => c.prepareNextState());
  //   this.#coordinatePairs()
  //       .map(([x, y]) => this.getCellAt(x, y))
  //       .forEach(c => c.transitionToNextState());
  // }
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
    const xRange = Array.from({length: this.xLen}, (v, k) => k);
    const yRange = Array.from({length: this.yLen}, (v, k) => k);
    return allPairs(xRange, yRange);
  }

  #introduceNeighbors() {
    return this.#coordinatePairs()
        .map(([x, y]) => [x, y, this.getCellAt(x, y)])
        .forEach(([x, y, cell]) =>
            cell.listenToNeighbors(this.#getAdjacentCells(x, y).map(c => c.neighborNotifier.asObservable()))
        );
  }

  #broadcastStart() {
    this.#coordinatePairs()
        .map(([x, y]) => this.getCellAt(x, y))
        .forEach(cell => cell.start());
  }
}

class Cell {

  // /**
  //  * Observer used to receive notifications from neighbors
  //  * @type {Subject<boolean>[]}
  //  */
  // neighborListener;
  //
  // /**
  //  * Number of adjacent cells. Used to buffer {@link neighborListener}.
  //  * @type {number}
  //  */
  // adjacentCellCount;

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
  // constructor(grid, x, y) {
  //   this.#posX = x;
  //   this.#posY = y;
  //   this.grid = grid;
  //   this.alive = false;
  //   this.adjacentCellSubject = Subject.create();
  // }

  /**
   * @param {Observable<void>} ticker
   * @param {number} x
   * @param {number} y
   */
  constructor(ticker, x, y) {
    this.#posX = x;
    this.#posY = y;
    this.alive = false;
    this.#ticker = ticker;
  }

  // /**
  //  * Determine and set the {@link #next} state for this cell based on
  //  * how many of its neighbors' are currently {@link alive}.
  //  */
  // prepareNextState() {
  //   let livingNeighborCount = this.grid
  //       .#getAdjacentCells(this.#posX, this.#posY)
  //       .filter(cell => cell.alive)
  //       .length;
  //
  //   if (livingNeighborCount === 3) this.#next = true;
  //   else this.#next = this.alive && livingNeighborCount === 2;
  // }
  //
  // /**
  //  * Update this cell's state
  //  */
  // transitionToNextState() {
  //   this.alive = this.#next;
  //   this.#next = undefined;
  // }

  /**
   * Returns true (alive) or false (dead) for the next state based on number of
   * living neighbor cells.
   * @param livingNeighborCount {number} number of living neighbors
   * @returns {boolean}
   */
  #nextState(livingNeighborCount) {
    console.log(`Neighbors at (${this.#posX},${this.#posY}): ${livingNeighborCount}`);
    if (livingNeighborCount === 3) return true;
    return this.alive && livingNeighborCount === 2;
  }

  #updateState(livingNeighborCount) {
    this.alive = this.#nextState(livingNeighborCount);
    return of(this.alive);
  }

  start() {
    this.neighborNotifier.next(this.alive);
  }

  /**
   * Accepts state notifiers from all neighboring cells, sets an
   * accept window, and kicks off the big subscription.
   *
   * @param notifiers {Observable<boolean>[]}
   * @return {Subscription}
   */
  listenToNeighbors(notifiers) {
    // this.adjacentCellCount = notifiers.length;
    // this.neighborListener = notifiers;
    // tap(_ => this.neighborNotifier.next(this.alive));

    const z$ = this.#ticker.pipe(
        tap(_ => this.neighborNotifier.next(this.alive)),
        switchMapTo(zip(notifiers)),
        tap(a => console.log(a)),
        map(bools => bools.filter(b => !!b).length),
        tap(a => console.log(a)),
    );

    const o$ = zip(notifiers).pipe(
        sample(this.#ticker),
        tap(a => console.log(a)),
        map(bools => bools.filter(b => !!b).length),
        tap(a => console.log(a)),
        switchMap(neighborCount => this.#updateState(neighborCount)),
    );

    // this.neighborNotifier.next(this.alive);
    return o$.subscribe({
      next: state => this.neighborNotifier.next(state),
      error: err => console.error(`Error in cell ${this.#posX},${this.#posY}: ${err}`),
      complete: () =>  console.log(`reached complete signal in cell ${this.#posX},${this.#posY}`),
    });
    // this.#ticker.pipe(
    //     tap(_ => this.neighborNotifier.next(this.alive)),
    //     switchMapTo(combineLatestWith(notifiers)),
    //     tap(a => console.log(a)),
    //     switchMapTo(zipWith(notifiers)),
    //     map(bools => bools.filter(b => !!b).length),
    // ).subscribe({
    //   next: value => console.log(`got next subscribed value: ${value}`)
    // });
  }
}

export {Cell, Grid};
