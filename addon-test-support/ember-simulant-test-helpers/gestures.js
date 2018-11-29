import simulant from './simulant'; // imported there by ember-cli: see index.js at the root of this project
import RSVP from 'rsvp';

const MOUSE_MOVE_INTERVAL = 10;

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

export function panX(element, options) {
  return new RSVP.Promise(function(resolve) {
    options = Object.assign({
      position: [50, 100],
      amount: 150,
      duration: 300,
      waitForMouseUp: RSVP.resolve()
    }, options);
    let position = adjustCoordinates(options.position);
    let startingX = position[0];
    let endingX = startingX + options.amount;

    trigger('mousedown', position, element);

    let mouseMoveCount = options.duration / MOUSE_MOVE_INTERVAL;
    let stepX = options.amount / mouseMoveCount;
    let scheduleMouseMove = function(x, y) {
      let currentPosition = [x, y];
      let finishedMoving = false;
      if (options.amount > 0 && x >= endingX) {
        finishedMoving = true;
      } else if (options.amount < 0 && x <= endingX) {
        finishedMoving = true;
      }

      if (finishedMoving) {
        options.waitForMouseUp.then(function() {
          trigger('mouseup', currentPosition, element);
          setTimeout(resolve, MOUSE_MOVE_INTERVAL);
        });
        return;
      }
      setTimeout(function() {
        trigger('mousemove', currentPosition, element);
        scheduleMouseMove(x + stepX, y);
      }, MOUSE_MOVE_INTERVAL);
    };
    scheduleMouseMove(position[0], position[1]);
  });
}

export function panY(element, options) {
  return new RSVP.Promise(function(resolve) {
    options = Object.assign({
      position: [10, 500],
      amount: 500,
      duration: 500,
      waitForMouseUp: RSVP.resolve()
    }, options);
    let startingY = options.position[1];
    let endingY = startingY - options.amount;

    trigger('mousedown', options.position, element);

    let mouseMoveCount = options.duration / MOUSE_MOVE_INTERVAL;
    let stepY = options.amount / mouseMoveCount;
    let scheduleMouseMove = function(x, y) {
      let position = [x, y];
      let finishedMoving = false;
      if (options.amount > 0 && y <= endingY) {
        finishedMoving = true;
      } else if (options.amount < 0 && y >= endingY) {
        finishedMoving = true;
      }

      if (finishedMoving) {
        options.waitForMouseUp.then(function() {
          trigger('mouseup', position, element);
          setTimeout(resolve, MOUSE_MOVE_INTERVAL);
        });
        return;
      }
      setTimeout(function() {
        trigger('mousemove', position, element);
        scheduleMouseMove(x, y - stepY);
      }, MOUSE_MOVE_INTERVAL);
    };
    scheduleMouseMove(options.position[0], options.position[1]);
  });
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
