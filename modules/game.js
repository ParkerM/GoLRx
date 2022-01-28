/**
 * Represents a Game, consisting of a grid and an initial state,
 * that can be started and stopped.
 */
class Game {

  /** @type {Set<Cell>} */
  #cells;

  /**
   * @param {Grid} grid - The grid on which the game is played.
   * @param {Set<Cell>} seed - The initial pattern of cells.
   */
  constructor(grid, seed) {
    this.grid = grid;
    this.#cells = seed;
    // seed.forEach(cell => this.grid.pl.get(cell.x).set(cell.y));
  }

  /**
   * @returns {Set<Cell>}
   */
  get cells() {
    return this.#cells;
  }
}

export {Game};
