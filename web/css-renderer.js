import { RendererBase } from './renderer-base.js';

class CssRenderer extends RendererBase {
  /**
   * @param {Document} document
   */
  constructor(document) {
    super();
  }

  activateCells(coords) {}

  drawGrid() {
    return [0, 0];
  }

  selectCell(event, x, y) {}

  setCellState(x, y, state) {}
}

export { CssRenderer };
