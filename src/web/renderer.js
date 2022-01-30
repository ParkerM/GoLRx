/**
 * Wrapper class abstraction for anything related to drawing in the viewport.
 */
class Renderer {
  #canvas;

  /**
   * @param canvas {HTMLCanvasElement}
   */
  constructor(canvas) {
    // this.#canvas = new fabric.Canvas(canvas, {
    //   height: 500,
    //   width: 500,
    //   backgroundColor: 'white',
    //   selection: false,
    // });
  }

  drawRect() {
    // const rect = new fabric.Rect({
    //   left: 100,
    //   top: 100,
    //   fill: 'red',
    //   width: 20,
    //   height: 20,
    //   angle: 45,
    // });
    //
    // this.#canvas.add(rect);
    //
    // rect.set({left: 20, top: 50});
    // this.#canvas.renderAll();
    //
    // const circle = new fabric.Circle({
    //   radius: 20, fill: 'green', left: 100, top: 100
    // });
    // const triangle = new fabric.Triangle({
    //   width: 20, height: 30, fill: 'blue', left: 50, top: 50
    // });
    // this.#canvas.add(circle, triangle);
  }

  drawGridLines() {
    // const line = new fabric.Line([])
  }

  /** @returns {HTMLCanvasElement} */
  get nativeCanvas() {
    return this.#canvas;
  }
}

export { Renderer };
