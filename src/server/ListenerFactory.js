/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 *
 * Original author: Jesse Rolheiser
 * Other revisions and supervision: Scott Bateman
 */

'use strict';

const ServerItem     = require('./ServerItem.js');

/**
 * The user event listeners must conform to these specifications.
 *
 * @namespace ListenerTypes
 * @memberof module:server
 */

/**
 * User-supplied listener to respond to click events.
 *
 * @typedef ClickListener
 * @memberof module:server.ListenerTypes
 * @type {function}
 * @param {module:server.ServerView} view - View from which the click
 * originates.
 * @param {( server.ServerView|server.ServerItem )} target - View or Item which
 * the click targets.
 * @param {number} x - x coordinate of the click.
 * @param {number} y - y coordinate of the click.
 */

/**
 * Generates a click handler function, which will perform hit detection then
 * call the provided listener with appropriate arguments.
 *
 * @memberof BLUEPRINTS
 * @param {ClickListener} listener - User-supplied function for responding to
 *    this event.
 * @param {module:server.Workspace} workspace - The workspace upon which this
 * event will act.
 * @return {function} Click handler.
 */
function click(listener, workspace) {
  return function handleClick(view, point) {
    const { x, y } = view.transformPoint(point.x, point.y);
    if (view.lockedItem instanceof ServerItem &&
      view.lockedItem.containsPoint(x, y)) {
      listener(view, view.lockedItem, x, y);
    } else {
      const target = workspace.findFreeItemByCoordinates(x, y) || view;
      listener(view, target, x, y);
    }
  };
}

/**
 * User-supplied listener to respond to drag events.
 *
 * @typedef DragListener
 * @memberof module:server.ListenerTypes
 * @type {function}
 * @param {module:server.ServerView} view - View from which the drag originates.
 * @param {( server.ServerView|server.ServerItem )} target - View or Item which
 *    the drag targets.
 * @param {number} x - x coordinate of the drag.
 * @param {number} y - y coordinate of the drag.
 * @param {number} dx - change in the x direction since last drag.
 * @param {number} dy - change in the y direction since last drag.
 */

/**
 * Generates a drag handler function, which will call the provided listener with
 * appropriate arguments.
 *
 * @memberof BLUEPRINTS
 * @param {DragListener} listener - User-supplied function for responding to
 *    this event.
 * @return {function} Drag handler.
 */
function drag(listener) {
  return function handleDrag(view, { change, point }) {
    const p = view.transformPoint(point.x, point.y);
    const dp = view.transformPointChange(change.x, change.y);
    listener(view, view.lockedItem, p.x, p.y, dp.x, dp.y);
  };
}

/**
 * User-supplied listener to respond to layout events.
 *
 * @typedef LayoutListener
 * @memberof module:server.ListenerTypes
 * @type {function}
 * @param {module:server.ServerView} view - View from which the layout
 * originates.
 * @param {number} index - internal index / id of the view.
 */

/**
 * Generates a layout handler function. Simply calls the listener with the same
 * arguments as it received. Styled in this manner to match format of other
 * listeners.
 *
 * @memberof BLUEPRINTS
 * @param {LayoutListener} listener - User-supplied function for responding to
 * this event.
 * @return {function} Layout handler.
 */
function layout(listener) {
  return function handleLayout(view, index) {
    listener(view, index);
  };
}

/**
 * User-supplied listener to respond to rotate events.
 *
 * @typedef RotateListener
 * @memberof module:server.ListenerTypes
 * @type {function}
 * @param {module:server.ServerView} view - View from which the rotate
 * originates.
 * @param {( server.ServerView|server.ServerItem )} target - View or Item which
 *    the rotate targets.
 * @param {number} radians - Change in angle since last rotate, in radians.
 * @param {number} x - x coordinate of the rotate.
 * @param {number} y - y coordinate of the rotate.
 */

/**
 * Generates a rotate handler function. Unpacks the arguments and forwards them
 * to the provided listener.
 *
 * @memberof BLUEPRINTS
 * @param {RotateListener} listener - User-supplied function for responding to
 * this event.
 * @return {function} Rotate handler.
 */
function rotate(listener) {
  return function handleRotate(view, { delta, pivot }) {
    const radians = delta;
    const { x, y } = view.transformPoint(pivot.x, pivot.y);
    listener(view, view.lockedItem, radians, x, y);
  };
}

/**
 * User-supplied listener to respond to scale events.
 *
 * @typedef ScaleListener
 * @memberof module:server.ListenerTypes
 * @type {function}
 * @param {module:server.ServerView} view - View from which the scale
 * originates.
 * @param {( server.ServerView|server.ServerItem )} target - View or Item which
 *    the scale targets.
 * @param {number} scale - Change in scale since last emit.
 * @param {number} x - x coordinate of the scale.
 * @param {number} y - y coordinate of the scale.
 */

/**
 * Generates a scale handler function. Unpacks the arguments and forwards to the
 * provided listener.
 *
 * @memberof BLUEPRINTS
 * @param {ScaleListener} listener - User-supplied function for responding to
 * this event.
 * @return {function} Scale handler.
 */
function scale(listener) {
  return function handleScale(view, { change, midpoint }) {
    const scale = change;
    const { x, y } = view.transformPoint(midpoint.x, midpoint.y);
    listener(view, view.lockedItem, scale, x, y);
  };
}

/**
 * User-supplied listener to respond to swipe events.
 *
 * @typedef SwipeListener
 * @memberof module:server.ListenerTypes
 * @type {function}
 * @param {module:server.ServerView} view - View from which the scale
 * originates.
 * @param {( server.ServerView|server.ServerItem )} target - View or Item which
 *    the scale targets.
 * @param {number} x - x coordinate of the swipe.
 * @param {number} y - y coordinate of the swipe.
 * @param {number} velocity - velocity of the swipe.
 * @param {number} direction - direction of the swipe, in radians.
 */

/**
 * Generates a swipe handler function, which will perform hit detection then
 * call the provided listener with appropriate arguments.
 *
 * @memberof BLUEPRINTS
 * @param {SwipeListener} listener - User-supplied function for responding to
 * this event.
 * @return {function} Swipe handler.
 */
function swipe(listener) {
  return function handleSwipe(view, { point, velocity, direction }) {
    const { x, y } = view.transformPoint(point.x, point.y);
    listener(view, view.lockedItem, x, y, velocity, direction);
  };
}

/**
 * Organize the blueprint functions into an Object for easy access.
 *
 * @private
 * @namespace BLUEPRINTS
 */
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
 * @param {string} type - Type of Listener to build. One of 'click', 'drag',
 *    'layout', 'rotate', 'scale', or 'swipe'.
 * @param {Function} listener - Function which will respond to the listened-to
 *    event.
 * @param {module:server.WorkSpace} workspace - Workspace on which the Listener
 * will act.
 *
 * @memberof module:server.ListenerFactory
 */
function build(type, listener, workspace) {
  if (typeof listener !== 'function') {
    throw 'Attached listener must be a function';
  }
  return BLUEPRINTS[type](listener, workspace);
}

/**
 * The types of blueprints that are available.
 *
 * @type {string[]}
 * @memberof module:server.ListenerFactory
 */
const TYPES = Object.keys(BLUEPRINTS);

/**
 * Treat this factory as a static class with no constructor. If you try to
 * instantiate it with the 'new' keyword you will get an exception. Its primary
 * usage is for generating appropriate listeners via its 'build' function.
 *
 * @namespace ListenerFactory
 * @memberof module:server
 */
const ListenerFactory = Object.freeze({
  build,
  TYPES,
});

module.exports = ListenerFactory;

