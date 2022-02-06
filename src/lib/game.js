import {
  asyncScheduler,
  interval,
  Observable,
  Subject,
  Subscription,
  takeUntil,
  tap,
} from 'rxjs';

/**
 * Represents a Game, consisting of a grid and an initial state,
 * that can be started and stopped.
 */
class Game {
  /**
   * Whether the game is currently running.
   * @type {boolean}
   */
  #running = false;

  /**
   * Signal used to stop the running game loop.
   * @type {Subject<void>}
   */
  #stopSignal = new Subject();

  /**
   * Grid for the current game.
   * @type {Grid}
   */
  #grid;

  /**
   * Emits [x,y,active] to indicate a cell state should be modified.
   * @type {Observable<[number, number, boolean]>}
   */
  #cellToggleSubject;

  /**
   * Subscriptions held by this game instance.
   * @type {Subscription}
   */
  subscriptions = new Subscription();

  /**
   * @param grid {Grid} - initialized grid to be managed by this game.
   * @param cellToggled {Observable<[number, number, State]>} - emits [x,y,active] on interaction
   */
  constructor(grid, cellToggled) {
    this.#grid = grid;
    this.subscriptions.add(this.handleIncomingCellEvent(cellToggled));
  }

  /**
   *
   * @param cellToggled {Observable<[number, number, State]>}
   * @returns {Subscription}
   */
  handleIncomingCellEvent(cellToggled) {
    return cellToggled
      .pipe(tap((a) => console.log(`Got this in game: ${JSON.stringify(a)}`)))
      .subscribe({
        next: ([x, y, active]) => this.#grid.setCellState(x, y, active),
        error: (err) =>
          console.error(`Error in Game.cellToggled listener: ${err}`),
        complete: () => console.log('Game received complete signal'),
      });
  }

  /**
   * @returns {Set<Cell>}
   */
  get cells() {}

  /**
   * Progresses the game by one tick.
   */
  tick() {
    this.#grid.tick();
  }

  /**
   * Starts the game with the given tick interval.
   *
   * @param {number} tickInterval - seconds between ticks
   * @param {import('rxjs').SchedulerLike} scheduler - optional scheduler
   * @returns {Subscription}
   */
  start(tickInterval, scheduler = asyncScheduler) {
    this.#running = true;

    return interval(tickInterval * 1000, scheduler)
      .pipe(takeUntil(this.#stopSignal))
      .subscribe({
        next: () => this.tick(),
      });
  }

  /**
   * Stops the game.
   */
  stop() {
    this.#stopSignal.next(void 0);
    this.#running = false;
  }

  get isRunning() {
    return this.#running;
  }
}

export { Game };