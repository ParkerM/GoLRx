import { PixiRenderer } from './web/pixi-renderer.js';

const CANVAS_ID = 'game-grid';

const renderer = new PixiRenderer(document);
document.body.appendChild(renderer.nativeCanvas);

// setup stage
renderer.drawGrid();
// renderer.registerCellClickHandler();
