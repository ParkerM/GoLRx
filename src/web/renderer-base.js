/**
 * @abstract
 */
class RendererBase {
  /**
   * Draws a grid of cells to a child grid container.
   *
   * @abstract
   * @returns {[number, number]} - [cellsWide, cellsHigh] of the resulting grid.
   */
  drawGrid() {}

  /**
   * @abstract
   * @param event {MouseEvent}
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
   * @abstract
   * @param coords {[number, number][]} x,y pairs to activate
   */
  activateCells(coords) {}
}

export { RendererBase };
