// import { PixiRenderer } from './web/pixi-renderer.js';
// import { Game } from './lib/game.js';
// import { Grid } from './lib/grid.js';
// import { formatGrid } from './lib/util.js';
// import { CssRenderer } from './web/css-renderer.js';
//
// // Create renderer and add to document
// const renderer = new CssRenderer(document);
//
// // Prepare renderer stage and grid layout
// const [xLen, yLen] = renderer.drawGrid();
// console.log(`Rendered grid with cell layout ${xLen},${yLen}`);
//
// // Setup buttons
// /** @type {HTMLButtonElement} */
// const btnStart = document.getElementById('btnStart');
// btnStart.addEventListener('click', startButtonListener);
//
// /** @type {HTMLButtonElement} */
// const btnTick = document.getElementById('btnTick');
// btnTick.addEventListener('click', doTick);
//
// /** @type {HTMLOutputElement} */
// const intervalLabel = document.getElementById('lbl-ticks-sec');
//
// /** @type {HTMLInputElement} */
// const slider = document.getElementById('interval-slider');
// intervalLabel.value = slider.value;
//
// slider.addEventListener('input', updateIntervalLabel);
// slider.addEventListener('change', applyInterval);
//
// // create grid
// const grid = new Grid(xLen, yLen);
// // load game
// const game = new Game(grid, renderer.cellToggled);
// // init tick value from element
// slider.dispatchEvent(new Event('change'));
//
// // load preset
// const glider = [
//   [0, 2],
//   [1, 3],
//   [2, 1],
//   [2, 2],
//   [2, 3],
// ];
// grid.activateCells(glider);
// renderer.activateCells(glider);
// console.log(formatGrid(grid.getGrid()));
//
// // Listen for state changes and update view as needed
// grid.changeEmitter.asObservable().subscribe({
//   next: ([x, y, state]) => {
//     console.log(`Saw state change: ${x},${y}=${state}`);
//     renderer.setCellState(x, y, state);
//   },
// });
//
// /**
//  * @type {EventListener}
//  * @param event {MouseEvent}
//  */
// function startButtonListener(event) {
//   console.log('Button clicked');
//   console.log(event);
//   if (game.isRunning) {
//     game.stop();
//     event.target.textContent = 'Start';
//   } else {
//     game.start();
//     event.target.textContent = 'Stop';
//   }
// }
//
// /**
//  * @type {EventListener}
//  * @param event {MouseEvent}
//  */
// function doTick(event) {
//   console.log('Tick clicked');
//   console.log(event);
//   game.tick();
// }
//
// /** @param {InputEvent} ev */
// function updateIntervalLabel(ev) {
//   intervalLabel.value = ev.target.value;
// }
//
// /** @param {Event} ev */
// function applyInterval(ev) {
//   const ticksPerSecond = ev.target.valueAsNumber;
//   const intervalMillis = (1 / ticksPerSecond) * 1000;
//   console.log(`Setting interval to ${intervalMillis} ms`);
//   game.tickInterval = intervalMillis;
// }
import { CanvasRenderer } from './web/canvas-renderer.js';

const renderer = new CanvasRenderer(document);
let wh = renderer.drawGrid();
console.log(wh);

// /** @type {HTMLCanvasElement} */
// const canvas = document.getElementById('game-canvas');
//
// /** @type {CanvasRenderingContext2D} */
// const ctx = canvas.getContext('2d');
// ctx.imageSmoothingEnabled = false;
//
// const cellsWide = canvas.width;
// const cellsHigh = canvas.height;
// //
// // function drawPixel(x, y) {
// //   // ctx.lineWidth = 1;
// //   // ctx.beginPath();
// //   // ctx.moveTo(x, y);
// //   // ctx.lineTo(x, y);
// //   // ctx.strokeStyle = "#000000";
// //   // ctx.stroke();
// //   ctx.fillRect(x, y, 1, 1);
// // }
//
// // for (let i = 0; i < cellsWide; i++) {
// //   for (let j = i; j < cellsHigh; j++) {
// //     ctx.fillRect(x, y, 1, 1);
// //   }
// // }
