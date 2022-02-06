import {
  BehaviorSubject,
  map,
  Observable,
  of,
  sample,
  Subject,
  Subscription,
  switchMap,
  takeUntil,
  zip,
} from 'rxjs';
import { State } from './util.js';

class Cell {
  /**
   * Subject used hold and emit current state to subscribers
   * @type {BehaviorSubject<State>}
   */
  #stateSubject;

  /**
   * A list of notifiers from neighbor cells
   * @type {Observable<State>[]}
   */
  #neighbors = [];

  /**
   * Used to broadcast current position and state whenever a change occurs.
   * @type {Subject<[number, number, State]>}
   */
  changeEmitter;

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
   * @param {Observable<void>} ticker - the game "clock" that emits whenever state should update
   * @param {number} x
   * @param {number} y
   * @param {Subject<[number, number, State]>} changeEmitter
   * @param {State} state - initial state, defaults to false
   */
  constructor(ticker, x, y, changeEmitter = null, state = State.DEAD) {
    this.#ticker = ticker;
    this.#posX = x;
    this.#posY = y;
    this.changeEmitter = changeEmitter;
    this.#stateSubject = new BehaviorSubject(state);
  }

  /** @returns {State} whether this cell is alive or dead */
  get state() {
    return this.#stateSubject.getValue();
  }

  /** @param {State} state - the new state to set and broadcast from this cell */
  set state(state) {
    this.#stateSubject.next(state);
  }

  /**
   * Add a neighbor listener to this cell's registry.
   * @param {Cell} cell
   */
  addNeighbor(cell) {
    this.#neighbors.push(cell.#stateSubject.asObservable());
  }

  /**
   * Begins listening to neighbor notifications, unsubscribing once
   * stopSignal emits.
   * On each tick, this cell updates its state and notifies its neighbors.
   *
   * @param {Observable<void>} stopSignal - unsubscribe notifier
   * @returns {Subscription}
   */
  start(stopSignal) {
    return this.listenUntil(stopSignal).subscribe({
      next: (state) => this.#stateSubject.next(state),
      error: (err) =>
        console.error(`Error in cell ${this.#posX},${this.#posY}: ${err}`),
    });
  }

  /**
   * Returns an observable that updates its state on each tick, based on
   * the states emitted from neighbor cells.
   *
   * @param {Observable<void>} stopSignal - unsubscribe notifier
   * @return {Observable<State>} the next state of this cell
   */
  listenUntil(stopSignal) {
    return zip(this.#neighbors).pipe(
      sample(this.#ticker),
      map((states) => states.filter((state) => state === State.ALIVE).length),
      switchMap((neighborCount) => this.#updateState(neighborCount)),
      takeUntil(stopSignal),
    );
  }

  /**
   * Returns true (alive) or false (dead) for the next state based on number of
   * living neighbor cells.
   *
   * @param livingNeighborCount {number} number of living neighbors
   * @returns {State}
   */
  #nextState(livingNeighborCount) {
    if (this.state.isAlive && [2, 3].includes(livingNeighborCount))
      return State.ALIVE;
    if (!(this.state.isDead && livingNeighborCount === 3)) {
      return State.DEAD;
    }
    return State.ALIVE;
  }

  /**
   * Updates this cell's state and returns it wrapped in an observable.
   * Also publishes coords and state in the event of a change.
   *
   * @param livingNeighborCount {number}
   * @return {Observable<State>}
   */
  #updateState(livingNeighborCount) {
    const prev = this.state;
    this.state = this.#nextState(livingNeighborCount);

    if (prev !== this.state) {
      this.changeEmitter.next([this.#posX, this.#posY, this.state]);
    }
    return of(this.state);
  }
}

export { Cell };
