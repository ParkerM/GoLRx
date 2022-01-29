import {Game} from "./game";
import {Cell, Grid} from "./grid";

describe('Game', () => {
  it('should initialize grid with seed', () => {
    const seed = new Set([new Cell(1, 2), new Cell(9, 9), new Cell(42, 42)]);
    const grid = new Grid(50, 50);

    const game = new Game(grid, seed);

    expect(game.cells).toContain({x: 1, y: 2});
  });
});
