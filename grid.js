import {BehaviorSubject, Subject} from "rxjs";
import {EventEmitter} from 'events';

const boolChar = (boolVal) => {
  if (boolVal === true) return '#';
  if (boolVal === false) return '.';
  else return '?'
}

/**
 * @template C
 * @param subGrid {Array<Array<C>>}
 * @param transform {(C) => boolean}
 * @return {string} formatted grid
 */
function formatGrid(subGrid, transform = (c) => c) {
  let out = '---';
  out += '-'.repeat(subGrid.length * 2) + '\n';
  subGrid.forEach(row => {
    out += '| ';
    out += row.map(cell => boolChar(transform(cell))).join(' ');
    out += ' |\n';
  });
  out += '---';
  out += '-'.repeat(subGrid.length * 2) + '\n';
  return out;
}

/** @param subGrid {Array<Array<Cell>>} */
function printGrid(subGrid) {
  console.log(formatGrid(subGrid, c => c.alive));
}

class Game {

  /** @type {Set<Cell>} */
  #cells;

  /**
   * @param {Grid} grid - The grid on which the game is played.
   * @param {Set<Cell>} seed - The initial pattern of cells.
   */
  constructor(grid, seed) {
    this.grid = grid;
    this.#cells = seed;
    // seed.forEach(cell => this.grid.pl.get(cell.x).set(cell.y));
  }

  /**
   * @returns {Set<Cell>}
   */
  get cells() {
    return this.#cells;
  }
}

class Grid {

  /**
   * Dummy cell to represent oob
   * @type {Cell}
   */
  oobCell;

  /** @type {Array<Array<Cell>>} */
  #plane;

  /** @type {number} */
  xLen;

  /** @type {number} */
  yLen;

  /** @type {EventEmitter} */
  emitter = new EventEmitter();

  /**
   * @param {number} width - Width of grid (integer)
   * @param {number} height - Height of grid (integer)
   */
  constructor(width, height) {
    this.oobCell = new Cell(null, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);

    this.xLen = width;
    this.yLen = height;
    this.initPlane();
  }

  initPlane() {
    this.#plane = new Array(this.xLen);
    for (let x = 0; x < this.xLen; x++) {
      let col = new Array(this.yLen);
      for (let y = 0; y < this.yLen; y++) {
        col[y] = new Cell(this, x, y);
      }
      this.#plane[x] = col;
    }
  }

  /**
   * @param {number} x
   * @param {number} y
   */
  activateCell(x, y) {
    this.getCellAt(x, y).alive = true;
  }

  /**
   * @param {number} x
   * @param {number} y
   * @returns {Cell}
   */
  getCellAt(x, y) {
    if (!this.insideBounds([x, y])) return this.oobCell;
    return this.#plane[x][y];
  }

  /**
   * @returns {boolean[][]} - A grid of live (true) and dead (false) cells
   */
  getGrid() {
    return this.#plane.map(row => row.map(cell => cell.alive));
  }

  /**
   * Returns true if (x,y) are within bounds
   *
   * @param x {number}
   * @param y {number}
   * @return {boolean}
   */
  insideBounds = ([x, y]) =>
      x >= 0 &&
      y >= 0 &&
      x < this.xLen &&
      y < this.yLen;

  /**
   * Get the 8 neighboring cells
   * @returns {Cell[]}
   */
  getAdjacentCells(xPos, yPos) {
    const neighborCells = [
        [-1 + xPos, -1 + yPos],
        [ 0 + xPos, -1 + yPos],
        [ 1 + xPos, -1 + yPos],
        [-1 + xPos,  0 + yPos],
        [ 1 + xPos,  0 + yPos],
        [-1 + xPos,  1 + yPos],
        [ 0 + xPos,  1 + yPos],
        [ 1 + xPos,  1 + yPos],
    ];

    // console.log(`Coords adjacent to (${xPos}, ${yPos}):\n${neighborCells.join('\n')}`);
    let adjacent = neighborCells
        .filter(this.insideBounds);
    // console.log(adjacent);

    const result = adjacent
        .map(([x, y]) => this.getCellAt(x, y));
    // console.log(`${result.length} adjacent to (${xPos},${yPos}): ${result.map(cell => '(' + cell.posX + ',' + cell.posY + ') - ' + cell.alive).join(', ')}\n${formatGrid(this.getGrid())}`)
    // console.log(`After mapping for (${xPos},${yPos}):`);
    // console.table(result.map(cell => cell.alive));
    return result;
  }

  transition() {
    for (let x = 0; x < this.xLen; x++) {
      for (let y = 0; y < this.yLen; y++) {
        this.getCellAt(x, y).updateState();
      }
    }
    console.log("Cell states updated")
    printGrid(this.#plane);

    for (let x = 0; x < this.xLen; x++) {
      for (let y = 0; y < this.yLen; y++) {
        this.getCellAt(x, y).flush();
      }
    }
    console.log("Cells flushed")
    printGrid(this.#plane);
  }
}

class Cell {

  subject;

  /**
   * Reference to the parent grid
   * @type {Grid}
   */
  grid;

  /** @type {number} */
  posX;

  /** @type {number} */
  posY;

  /** @type {boolean} */
  alive;

  /** @type {boolean} */
  next;

  /**
   * @param {Grid} grid
   * @param {number} x
   * @param {number} y
   */
  constructor(grid, x, y) {
    this.posX = x;
    this.posY = y;
    this.grid = grid;
    this.alive = false;
    this.subject = new Subject();
  }

  updateState() {
    if (!this.grid) return;
    let livingNeighborCount = this.grid
        .getAdjacentCells(this.posX, this.posY)
        .filter(cell => cell.alive)
        .length;

    if (this.alive) {
      if (livingNeighborCount < 2) {
        this.next = false;
        return;
      } else if (livingNeighborCount === 2 || livingNeighborCount === 3) {
        this.next = true;
        return;
      } else if (livingNeighborCount > 3) {
        this.next = false;
        return;
      }
    } else if (livingNeighborCount === 3) {
        this.next = true;
        return;
    } else {
      this.next = false;
      return;
    }


    let msg = '';
    msg += `I got to the end of the branches. I'm ${this.posX},${this.posY} and my neighbor count is ${livingNeighborCount}\n`;
    msg += 'See my grid:\n';
    msg += formatGrid(this.grid.getGrid());
    console.log(msg);
  }

  flush() {
    if (!this.grid) {
      console.warn("FLUSHING RETURNING EARLY DUE TO MISSING GRID");
      return;
    }
    console.log(`Flushing (${this.posX},${this.posY}): Alive = ${this.alive}, Next = ${this.next}\n${formatGrid(this.grid.getGrid())}`);
    this.alive = this.next;
    this.next = undefined;
  }
}

export {Cell, Game, Grid};
