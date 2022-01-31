import { PixiRenderer } from './web/pixi-renderer.js';
import { Game } from './lib/game.js';

const renderer = new PixiRenderer(document);
document.body.appendChild(renderer.nativeCanvas);

// setup stage
const [xLen, yLen] = renderer.drawGrid();
console.log(`Rendered grid with cell layout ${xLen},${yLen}`);

// create game
const game = new Game();

