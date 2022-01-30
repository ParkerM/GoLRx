import { Renderer } from './web/renderer.js';

const CANVAS_ID = 'game-grid';

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById(CANVAS_ID);
const renderer = new Renderer(canvas);

// draw grid
renderer.drawGrid();
