import { ColMajor, RowMajor } from './util.js';

describe('utils', () => {
  describe('Row-major order', () => {
    const width = 3;
    const mapper = new RowMajor(width);

    const addressMap = [
      { row: 0, col: 0, i: 0 },
      { row: 0, col: 1, i: 1 },
      { row: 0, col: 2, i: 2 },
      { row: 1, col: 0, i: 3 },
      { row: 1, col: 1, i: 4 },
      { row: 1, col: 2, i: 5 },
    ];

    it.each(addressMap)(
      'Maps (row=$row, col=$col) to index $i',
      ({ row, col, i }) => {
        expect(mapper.toI(row, col)).toEqual(i);
      },
    );

    it.each(addressMap)(
      'Maps index $i to (row=$row, col=$col)',
      ({ row, col, i }) => {
        expect(mapper.fromI(i)).toEqual([row, col]);
      },
    );
  });

  describe('Column-major order', () => {
    const height = 2;
    const mapper = new ColMajor(height);

    const addressMap = [
      { row: 0, col: 0, i: 0 },
      { row: 1, col: 0, i: 1 },
      { row: 0, col: 1, i: 2 },
      { row: 1, col: 1, i: 3 },
      { row: 0, col: 2, i: 4 },
      { row: 1, col: 2, i: 5 },
    ];

    it.each(addressMap)(
      'Maps (row=$row, col=$col) to index $i',
      ({ row, col, i }) => {
        expect(mapper.toI(row, col)).toEqual(i);
      },
    );

    it.each(addressMap)(
      'Maps index $i to (row=$row, col=$col)',
      ({ row, col, i }) => {
        expect(mapper.fromI(i)).toEqual([row, col]);
      },
    );
  });
});
