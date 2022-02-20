import { RendererBase } from './renderer-base.js';

class CanvasRenderer extends RendererBase {
  /** @member {HTMLCanvasElement} */
  canvas;

  /** @member {HTMLCanvasElement} */
  gridCanvas;

  /** @member {CanvasRenderingContext2D} */
  ctx;

  /** @member {CanvasRenderingContext2D} */
  gridCtx;

  /**
   *  @param {Document} document - root HTML document
   */
  constructor(document) {
    super();
    this.initCanvas(document);

    // test data
    for (let i = 5; i < this.canvas.width; i++) {
      for (let j = i; j < this.canvas.height; j++) {
        this.ctx.fillRect(i, i, 1, 1);
      }
    }
  }

  activateCells(coords) {}

  drawGrid() {
    const gridCtx = this.gridCanvas.getContext('2d');
    const aliasOffset = 0.5;
    gridCtx.lineWidth = 1;
    gridCtx.strokeStyle = '#777';

    // outline
    const outlineOffset = aliasOffset;
    let xMin = outlineOffset;
    let yMin = outlineOffset;
    let xMax = this.gridCanvas.width - outlineOffset;
    let yMax = this.gridCanvas.height - outlineOffset;
    gridCtx.beginPath();

    // top left
    gridCtx.moveTo(xMin, yMin);
    // top right
    gridCtx.lineTo(xMax, yMin);
    // bottom right
    gridCtx.lineTo(xMax, yMax);
    // bottom left
    gridCtx.lineTo(xMin, yMax);
    // top left (join)
    gridCtx.lineTo(xMin, yMin);
    gridCtx.stroke();

    // inner lines
    gridCtx.beginPath();

    const cellDim = this.cellLenPxl;

    // draw horizontal lines
    for (let i = 0; i < this.gridCanvas.height; i += cellDim) {
      let x1 = aliasOffset;
      let x2 = this.gridCanvas.width - aliasOffset;
      let y = i - aliasOffset;
      console.log(`drawing hLine from (${x1},${y}) to (${x2},${y})`);
      gridCtx.moveTo(x1, y);
      gridCtx.lineTo(x2, y);
    }

    // draw vertical lines
    for (let i = 0; i < this.gridCanvas.width; i += cellDim) {
      let y1 = aliasOffset;
      let y2 = this.gridCanvas.height - aliasOffset;
      let x = i - aliasOffset;
      console.log(`drawing vLine from (${x},${y1}) to (${x},${y2})`);
      gridCtx.moveTo(x, y1);
      gridCtx.lineTo(x, y2);
    }
    gridCtx.stroke();

    // draw coords in each square
    gridCtx.font = '9px Verdana';
    gridCtx.fillStyle = '#777';
    gridCtx.textBaseline = 'top';
    gridCtx.textAlign = 'right';
    const maxWidth = 20 - 2;
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
        gridCtx.fillText(`${xCell}`, x + cellDim, y + 1, maxWidth);
        gridCtx.fillText(`${yCell}`, x + cellDim, y + cellDim / 2, maxWidth);
      }
    }

    return [this.canvas.width, this.canvas.height];
  }

  selectCell(event, x, y) {}

  setCellState(x, y, state) {}

  initCanvas(document) {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    // set grid to full size, so we can draw fine lines with it
    this.gridCanvas = document.getElementById('grid-canvas');
    this.gridCanvas.width = this.gridCanvas.clientWidth;
    this.gridCanvas.height = this.gridCanvas.clientHeight;
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
}

export { CanvasRenderer };
