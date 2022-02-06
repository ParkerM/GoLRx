import { Grid } from './grid.js';
import { State } from './util.js';

const M = true;
const _ = false;

describe('Grid', () => {
  /** @type {Grid} */
  let grid;

  beforeEach(() => {
    grid = new Grid(3, 3);
  });

  it('emits all changed cells after transition', (done) => {
    grid.activateCell(1, 1);

    expect.assertions(3);
    expect(grid.getGrid()).toEqual([
      [_, _, _],
      [_, M, _],
      [_, _, _],
    ]);

    grid.changeEmitter.asObservable().subscribe({
      next: (change) => {
        expect(change).toEqual([1, 1, State.DEAD]);
        done();
      },
    });

    grid.transition();
    expect(grid.getGrid()).toEqual([
      [_, _, _],
      [_, _, _],
      [_, _, _],
    ]);
  });

  it('tick advances the game once and stops', () => {
    grid.activateCell(1, 0);
    grid.activateCell(1, 1);
    grid.activateCell(1, 2);

    expect(grid.running).toBe(false);
    expect(grid.getGrid()).toEqual([
      [_, _, _],
      [M, M, M],
      [_, _, _],
    ]);

    grid.tick();
    expect(grid.running).toBe(false);
    expect(grid.getGrid()).toEqual([
      [_, M, _],
      [_, M, _],
      [_, M, _],
    ]);

    grid.tick();
    expect(grid.running).toBe(false);
    expect(grid.getGrid()).toEqual([
      [_, _, _],
      [M, M, M],
      [_, _, _],
    ]);
  });

  it('grid can be modified between ticks', () => {
    grid.activateCell(1, 0);
    grid.activateCell(1, 1);
    grid.activateCell(1, 2);

    // set oscillator and tick once
    expect(grid.getGrid()).toEqual([
      [_, _, _],
      [M, M, M],
      [_, _, _],
    ]);
    grid.tick();
    expect(grid.getGrid()).toEqual([
      [_, M, _],
      [_, M, _],
      [_, M, _],
    ]);

    // change to glider and tick again
    grid.setAllCellStates(State.DEAD);
    grid.activateCells([
      [1, 0],
      [2, 1],
      [0, 2],
      [1, 2],
      [2, 2],
    ]);
    expect(grid.getGrid()).toEqual([
      [_, _, M],
      [M, _, M],
      [_, M, M],
    ]);

    grid.tick();
    expect(grid.running).toBe(false);
    expect(grid.getGrid()).toEqual([
      [_, M, _],
      [_, _, M],
      [_, M, M],
    ]);
  });
});

describe('Patterns', () => {
  it('Blinker (period 2)', () => {
    const grid = new Grid(5, 5);
    grid.activateCell(2, 1);
    grid.activateCell(2, 2);
    grid.activateCell(2, 3);

    // initial state
    expect(grid.getGrid()).toEqual([
      [_, _, _, _, _],
      [_, _, _, _, _],
      [_, M, M, M, _],
      [_, _, _, _, _],
      [_, _, _, _, _],
    ]);

    // first oscillation should rotate 90 degrees
    grid.transition();
    expect(grid.getGrid()).toEqual([
      [_, _, _, _, _],
      [_, _, M, _, _],
      [_, _, M, _, _],
      [_, _, M, _, _],
      [_, _, _, _, _],
    ]);

    // second oscillation should rotate 90 degrees again
    grid.transition();
    expect(grid.getGrid()).toEqual([
      [_, _, _, _, _],
      [_, _, _, _, _],
      [_, M, M, M, _],
      [_, _, _, _, _],
      [_, _, _, _, _],
    ]);
  });

  it('Glider', () => {
    const grid = new Grid(5, 5);
    grid.activateCells([
      [2, 0],
      [3, 1],
      [1, 2],
      [2, 2],
      [3, 2],
    ]);

    // initial state
    expect(grid.getGrid()).toEqual(glider[0]);

    // first tick
    grid.transition();
    expect(grid.getGrid()).toEqual(glider[1]);

    // second tick
    grid.transition();
    expect(grid.getGrid()).toEqual(glider[2]);

    // third tick
    grid.transition();
    expect(grid.getGrid()).toEqual(glider[3]);

    // fourth tick, should match initial state shifted right 1 and down 1
    grid.transition();
    expect(grid.getGrid()).toEqual(glider[4]);
    expect(grid.getGrid()).toEqual(shiftedGrid(glider[0], 1, 1));
  });
});

/**
 * Take a source 2D boolean array and shift it by the specified amount,
 * filling empty spaces with false.
 *
 * @param source {boolean[][]} - source layout to return a shifted version of
 * @param moveX {number} - number of steps to move left (-) or right (+)
 * @param moveY {number} - number of steps to move up (-) or down (+)
 * @return {boolean[][]}
 */
function shiftedGrid(source, moveX, moveY) {
  return translate2dArray(source, moveX, moveY, false);
}

/**
 * Creates a translated copy of a 2D array.
 *
 * @template T
 * @param arr {M[][]} - 2D source array
 * @param moveX {number} - number of steps to move left (-) or right (+)
 * @param moveY {number} - number of steps to move up (-) or down (+)
 * @param fill {M} - default value for abyss
 * @return {M[][]}
 */
function translate2dArray(arr, moveX, moveY, fill) {
  const dimX = arr.length;
  const dimY = arr[0].length;

  const shifted = [];
  for (let i = 0; i < dimX; i++) shifted[i] = Array(dimY).fill(fill);

  for (let i = 0; i < dimX; i++) {
    const iShift = i + moveX;
    if (iShift < 0 || iShift >= dimX) continue;

    for (let j = 0; j < dimY; j++) {
      const jShift = j + moveY;
      if (jShift < 0 || jShift >= dimY) continue;
      shifted[iShift][jShift] = arr[i][j];
    }
  }
  return shifted;
}

/** @type {boolean[][][]} */
const glider = [
  [
    [_, _, _, _, _],
    [_, _, M, _, _],
    [M, _, M, _, _],
    [_, M, M, _, _],
    [_, _, _, _, _],
  ],
  [
    [_, _, _, _, _],
    [_, M, _, _, _],
    [_, _, M, M, _],
    [_, M, M, _, _],
    [_, _, _, _, _],
  ],
  [
    [_, _, _, _, _],
    [_, _, M, _, _],
    [_, _, _, M, _],
    [_, M, M, M, _],
    [_, _, _, _, _],
  ],
  [
    [_, _, _, _, _],
    [_, _, _, _, _],
    [_, M, _, M, _],
    [_, _, M, M, _],
    [_, _, M, _, _],
  ],
  [
    [_, _, _, _, _],
    [_, _, _, _, _],
    [_, _, _, M, _],
    [_, M, _, M, _],
    [_, _, M, M, _],
  ],
];

/*
 * Leaving these here for copy/paste purposes
 */
// noinspection JSUnusedLocalSymbols
const ALL_FALSE = [
  [_, _, _, _, _],
  [_, _, _, _, _],
  [_, _, _, _, _],
  [_, _, _, _, _],
  [_, _, _, _, _],
];
