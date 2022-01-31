import { PixiRenderer } from './web/pixi-renderer.js';
import { Game } from './lib/game.js';
import { CHANGE_EMITTER, Grid } from './lib/grid.js';
import { formatGrid } from './lib/util.js';

// Create renderer and add to document
const renderer = new PixiRenderer(document);
document.getElementById('game-div').appendChild(renderer.nativeCanvas);

// Prepare renderer stage and grid layout
const [xLen, yLen] = renderer.drawGrid();
console.log(`Rendered grid with cell layout ${xLen},${yLen}`);

// Setup buttons
/** @type {HTMLButtonElement} */
const btnStart = document.getElementById('btnStart');
btnStart.addEventListener('click', startButtonListener);

/** @type {HTMLButtonElement} */
const btnTick = document.getElementById('btnTick');
btnTick.addEventListener('click', doTick);

// create grid
const grid = new Grid(xLen, yLen);
// load game
const game = new Game(grid, renderer.cellToggled);

// load preset
const glider = [
  [0, 2],
  [1, 3],
  [2, 1],
  [2, 2],
  [2, 3],
];
grid.activateCells(glider);
glider.forEach(([x, y]) => renderer.setCellState(x, y, true));
console.log(formatGrid(grid.getGrid()));

// Listen for state changes and update view as needed
CHANGE_EMITTER.asObservable().subscribe({
  next: ([x, y, state]) => {
    console.log(`Saw state change: ${x},${y}=${state}`);
    renderer.setCellState(x, y, state);
  },
});

const TICK_INTERVAL_SECONDS = 2;

/**
 * @type {EventListener}
 * @param event {MouseEvent}
 */
function startButtonListener(event) {
  console.log('Button clicked');
  console.log(event);
  if (game.isRunning) {
    game.stop();
    event.target.textContent = 'Start';
  } else {
    game.start(TICK_INTERVAL_SECONDS);
    event.target.textContent = 'Stop';
  }
}

/**
 * @type {EventListener}
 * @param event {MouseEvent}
 */
function doTick(event) {
  console.log('Tick clicked');
  console.log(event);
  game.tick();
}
