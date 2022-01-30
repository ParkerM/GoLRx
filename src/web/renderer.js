import Paper from 'paper/dist/paper-core';

const CELL_SIZE = 20;

/**
 * Wrapper class abstraction for anything related to drawing in the viewport.
 */
class Renderer {
  /** @type {HTMLCanvasElement} */
  canvas;

  /** @type {PaperScope} */
  #paper;

  /**
   * @param canvas {HTMLCanvasElement}
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.#paper = new Paper.PaperScope();
    this.#paper.setup(canvas);
  }

  /** @returns {HTMLCanvasElement} */
  get nativeCanvas() {
    return this.canvas;
  }

  drawGrid() {
    const boundingRect = this.#paper.view.bounds;
    const hCellsNum = boundingRect.width / CELL_SIZE;
    const vCellsNum = boundingRect.height / CELL_SIZE;

    for (let i = 0; i <= hCellsNum; i++) {
      const offsetXPos = Math.ceil(boundingRect.left / CELL_SIZE) * CELL_SIZE;
      const xPos = (offsetXPos + i) * CELL_SIZE;
      const topPoint = new this.#paper.Point(xPos, boundingRect.top);
      const bottomPoint = new this.#paper.Point(xPos, boundingRect.bottom);
      const line = new this.#paper.Path.Line(topPoint, bottomPoint);

      line.strokeColor = new this.#paper.Color('#968d8d');
      line.strokeWidth = 1 / this.#paper.view.zoom;
    }

    for (let i = 0; i <= vCellsNum; i++) {
      const offsetYPos = Math.ceil(boundingRect.top / CELL_SIZE) * CELL_SIZE;
      const yPos = (offsetYPos + i) * CELL_SIZE;
      const leftPoint = new this.#paper.Point(boundingRect.left, yPos);
      const rightPoint = new this.#paper.Point(boundingRect.right, yPos);
      const line = new this.#paper.Path.Line(leftPoint, rightPoint);

      line.strokeColor = new this.#paper.Color('#968d8d');
    }
  }
}

export { Renderer };
