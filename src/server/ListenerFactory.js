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
      const target = workspace.findItemByCoordinates(x, y) || view;
      listener(view, target, x, y);
    }
  };
};

/**
 * Generates a drag handler function, which will perform hit detection and item
 * locking (based on drag phase), then call the provided listener with
 * appropriate arguments.
 *
 * listener : User-supplied function for responding to this event.
 * workspace: The workspace upon which this event will act.
 */
function drag(listener, workspace) {
  return function handleDrag(view, {x, y, dx, dy, phase}) {
    const mouse = new CoordinateData(x, y, dx, dy).transformFrom(view);
    if (mouse) {
      const {x, y, dx, dy} = mouse;
      const target = workspace.findItemByCoordinates(x, y, phase, view) || view;
      if (phase === 'move') {
        listener(view, target, x, y, dx, dy);
      }
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
  return function handleRotate(view, {radians, px, py}) {
    const pivot = new CoordinateData(px, py).transformFrom(view);
    if (pivot) {
      const {x, y} = pivot;
      const target = workspace.findItemByCoordinates(x, y) || view;
      listener(view, target, radians, x, y);
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
  return function handleScale(view, {scale, mx, my}) {
    const mouse = new CoordinateData(mx, my).transformFrom(view);
    if (mouse) {
      const {x, y} = mouse;
      const target = workspace.findItemByCoordinates(x, y) || view;
      listener(view, target, scale, x, y);
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
  return function handleSwipe(view, {velocity, x, y, direction}) {
    const mouse = new CoordinateData(x, y).transformFrom(view);
    if (mouse) {
      const {x,y} = mouse;
      const target = workspace.findItemByCoordinates(x, y) || view;
      listener(view, target, velocity, x, y, direction);
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

