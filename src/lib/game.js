import {
  asyncScheduler,
  BehaviorSubject,
  distinctUntilChanged,
  interval,
  Observable,
  Subject,
  Subscription,
  switchMap,
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
   * Contains the currently-set tick interval in millisecond.
   * @type {BehaviorSubject<number>}
   */
  #intervalMillis;

  /**
   * Subscriptions held by this game instance.
   * @type {Subscription}
   */
  subscriptions = new Subscription();

  /**
   * @param grid {Grid} - initialized grid to be managed by this game.
   * @param cellToggled {Observable<[number, number, State]>} - emits [x,y,active] on interaction
   * @param {number} tickInterval - ms between each tick in auto mode
   */
  constructor(grid, cellToggled, tickInterval = 1000) {
    this.#grid = grid;
    this.#intervalMillis = new BehaviorSubject(tickInterval);
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
   * Progresses the game by one tick.
   */
  tick() {
    this.#grid.tick();
  }

  /**
   * Starts the game with the current tick interval.
   *
   * @param {import('rxjs').SchedulerLike} scheduler - optional scheduler
   * @returns {Subscription}
   */
  start(scheduler = asyncScheduler) {
    this.#running = true;

    return this.#intervalMillis
      .asObservable()
      .pipe(
        distinctUntilChanged(),
        switchMap((ms) => interval(ms, scheduler)),
        takeUntil(this.#stopSignal),
      )
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

  /**
   * @param {number} ms
   */
  set tickInterval(ms) {
    this.#intervalMillis.next(ms);
  }
}

export { Game };
