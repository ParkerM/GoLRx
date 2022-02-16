import * as PIXI from 'pixi.js';
import { Subject } from 'rxjs';
import { State } from '../lib/util.js';
import { RendererBase } from './renderer-base.js';

const BG_COLOR = 0xcccccc;
const CELL_COLOR = 0xffffff;

// const CELL_SIZE = 50;
// const CELL_PADDING = 5;

const CELL_SIZE = 10;
const CELL_PADDING = 1;

const ALPHA_SELECTED = 1;
const ALPHA_HOVER = 0.5;
const ALPHA_CELL = 0.1;

/** The length of a cell edge after applying padding. */
const CELL_SIZE_PADDED = CELL_SIZE - CELL_PADDING;

class PixiRenderer extends RendererBase {
  /** @type {import('@pixi/app').Application} */
  #app;

  /** @type {import('@pixi/display').Container} */
  #rootContainer;

  /** @type {import('@pixi/display').Container} */
  #gridContainer;

  /** @type {import('@pixi/sprite').Sprite[][]} */
  #cells = [];

  /**
   * Reference cell graphic to provide shared geometry for instances.
   *
   * @member {import('@pixi/graphics').Graphics}
   */
  #cellTemplate;

  /**
   * Application width.
   * @type {number}
   */
  #width;

  /**
   * Application height.
   * @type {number}
   */
  #height;

  /**
   * Subject that emits [x, y, isActive] when a cell is clicked.
   * @type {Subject<[number, number, State]>}
   */
  cellToggled = new Subject();

  /**
   *
   * @param doc {Document} - enclosing document
   * @param width {number} - desired app width
   * @param height {number} - desired app height
   */
  constructor(doc, width = 1200, height = 600) {
    super();
    this.#width = width;
    this.#height = height;
    this.#app = new PIXI.Application({
      width: width + CELL_PADDING * 2,
      height: height + CELL_PADDING * 2,
      backgroundColor: BG_COLOR,
      resolution: doc.defaultView.devicePixelRatio || 1,
    });

    this.#rootContainer = new PIXI.Container();
    this.#rootContainer.width = width;
    this.#rootContainer.height = height;
    this.#app.stage.addChild(this.#rootContainer);
  }

  /** @returns {HTMLCanvasElement} */
  get nativeCanvas() {
    return this.#app.view;
  }

  /**
   * @param {number} width
   * @param {number} height
   * @returns {import('@pixi/graphics').GraphicsGeometry}
   */
  createCellBase(width, height) {
    if (!this.#cellTemplate) this.#cellTemplate = new PIXI.Graphics();
    this.#cellTemplate.drawRect(0, 0, width, height);
    this.#cellTemplate.visible = false;
    return this.#cellTemplate.geometry;
  }

  /** @param target {import('@pixi/display').DisplayObject} */
  #activateCell(target) {
    target.isSelected = true;
    target.alpha = ALPHA_SELECTED;
  }

  drawGrid() {
    const cellGeometry = this.createCellBase(
      CELL_SIZE_PADDED,
      CELL_SIZE_PADDED,
    );

    this.#gridContainer = this.#rootContainer.addChild(new PIXI.Container());
    this.#gridContainer.position.x = CELL_PADDING + CELL_PADDING / 2;
    this.#gridContainer.position.y = CELL_PADDING + CELL_PADDING / 2;

    const hCellsNum = this.#width / CELL_SIZE;
    const vCellsNum = this.#height / CELL_SIZE;

    let vCells = (this.#height - CELL_PADDING) / CELL_SIZE;
    let hCells = (this.#width - CELL_PADDING) / CELL_SIZE;
    for (let x = 0; x < hCells; x++) {
      this.#cells[x] = [];
      for (let y = 0; y < vCells; y++) {
        const xPos = CELL_SIZE * x;
        const yPos = CELL_SIZE * y;

        // /** @type {import('@pixi/sprite').Sprite} */
        // const sprite = new PIXI.Sprite(CELL_TEXTURE);
        // sprite.position.set(xPos, yPos);
        // sprite.on('mousedown', (ev) => this.selectCell(ev, x, y));
        // sprite.on('mouseover', (ev) => this.hoverOver(ev));
        // sprite.interactive = true;
        // sprite.buttonMode = true;
        // sprite.alpha = ALPHA_CELL;
        // sprite.id = `${x},${y}`;
        // sprite.cellX = x;
        // sprite.cellY = y;
        // this.#cells[x].push(this.#gridContainer.addChild(sprite));
        const graphics = new PIXI.Graphics()
          .beginFill(CELL_COLOR)
          .drawRect(xPos, yPos, CELL_SIZE_PADDED, CELL_SIZE_PADDED)
          .on('mousedown', (ev) => this.selectCell(ev, x, y));
        // .on('mouseover', (ev) => this.hoverOver(ev));
        graphics.interactive = true;
        graphics.buttonMode = true;
        graphics.alpha = ALPHA_CELL;
        graphics.id = `${x},${y}`;
        graphics.cellX = x;
        graphics.cellY = y;
        this.#cells[x].push(this.#gridContainer.addChild(graphics));

        // let text = new PIXI.Text(`${x},${y}`, {
        //   fontFamily: 'Arial',
        //   fontSize: CELL_SIZE / 2.5,
        //   fill: 0x000000,
        //   align: 'left',
        // });
        // text.position.x = xPos;
        // text.position.y = yPos;
        // this.#gridContainer.addChild(text);
      }
    }
    return [hCellsNum, vCellsNum];
  }

  /**
   * @param event {import('@pixi/interaction').InteractionEvent}
   */
  hoverOver(event) {
    const target = event.target;
    if (target.alpha !== ALPHA_SELECTED) {
      target.alpha = ALPHA_HOVER;
      target.once('mouseout', (ev) => this.hoverOut(ev, target));
    }
  }

  /**
   * @param event {import('@pixi/interaction').InteractionEvent}
   * @param displayObject {import('@pixi/display').DisplayObject}
   */
  hoverOut(event, displayObject) {
    if (!displayObject) return;
    if (displayObject.alpha !== ALPHA_SELECTED) {
      displayObject.alpha = ALPHA_CELL;
    }
  }

  selectCell(event, x, y) {
    const target = event.target;
    if (target.alpha !== ALPHA_SELECTED) {
      this.#activateCell(target);
      this.cellToggled.next([x, y, State.ALIVE]);
    } else {
      this.#deactivateCell(target);
      this.cellToggled.next([x, y, State.DEAD]);
    }
    console.log(`Click at ${x},${y}.`);
    console.log(event);
    console.log(this);
    console.log(`Known cell: ${this.#cells[x][y].id}`);
  }

  /** @param target {import('@pixi/display').DisplayObject} */
  #deactivateCell(target) {
    target.isSelected = false;
    target.alpha = ALPHA_CELL;
  }

  setCellState(x, y, state) {
    console.log(`Setting cell state at ${x},${y} to ${state}`);
    if (state.isAlive) this.#activateCell(this.#cells[x][y]);
    else this.#deactivateCell(this.#cells[x][y]);
  }

  activateCells(coords) {
    coords.forEach(([x, y]) => this.#activateCell(this.#cells[x][y]));
  }
}

export { PixiRenderer };
