/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 *
 * Original author: Jesse Rolheiser
 * Other revisions and supervision: Scott Bateman
 *
 * Treat this factory as a static class with no constructor. If you try to
 * instantiate it with the 'new' keyword you will get an exception. Its primary
 * usage is for generating appropriate listeners via its 'build' function.
 */

'use strict';

const CoordinateData = require('./CoordinateData.js');
const ServerItem     = require('./ServerItem.js');

/**
 * Generates a click handler function, which will perform hit detection then
 * call the provided listener with appropriate arguments.
 *
 * listener : User-supplied function for responding to this event.
 * workspace: The workspace upon which this event will act.
 */
function click(listener, workspace) {
  return function handleClick(view, {x, y}) {
    const mouse = new CoordinateData(x, y).transformFrom(view);
    if (mouse) {
      const {x, y} = mouse;
      if (view.lockedItem instanceof ServerItem && 
          view.lockedItem.containsPoint(x, y)) {
        listener(view, view.lockedItem, x, y);
      } else {
        const target = workspace.findFreeItemByCoordinates(x, y) || view;
        listener(view, target, x, y);
      }
    }
  };
};

/**
 * Generates a drag handler function, which will call the provided listener with
 * appropriate arguments.
 *
 * listener : User-supplied function for responding to this event.
 * workspace: The workspace upon which this event will act.
 */
function drag(listener, workspace) {
  return function handleDrag(view, { change, point }) {
    const { x, y } = point;
    const dx = change.x;
    const dy = change.y;
    const mouse = new CoordinateData(x, y, dx, dy).transformFrom(view);
    if (mouse) {
      const {x, y, dx, dy} = mouse;
      listener(view, view.lockedItem, x, y, dx, dy);
    }
  };
};

/**
 * Generates a layout handler function. Simply calls the listener with the same
 * arguments as it received. Styled in this manner to match format of other
 * listeners.
 *
 * listener : User-supplied function for responding to this event.
 * workspace: The workspace upon which this event will act.
 */
function layout(listener, workspace) {
  return function handleLayout(view, index) {
    listener(view, index);
  };
};

/**
 * Generates a rotate handler function. Unpacks the arguments and forwards them
 * to the provided listener.
 *
 * listener : User-supplied function for responding to this event.
 * workspace: The workspace upon which this event will act.
 */
function rotate(listener, workspace) {
  return function handleRotate(view, { delta, pivot }) {
    const radians = delta;
    const point = new CoordinateData(pivot.x, pivot.y).transformFrom(view);
    if (point) {
      const { x, y } = point;
      listener(view, view.lockedItem, radians, x, y);
    }
  };
};

/**
 * Generates a scale handler function. Unpacks the arguments and forwards to the
 * provided listener.
 *
 * listener : User-supplied function for responding to this event.
 * workspace: The workspace upon which this event will act.
 */
function scale(listener, workspace) {
  return function handleScale(view, { change, midpoint }) {
    const { x, y } = midpoint;
    const scale = change;
    const mouse = new CoordinateData(x, y).transformFrom(view);
    if (mouse) {
      const {x, y} = mouse;
      listener(view, view.lockedItem, scale, x, y);
    }
  };
};

/**
 * Generates a swipe handler function, which will perform hit detection then
 * call the provided listener with appropriate arguments.
 *
 * listener : User-supplied function for responding to this event.
 * workspace: The workspace upon which this event will act.
 */
function swipe(listener, workspace) {
  return function handleSwipe(view, { x, y, velocity, direction }) {
    const mouse = new CoordinateData(x, y).transformFrom(view);
    if (mouse) {
      const { x,y } = mouse;
      listener(view, view.lockedItem, x, y, velocity, direction);
    }
  }
}

// Organize the above functions into an Object for easy access.
const BLUEPRINTS = Object.freeze({
  click,
  drag,
  layout,
  rotate,
  scale,
  swipe,
});

/**
 * Builds a Listener of the given type, using the provided listener and
 * workspace.
 *
 * type     : Type of Listener to build.
 * listener : Function which will respond to the listened-to event.
 * workspace: Workspace on which the Listener will act.
 */
function build(type, listener, workspace) {
  if (typeof listener !== 'function') {
    throw 'Attached listener must be a function';
  } 
  return BLUEPRINTS[type](listener, workspace);
};

const ListenerFactory = Object.freeze({
  build,
  TYPES: Object.keys(BLUEPRINTS),
});

module.exports = ListenerFactory;

