import { RendererBase } from './renderer-base.js';
import { State } from '../lib/util.js';

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

/**
 * @typedef {Object} CanvasRendererOpts
 * @property {boolean} [drawGridCoords] - set true to draw text coordinates in each cell
 */

/**
 * Canvas-based renderer.
 * @extends RendererBase
 */
class CanvasRenderer extends RendererBase {
  /** @member {HTMLCanvasElement} */
  canvas;

  /** @member {HTMLCanvasElement} */
  gridCanvas;

  /** @member {CanvasRenderingContext2D} */
  ctx;

  /** @member {CanvasRendererOpts} */
  opts;

  /**
   * @param document {Document} - root HTML document
   * @param opts {CanvasRendererOpts} - overridable config options
   */
  constructor(document, opts = { drawGridCoords: false }) {
    super();
    this.opts = opts;
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

    // attach mouse click listener
    this.canvas.addEventListener('click', this.#handleMouseDown);

    // set grid to full size, so we can draw fine lines with it
    this.gridCanvas = document.getElementById('grid-canvas');
    this.gridCanvas.width = this.gridCanvas.clientWidth;
    this.gridCanvas.height = this.gridCanvas.clientHeight;
  }

  /**
   * Convert mouse event to relative grid coords.
   *
   * @param event {MouseEvent}
   * @returns {[number, number]} - canvas-relative (x,y)
   */
  #relativePosition = (event) => {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const x = Math.floor((event.clientX - rect.left) * scaleX);
    const y = Math.floor((event.clientY - rect.top) * scaleY);
    return [x, y];
  };

  /**
   * @param event {MouseEvent}
   */
  #handleMouseDown = (event) => {
    const [x, y] = this.#relativePosition(event);
    console.debug(`  Click at relative coords: x=${x}, y=${y}`);
    this.selectCell(event, x, y);
  };

  /**
   * Clear a cell and re-draw it with the given style.
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

    if (this.opts.drawGridCoords) {
      // draw coords in each square
      this.#drawGridCoords(gridCtx);
    }

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
      }
    }

    gridCtx.restore();
  }

  selectCell(event, x, y) {
    const pixel = this.ctx.getImageData(x, y, 1, 1);
    const currentState = this.cellStateAt(pixel);
    const nextState = currentState.inverse;
    this.setCellState(x, y, nextState);
    this.cellToggled.next([x, y, nextState]);
  }

  setCellState(x, y, state) {
    if (state.isAlive) {
      this.fillCell(x, y, CELL_FILL_ALIVE);
    } else {
      this.fillCell(x, y, CELL_FILL_DEAD);
    }
  }

  /**
   * @param pixel {ImageData} - 1x1 context ImageData to observe
   * @returns {State} - state of the cell at the given pixel
   */
  cellStateAt(pixel) {
    const alpha = pixel.data[3];
    if (alpha === 0) {
      return State.DEAD;
    }
    return State.ALIVE;
  }
}

export { CanvasRenderer };
