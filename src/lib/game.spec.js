import { Game } from './game.js';
import { Grid } from './grid.js';
import { State } from './util.js';
import { Subject } from 'rxjs';
import { jest } from '@jest/globals';

const M = true;
const _ = false;

describe('Game', () => {
  /** @type {Subject<void>} */
  let ticker;

  /** @type {Subject<[number, number, State]>} */
  let changeEmitter;

  /** @type {Subject<[number, number, State]>} */
  let cellToggled;

  beforeEach(() => {
    ticker = new Subject();
    changeEmitter = new Subject();
    cellToggled = new Subject();
  });

  it('tick should progress grid by 1 tick', () => {
    const grid = new Grid(2, 2);
    grid.activateCells([
      [0, 0],
      [1, 1],
    ]);

    const game = new Game(grid, cellToggled);
    expect(grid.getGrid()).toEqual([
      [M, _],
      [_, M],
    ]);

    game.tick();
    expect(grid.getGrid()).toEqual([
      [_, _],
      [_, _],
    ]);
  });

  it('cell toggled should update grid', () => {
    const grid = new Grid(2, 2);
    const game = new Game(grid, cellToggled);

    expect(grid.getGrid()).toEqual([
      [_, _],
      [_, _],
    ]);
    cellToggled.next([0, 0, State.ALIVE]);
    expect(grid.getGrid()).toEqual([
      [M, _],
      [_, _],
    ]);

    grid.activateCells([
      [0, 1],
      [1, 0],
      [1, 1],
    ]);
    expect(grid.getGrid()).toEqual([
      [M, M],
      [M, M],
    ]);
    cellToggled.next([1, 1, State.DEAD]);
    expect(grid.getGrid()).toEqual([
      [M, M],
      [M, _],
    ]);
  });

  it('start ticks the game on a given interval', () => {
    jest.useFakeTimers();

    // noinspection JSValidateTypes
    /** @type {Grid} */
    const grid = { tick: jest.fn() };

    // manual sync invocation
    const game = new Game(grid, cellToggled);
    expect(grid.tick).not.toHaveBeenCalled();
    game.tick();
    expect(grid.tick).toHaveBeenCalledTimes(1);

    // call start with 1 second interval
    game.tickInterval = 1000;
    const subscription = game.start();
    expect(grid.tick).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(1000);
    expect(grid.tick).toHaveBeenCalledTimes(2);

    jest.advanceTimersByTime(2000);
    expect(grid.tick).toHaveBeenCalledTimes(4);

    game.stop();
    jest.advanceTimersByTime(10000);

    expect(grid.tick).toHaveBeenCalledTimes(4);
    expect(subscription.closed).toBe(true);

    return subscription.unsubscribe();
  });

  it('interval can be changed while running', () => {
    jest.useFakeTimers();

    // noinspection JSValidateTypes
    /** @type {Grid} */
    const grid = { tick: jest.fn() };
    const game = new Game(grid, cellToggled);

    // call start with 1 second interval
    game.tickInterval = 1000;
    const subscription = game.start();
    expect(grid.tick).toHaveBeenCalledTimes(0);

    jest.advanceTimersByTime(1000);
    expect(grid.tick).toHaveBeenCalledTimes(1);

    // change interval to 2 seconds
    game.tickInterval = 2000;

    jest.advanceTimersByTime(1000);
    expect(grid.tick).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(2000);
    expect(grid.tick).toHaveBeenCalledTimes(2);

    game.stop();
    expect(subscription.closed).toBe(true);
    return subscription.unsubscribe();
  });
});
