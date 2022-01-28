import {Cell, Game, Grid} from "./grid";


// describe('Game', () => {
//   it('should initialize grid with seed', () => {
//     const seed = new Set([new Cell(1, 2), new Cell(9, 9), new Cell(42, 42)]);
//     const grid = new Grid(50, 50);
//
//     const game = new Game(grid, seed);
//
//     expect(game.cells).toContain({x: 1, y: 2});
//   });
// });


const T = true;
const F = false;

describe('Cells', () => {
  /** @type {Grid} */
  let grid;

  beforeEach(() => {
    grid = new Grid(3, 3);
    grid.activateCell(1, 1);
  });

  it('Any live cell with fewer than two live neighbours dies, as if by underpopulation', () => {
    expect(grid.getGrid()).toEqual([
      [F, F, F],
      [F, T, F],
      [F, F, F],
    ])
    grid.transition();
    expect(grid.getGrid()).toEqual([
      [F, F, F],
      [F, F, F],
      [F, F, F],
    ])
    expect(grid.getCellAt(1, 1).alive).toBe(false);
  });

  it('Any live cell with two live neighbours lives on to the next generation', () => {
    grid.activateCell(0, 0);
    grid.activateCell(1, 0);

    expect(grid.getGrid()).toEqual([
      [T, F, F],
      [T, T, F],
      [F, F, F],
    ]);
    grid.transition();
    expect(grid.getCellAt(1, 1).alive).toBe(true);
  });

  it('Any live cell with three live neighbours lives on to the next generation', () => {
    grid.activateCell(0, 0);
    grid.activateCell(1, 0);
    grid.activateCell(2, 2);

    expect(grid.getGrid()).toEqual([
      [T, F, F],
      [T, T, F],
      [F, F, T],
    ]);
    grid.transition();
    expect(grid.getCellAt(1, 1).alive).toBe(true);
  });

  it('Any live cell with more than three live neighbours dies, as if by overpopulation', () => {
    grid.activateCell(0, 0);
    grid.activateCell(1, 0);
    grid.activateCell(1, 2);
    grid.activateCell(2, 0);

    expect(grid.getGrid()).toEqual([
      [T, F, F],
      [T, T, T],
      [T, F, F],
    ]);
    grid.transition();
    expect(grid.getCellAt(1, 1).alive).toBe(false);
  });

  it('Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction', () => {
    grid.getCellAt(1, 1).alive = false;
    grid.activateCell(0, 0);
    grid.activateCell(0, 2);
    grid.activateCell(2, 2);

    expect(grid.getGrid()).toEqual([
      [T, F, T],
      [F, F, F],
      [F, F, T],
    ]);
    grid.transition();
    expect(grid.getCellAt(1, 1).alive).toBe(T);
  });
});
