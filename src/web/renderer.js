import * as PIXI from 'pixi.js';

const CELL_SIZE = 20;

const GRID_LINE_COLOR = '#968d8d';

/**
 * Wrapper class abstraction for anything related to drawing in the viewport.
 */
class Renderer {
  /** @type {HTMLCanvasElement} */
  canvas;

  /** @type {import('@pixi/app').Application} */
  #app;

  /**
   * @param canvas {HTMLCanvasElement}
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.#app = new PIXI.Application();
  }

  /** @returns {HTMLCanvasElement} */
  get nativeCanvas() {
    return this.canvas;
  }

  drawGrid() {

  }

  registerCellClickHandler() {

  }
}

export { Renderer };
