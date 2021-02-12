import simulant from './simulant'; // imported there by ember-cli: see index.js at the root of this project
import RSVP from 'rsvp';

const MOUSE_MOVE_INTERVAL = 10;

class Point {
  constructor(x, y) {
    if (arguments.length === 1) {
      this.x = x[0];
      this.y = x[1];
    } else {
      this.x = x;
      this.y = y;
    }
  }
  get tuple() {
    return [this.x, this.y];
  }
  offset(distance) {
    return new Point(this.x + distance.x, this.y + distance.y);
  }
}

class Distance {
  constructor(x, y) {
    if (arguments.length === 1) {
      this.x = x[0];
      this.y = x[1];
    } else {
      this.x = x;
      this.y = y;
    }
  }
  get tuple() {
    return [this.x, this.y];
  }
  dividedBy(divisor) {
    return new Distance(
     this.x / divisor,
     this.y / divisor
   );
  }
}

function* positionRange(start, end, step) {
  function done() {
    let isXDone = (step.x >= 0 && start.x >= end.x) || (step.x <= 0 && start.x <= end.x);
    let isYDone = (step.y >= 0 && start.y >= end.y) || (step.y <= 0 && start.y <= end.y);
    return isXDone && isYDone;
  }
  while (!done()) {
    yield start;
    start = start.offset(step);
  }
}

function trigger(eventName, position, element) {
  // console.log('trigger', ...arguments);
  simulant.fire(element, eventName, {
    clientX: position[0],
    clientY: position[1]
  });
}

let getTestContainerEl = function() {
  return document.querySelector('#ember-testing') || false;
};

function adjustCoordinates(position) {
  let testContainerEl = getTestContainerEl();
  if (testContainerEl) {
    let testContainerRect = testContainerEl.getBoundingClientRect();
    return [
      position[0] + testContainerRect.x,
      position[1] + testContainerRect.y
    ];
  }
  return position;
}

export function panAlongPath(element, options) {
  return new RSVP.Promise(function(resolve) {
    options = Object.assign({
      position: [50, 100],
      amounts: [[10, 10], [0, -20], [-20, 0], [-10, 10]],
      duration: 300,
      waitForMouseUp: RSVP.resolve()
    }, options);
    let { duration } = options;
    let position = new Point(adjustCoordinates(options.position));
    let distances = options.amounts.map(tuple => new Distance(tuple));
    trigger('mousedown', position.tuple, element);
    let mouseMoveCount = duration / MOUSE_MOVE_INTERVAL;
    let movesPerSequence =  mouseMoveCount / distances.length;
    let positions = [];
    let startingPosition = position;
    distances.forEach((distance) => {
      let stepDistance = distance.dividedBy(movesPerSequence);
      let endingPosition = startingPosition.offset(distance);
      positions = positions.concat(
        Array.from(positionRange(startingPosition, endingPosition, stepDistance))
      );
      startingPosition = endingPosition;
    });
    let positionIndex = 0;
    let scheduleMouseMove = function() {
      let finishedMoving = positionIndex === positions.length;

      if (finishedMoving) {
        let mouseUpPosition = positions[positionIndex - 1];
        options.waitForMouseUp.then(function() {
          trigger('mouseup', mouseUpPosition.tuple, element);
          trigger('click', mouseUpPosition.tuple, element);
          setTimeout(resolve, MOUSE_MOVE_INTERVAL);
        });
        return;
      }
      let currentPosition = positions[positionIndex];
      setTimeout(function() {
        trigger('mousemove', currentPosition.tuple, element);
        positionIndex++;
        scheduleMouseMove();
      }, MOUSE_MOVE_INTERVAL);
    };
    scheduleMouseMove();
  });
}

function panAlongAxis(element, options) {
  options = Object.assign({
    position: [50, 100],
    amount: 150, // amount may be a number of pixels, OR an array of pixel amounts, to simulate pans going one direction and then back the other way
    duration: 300,
    axis: 'x',
    waitForMouseUp: RSVP.resolve()
  }, options);
  if (options.axis === 'y') {
    options.amounts = Array.isArray(options.amount) ? options.amount.map(y => [0, y]) : [[0, options.amount]];
  } else {
    options.amounts = Array.isArray(options.amount) ? options.amount.map(x => [x, 0]) : [[options.amount, 0]];
  }
  delete options.amount;
  return panAlongPath(element, options);
}

export function panX(element, options) {
  return panAlongAxis(element, Object.assign(options, { axis: 'x' }));
}

export function panY(element, options) {
  return panAlongAxis(element, Object.assign(options, { axis: 'y' }));
}

export function press(element, options) {
  options = Object.assign({
    position: [10, 10],
    duration: 500
  }, options);
  let position = adjustCoordinates(options.position);
  trigger('mousedown', position, element);
  return new RSVP.Promise(function(resolve) {
    setTimeout(function() {
      trigger('mouseup', options.position, element);
      trigger('click', options.position, element);
      resolve();
    }, options.duration);
  });
}
