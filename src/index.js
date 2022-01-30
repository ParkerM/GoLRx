import Paper from 'paper/dist/paper-core';

const CANVAS_ID = 'game-grid';

/** @type {PaperScope} */
const paper = new Paper.PaperScope();

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById(CANVAS_ID);
paper.setup(canvas);


// simple test example

// create a path to draw a line on the view
const path = new paper.Path();
// set a color
path.strokeColor = new paper.Color('blue');
const start = new paper.Point(100, 100);
// move to start and draw a line from there
path.moveTo(start);
// Note that the plus operator on point does not work in
// javascript. Instead, we need to call the add() function.
const end = new paper.Point(200, -50);
path.lineTo(start.add(end));
// draw the view now
paper.view.draw();


