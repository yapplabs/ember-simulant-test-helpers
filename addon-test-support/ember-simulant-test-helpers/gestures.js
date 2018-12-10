import simulant from './simulant'; // imported there by ember-cli: see index.js at the root of this project
import RSVP from 'rsvp';

const MOUSE_MOVE_INTERVAL = 10;

function* range(start, end, step) {
  while ((step > 0 && start <= end) || (step < 0 && start >= end)) {
    yield start;
    start += step;
  }
}

function trigger(eventName, position, element) {
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

function panAlongAxis(element, options) {
  return new RSVP.Promise(function(resolve) {
    options = Object.assign({
      position: [50, 100],
      amount: 150, // amount may be a number of pixels, OR an array of pixel amounts, to simulate pans going one direction and then back the other way
      duration: 300,
      axis: 'x',
      waitForMouseUp: RSVP.resolve()
    }, options);
    let position = adjustCoordinates(options.position);
    let unchangingPositon = options.axis === 'x' ? position[1] : position[0];
    let amounts = Array.isArray(options.amount) ? options.amount : [options.amount];

    trigger('mousedown', position, element);

    let mouseMoveCount = options.duration / MOUSE_MOVE_INTERVAL;
    let movesPerAmountSequence =  mouseMoveCount / amounts.length;

    let positions = [];
    let startingPosition = options.axis === 'x' ? position[0] : position[1];
    amounts.forEach((amount) => {
      let stepAmount = amount / movesPerAmountSequence;
      let endingPosition = startingPosition + amount;
      positions = positions.concat(Array.from(range(startingPosition, endingPosition, stepAmount)));
      startingPosition = endingPosition;
    });
    let positionIndex = 0;
    function xyPos(variablePos) {
      if (options.axis === 'x') {
        return [variablePos, unchangingPositon];
      } else {
        return [unchangingPositon, variablePos];
      }
    }
    let scheduleMouseMove = function() {
      let finishedMoving = positionIndex === positions.length;

      if (finishedMoving) {
        let mouseUpPosition = xyPos(positions[positionIndex - 1]);
        options.waitForMouseUp.then(function() {
          trigger('mouseup', mouseUpPosition, element);
          setTimeout(resolve, MOUSE_MOVE_INTERVAL);
        });
        return;
      }
      let currentPosition = xyPos(positions[positionIndex]);
      setTimeout(function() {
        trigger('mousemove', currentPosition, element);
        positionIndex++;
        scheduleMouseMove();
      }, MOUSE_MOVE_INTERVAL);
    };
    scheduleMouseMove();
  });
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
      resolve();
    }, options.duration);
  });
}
