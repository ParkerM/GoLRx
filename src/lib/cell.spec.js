import { Subject } from 'rxjs';
import { Cell } from './cell.js';
import { State } from './util.js';

describe('Cells', () => {
  /** @type {Subject<void>} */
  let ticker;

  /** @type {Subject<number, number, State>} */
  let changeEmitter;

  /** @type {Subject<void>} */
  let stopSignal;

  /** @type {Cell} */
  let cell;

  /**
   * @param cell {Cell}
   * @param neighborStates {State[]}
   * @return {Cell[]} all cells
   */
  const setupNeighbors = (cell, neighborStates) => {
    const neighbors = neighborStates.map(
      (state, i) =>
        new Cell(ticker.asObservable(), i + 100, i + 100, changeEmitter, state),
    );

    const allCells = [cell].concat(...neighbors);
    for (let i = 0; i < allCells.length; i++) {
      for (let j = i; j < allCells.length; j++) {
        if (i === j) continue;
        allCells[j].addNeighbor(allCells[i]);
        allCells[i].addNeighbor(allCells[j]);
      }
    }
    return allCells;
  };

  beforeEach(() => {
    ticker = new Subject();
    changeEmitter = new Subject();
    stopSignal = new Subject();
  });

  describe('Game of Life', () => {
    beforeEach(() => {
      cell = new Cell(ticker.asObservable(), 1, 1, changeEmitter);
    });

    it('Any live cell with fewer than two live neighbours dies, as if by underpopulation', (done) => {
      cell.state = State.ALIVE;
      setupNeighbors(cell, [State.ALIVE, State.DEAD]);

      cell.listenUntil(stopSignal).subscribe({
        next: expectNext(State.DEAD, done),
      });
      ticker.next(void 0);
      stopSignal.next(void 0);
    });

    it('Any live cell with two live neighbours lives on to the next generation', (done) => {
      cell.state = State.ALIVE;
      setupNeighbors(cell, [State.ALIVE, State.ALIVE]);

      cell.listenUntil(stopSignal).subscribe({
        next: expectNext(State.ALIVE, done),
      });
      ticker.next(void 0);
      stopSignal.next(void 0);
    });

    it('Any live cell with three live neighbours lives on to the next generation', (done) => {
      cell.state = State.ALIVE;
      setupNeighbors(cell, [State.ALIVE, State.ALIVE, State.ALIVE]);

      cell.listenUntil(stopSignal).subscribe({
        next: expectNext(State.ALIVE, done),
      });
      ticker.next(void 0);
      stopSignal.next(void 0);
    });

    it('Any live cell with more than three live neighbours dies, as if by overpopulation', (done) => {
      cell.state = State.ALIVE;
      setupNeighbors(cell, [
        State.ALIVE,
        State.ALIVE,
        State.ALIVE,
        State.ALIVE,
      ]);

      cell.listenUntil(stopSignal).subscribe({
        next: expectNext(State.DEAD, done),
      });
      ticker.next(void 0);
      stopSignal.next(void 0);
    });

    it('Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction', (done) => {
      cell.state = State.DEAD;
      setupNeighbors(cell, [State.ALIVE, State.ALIVE, State.ALIVE]);

      cell.listenUntil(stopSignal).subscribe({
        next: expectNext(State.ALIVE, done),
      });
      ticker.next(void 0);
      stopSignal.next(void 0);
    });
  });
});

/**
 * @param {State} expected - expected state
 * @param {jest.DoneCallback} done - done callback
 * @returns {(State) => void}
 */
const expectNext = (expected, done) => (state) => {
  expect(state).toBe(expected);
  done();
};
