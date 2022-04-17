import { RendererBase } from './renderer-base.js';

/*
Idea:
  Draw field:
    - occurs on any reset action (resizing, etc)
    - draws all grid lines AND occupied cells
  Draw cell:
    - fills inner cell area with COLOR_OCCUPIED
  Undraw cell:
    - fills inner cell area with COLOR_VACANT
 */

const CELL_FILL_OCCUPIED = 'rgba(0, 0, 0, 0.2)';
const CELL_FILL_VACANT = 'rgba(0, 0, 0, 0.0)';

/** @type {string | CanvasGradient | CanvasPattern} */
const CELL_FILL_ALIVE = 'rgba(0, 0, 0, 0.2)';
const CELL_FILL_DEAD = 'rgba(0, 0, 0, 0)';
const CELL_FILL_HOVER = 'rgba(128, 128, 128, 0.2)';

class CanvasRenderer extends RendererBase {
  /** @member {HTMLCanvasElement} */
  canvas;

  /** @member {HTMLCanvasElement} */
  gridCanvas;

  /** @member {CanvasRenderingContext2D} */
  ctx;

  /**
   *  @param {Document} document - root HTML document
   */
  constructor(document) {
    super();
    this.initCanvas(document);
  }

  get cellsWide() {
    return this.canvas.width;
  }

  get cellsHigh() {
    return this.canvas.height;
  }

  get cellLenPxl() {
    return this.gridCanvas.width / this.canvas.width;
  }

  initCanvas(document) {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    // set grid to full size, so we can draw fine lines with it
    this.gridCanvas = document.getElementById('grid-canvas');
    this.gridCanvas.width = this.gridCanvas.clientWidth;
    this.gridCanvas.height = this.gridCanvas.clientHeight;
  }

  /**
   *
   * @param {number} x - relative x coordinate of cell
   * @param {number} y - relative y coordinate of cell
   * @param {string | CanvasGradient | CanvasPattern} fillStyle
   */
  fillCell(x, y, fillStyle = CELL_FILL_ALIVE) {
    this.ctx.fillStyle = fillStyle;
    this.ctx.clearRect(x, y, 1, 1);
    this.ctx.fillRect(x, y, 1, 1);
  }

  activateCells(coords) {
    coords.forEach(([row, col]) => this.fillCell(row, col));
  }

  drawGrid() {
    const gridCtx = this.gridCanvas.getContext('2d');
    const aliasOffset = 0.5;
    gridCtx.lineWidth = 1;
    gridCtx.strokeStyle = '#777';

    gridCtx.beginPath();
    // outline
    this.#addPathBorder(gridCtx, aliasOffset);
    // inner lines
    this.#addPathGridLines(gridCtx, aliasOffset);
    gridCtx.stroke();

    // draw coords in each square
    this.#drawGridCoords(gridCtx);

    return [this.canvas.width, this.canvas.height];
  }

  #addPathGridLines(gridCtx, aliasOffset) {
    const cellDim = this.cellLenPxl;

    // draw horizontal lines
    for (let i = cellDim; i < this.gridCanvas.height; i += cellDim) {
      let x1 = aliasOffset;
      let x2 = this.gridCanvas.width - aliasOffset;
      let y = i - aliasOffset;
      gridCtx.moveTo(x1, y);
      gridCtx.lineTo(x2, y);
    }

    // draw vertical lines
    for (let i = cellDim; i < this.gridCanvas.width; i += cellDim) {
      let y1 = aliasOffset;
      let y2 = this.gridCanvas.height - aliasOffset;
      let x = i - aliasOffset;
      gridCtx.moveTo(x, y1);
      gridCtx.lineTo(x, y2);
    }
  }

  /**
   * Path around the grid
   * @param {CanvasRenderingContext2D} gridCtx
   * @param {number} aliasOffset
   */
  #addPathBorder(gridCtx, aliasOffset = 0.0) {
    const outlineOffset = aliasOffset;
    let xMin = outlineOffset;
    let yMin = outlineOffset;
    let xMax = this.gridCanvas.width - outlineOffset;
    let yMax = this.gridCanvas.height - outlineOffset;

    // top left
    gridCtx.moveTo(xMin, yMin);
    // top right
    gridCtx.lineTo(xMax, yMin);
    // bottom right
    gridCtx.lineTo(xMax, yMax);
    // bottom left
    gridCtx.lineTo(xMin, yMax);
    // top left (join)
    gridCtx.closePath();
  }

  /**
   * Draw x/y coords to each cell.
   * @param {CanvasRenderingContext2D} gridCtx
   */
  #drawGridCoords(gridCtx) {
    gridCtx.save();

    const cellDim = this.cellLenPxl;

    gridCtx.font = "18px 'Farsan', cursive";
    gridCtx.fillStyle = '#777';
    gridCtx.textBaseline = 'bottom';
    gridCtx.textAlign = 'right';
    for (
      let y = 0, yCell = 0;
      y < this.gridCanvas.height;
      y += cellDim, yCell++
    ) {
      for (
        let x = 0, xCell = 0;
        x < this.gridCanvas.width;
        x += cellDim, xCell++
      ) {
        const coords = xCell.toString(10) + ',' + yCell.toString(10);
        gridCtx.fillText(coords, x + cellDim, y + cellDim + 1, cellDim - 1);
        // gridCtx.fillText(`${xCell.toString(10).padStart(2, ' ')}`, x + cellDim - 1, y + 1, maxWidth);
        // gridCtx.fillText(
        //   `${yCell.toString(10).padStart(2, ' ')}`,
        //   x + cellDim - 1,
        //   y + cellDim / 2,
        //   maxWidth,
        // );
      }
    }

    gridCtx.restore();
  }

  selectCell(event, x, y) {}

  setCellState(x, y, state) {
    if (state.isAlive) {
      this.fillCell(x, y, CELL_FILL_ALIVE);
    } else {
      this.fillCell(x, y, CELL_FILL_DEAD);
    }
  }
}

export { CanvasRenderer };
