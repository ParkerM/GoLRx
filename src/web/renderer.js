import Paper from 'paper/dist/paper-core';

const CELL_SIZE = 20;

const GRID_LINE_COLOR = '#968d8d';

/**
 * Wrapper class abstraction for anything related to drawing in the viewport.
 */
class Renderer {
  /** @type {HTMLCanvasElement} */
  canvas;

  /** @type {Layer} */
  #gridLayer;

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
    this.#gridLayer = new this.#paper.Layer();
    this.#gridLayer.activate();

    const boundingRect = this.#paper.view.bounds;
    const hCellsNum = boundingRect.width / CELL_SIZE;
    const vCellsNum = boundingRect.height / CELL_SIZE;

    const hStart = new this.#paper.Point(0, boundingRect.top);
    const hEnd = new this.#paper.Point(0, boundingRect.bottom);
    const hLine = new this.#paper.Path.Line(hStart, hEnd);
    hLine.strokeColor = new this.#paper.Color(GRID_LINE_COLOR);
    const hSymbolDef = new this.#paper.SymbolDefinition(hLine, true);

    const vStart = new this.#paper.Point(boundingRect.left, 0);
    const vEnd = new this.#paper.Point(boundingRect.right, 0);
    const vLine = new this.#paper.Path.Line(vStart, vEnd);
    vLine.strokeColor = new this.#paper.Color(GRID_LINE_COLOR);
    const vSymbolDef = new this.#paper.SymbolDefinition(vLine, true);

    for (let i = 0; i <= hCellsNum; i++) {
      const offsetXPos = Math.ceil(boundingRect.left / CELL_SIZE) * CELL_SIZE;
      const xPos = (offsetXPos + i) * CELL_SIZE;
      const topPoint = new this.#paper.Point(xPos, boundingRect.top);
      const hSymbol = hSymbolDef.place(topPoint);
      this.#gridLayer.addChild(hSymbol);
    }

    for (let i = 0; i <= vCellsNum; i++) {
      const offsetYPos = Math.ceil(boundingRect.top / CELL_SIZE) * CELL_SIZE;
      const yPos = (offsetYPos + i) * CELL_SIZE;
      const leftPoint = new this.#paper.Point(boundingRect.left, yPos);
      const vSymbol = vSymbolDef.place(leftPoint);
      this.#gridLayer.addChild(vSymbol);
    }

    // TODO: store points in arrays, and use CELL_SIZE to determine the offset
    //       for locating nearest neighbors
  }

  registerCellClickHandler() {
    /** @param mouseEvent {Paper.MouseEvent} */
    this.#paper.view.onClick = (mouseEvent) => {
      console.log(`(${mouseEvent.point.x},${mouseEvent.point.y}`);
      // console.log(JSON.stringify(mouseEvent, null, 2));
    }
  }
}

export { Renderer };
