const boolChar = (boolVal) => {
  if (boolVal === true) return '#';
  if (boolVal === false) return '.';
  else return '?'
}

/**
 * @template C
 * @param subGrid {Array<Array<C>>}
 * @param transform {(C) => boolean} optional boolean mapper for elements in {@link subGrid}
 * @return {string} table-formatted grid
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

export {formatGrid, printGrid};
