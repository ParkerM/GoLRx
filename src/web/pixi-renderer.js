import * as PIXI from 'pixi.js';

const BG_COLOR = 0xcccccc;
const CELL_COLOR = 0xffffff;

const CELL_SIZE = 50;
const CELL_PADDING = 5;

const ALPHA_SELECTED = 1;
const ALPHA_HOVER = 0.5;
const ALPHA_MAP = 0.1;

/** The length of a cell edge after applying padding. */
const CELL_SIZE_PADDED = CELL_SIZE - CELL_PADDING;

class PixiRenderer {
  /** @type {import('@pixi/app').Application} */
  #app;

  /** @type {import('@pixi/display').Container} */
  #rootContainer;

  /** @type {import('@pixi/display').Container} */
  #gridContainer;

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
   *
   * @param doc {Document} - enclosing document
   * @param width {number} - desired app width
   * @param height {number} - desired app height
   */
  constructor(doc, width = 1200, height = 600) {
    this.#width = width;
    this.#height = height;
    this.#app = new PIXI.Application({
      width: width + (CELL_PADDING * 2),
      height: height + (CELL_PADDING * 2),
      backgroundColor: BG_COLOR,
      resolution: doc.defaultView.devicePixelRatio || 1,
    });

    // fix mouseout events not having a target
    this.#app.renderer.plugins.interaction.moveWhenInside = true;

    this.#rootContainer = new PIXI.Container();
    this.#rootContainer.width = width;
    this.#rootContainer.height = height;
    this.#app.stage.addChild(this.#rootContainer);
  }

  /** @returns {HTMLCanvasElement} */
  get nativeCanvas() {
    return this.#app.view;
  }

  drawGrid() {
    this.#gridContainer = this.#rootContainer.addChild(new PIXI.Container());
    this.#gridContainer.position.x = CELL_PADDING + (CELL_PADDING / 2);
    this.#gridContainer.position.y = CELL_PADDING + (CELL_PADDING / 2);

    const hCellsNum = this.#width / CELL_SIZE;
    const vCellsNum = this.#height / CELL_SIZE;
    console.log(`width=${this.#width}, height=${this.#height}, cells horizontal=${hCellsNum}, cells vertical=${vCellsNum}`);

    for (let i = 0; i < (this.#height - CELL_PADDING) / CELL_SIZE; i++) {
      for (let j = 0; j < (this.#width - CELL_PADDING) / CELL_SIZE; j++) {
        const xPos = CELL_SIZE * j;
        const yPos = CELL_SIZE * i;
        const graphics = new PIXI.Graphics()
          .beginFill(CELL_COLOR)
          .drawRect(
            xPos,
            yPos,
            CELL_SIZE_PADDED,
            CELL_SIZE_PADDED,
          )
          .on('mousedown', selectFixture)
          .on('mouseover', hoverOver)
          .on('mouseout', hoverOut);
        graphics.interactive = true;
        graphics.buttonMode = true;
        graphics.alpha = ALPHA_MAP;
        graphics.id = 1 + i * j;
        this.#gridContainer.addChild(graphics);

        let text = new PIXI.Text(`${i},${j}`, {
          fontFamily: 'Arial',
          fontSize: CELL_SIZE / 2.5,
          fill: 0x000000,
          align: 'left',
        });
        text.position.x = xPos;
        text.position.y = yPos;
        this.#gridContainer.addChild(text);
      }

      this.#rootContainer.addChild(this.#gridContainer);
    }

    /**
     * @param event {import('@pixi/interaction').InteractionEvent}
     */
    function selectFixture(event) {
      const target = event.target;
      if (target.alpha !== ALPHA_SELECTED) {
        target.isSelected = true;
        target.alpha = ALPHA_SELECTED;
      } else {
        target.isSelected = false;
        target.alpha = ALPHA_MAP;
      }
    }

    /**
     * @param event {import('@pixi/interaction').InteractionEvent}
     */
    function hoverOver(event) {
      const target = event.target;
      if (target.alpha !== ALPHA_SELECTED) {
        target.alpha = ALPHA_HOVER;
        target.once('mouseout', (ev) => hoverOut(ev, target));
      }
    }

    /**
     * @param event {import('@pixi/interaction').InteractionEvent}
     * @param displayObject {import('@pixi/display').DisplayObject}
     */
    function hoverOut(event, displayObject) {
      if (!displayObject) return;
      if (displayObject.alpha !== ALPHA_SELECTED) {
        displayObject.alpha = ALPHA_MAP;
      }
    }
  }
}

export { PixiRenderer };
