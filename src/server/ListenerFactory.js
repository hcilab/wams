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

function click(listener, workspace) {
  return function handleClick(view, {x, y}) {
    const mouse = view.refineMouseCoordinates(x, y);
    if (mouse) {
      const {x, y} = mouse;
      const target = workspace.findItemByCoordinates(x, y) || view;
      listener(view, target, x, y);
    }
  };
};

function drag(listener, workspace) {
  return function handleDrag(view, {x, y, dx, dy, phase}) {
    const mouse = view.refineMouseCoordinates(x, y, dx, dy);
    if (mouse) {
      const {x, y, dx, dy} = mouse;
      const target = workspace.findItemByCoordinates(x, y, phase, view) || view;
      if (phase === 'move') {
        listener(view, target, x, y, dx, dy);
      }
    }
  };
};

function layout(listener, workspace) {
  return function handleLayout(view, index) {
    listener(view, index);
  };
};

function rotate(listener, workspace) {
  return function handleRotate(view, {radians}) {
    listener(view, radians);
  };
};

function scale(listener, workspace) {
  return function handleScale(view, {scale}) {
    listener(view, scale);
  };
};

function swipe(listener, workspace) {
  return function handleSwipe(view, {velocity, x, y, direction}) {
    const mouse = view.refineMouseCoordinates(x, y);
    if (mouse) {
      const {x,y} = mouse;
      const target = workspace.findItemByCoordinates(x, y) || view;
      listener(view, target, velocity, x, y, direction);
    }
  }
}

const BLUEPRINTS = Object.freeze({
  click,
  drag,
  layout,
  rotate,
  scale,
  swipe,
});

function build(type, listener, workspace) {
  if (typeof listener !== 'function') {
    throw 'Attached listener must be a function';
  } 
  return BLUEPRINTS[type](listener, workspace);
};

const TYPES = Object.keys(BLUEPRINTS);

const ListenerFactory = Object.freeze({
  build,
  TYPES,
});

module.exports = ListenerFactory;

