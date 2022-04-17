import { Subject } from 'rxjs';

/**
 * @abstract
 */
class RendererBase {
  /**
   * Subject that emits [x, y, isActive] when a cell is clicked.
   * @type {Subject<[number, number, State]>}
   */
  cellToggled = new Subject();

  /**
   * Draws a grid of cells to a child grid container.
   *
   * @abstract
   * @returns {[number, number]} - [cellsWide, cellsHigh] of the resulting grid.
   */
  drawGrid() {}

  /**
   * Toggles the state of a visible cell.
   *
   * @abstract
   * @param event {MouseEvent} - the event that triggered this action
   * @param x {number} - the relative x coordinate of this cell in the grid
   * @param y {number} - the relative y coordinate of this cell in the grid
   */
  selectCell(event, x, y) {}

  /**
   * Manually sets the toggled state of a visible cell.
   *
   * @abstract
   * @param x {number} - x pos of this cell in the grid
   * @param y {number} - y pos of this cell in the grid
   * @param state {State}
   */
  setCellState(x, y, state) {}

  /**
   * Sets the state of 0 or more cells to active/alive for the
   * given coordinate pairs. Useful for loading presets.
   *
   * @example
   * // load preset
   * const glider = [
   *   [0, 2],
   *   [1, 3],
   *   [2, 1],
   *   [2, 2],
   *   [2, 3],
   * ];
   * renderer.activateCells(glider);
   *
   * // result (assuming row-major ordering)
   * //    . . . .
   * //    . . # .
   * //    # . # .
   * //    . # # .
   * //    . . . .
   *
   * @abstract
   * @param coords {[number, number][]} x,y pairs to activate
   */
  activateCells(coords) {}
}

export { RendererBase };
