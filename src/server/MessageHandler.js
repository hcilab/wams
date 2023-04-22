/*
 * WAMS code to be executed in the client browser.
 *
 * Author: Michael van der Kamp
 */

'use strict';

const { Message, DataReporter } = require('../shared.js');
const { actions } = require('../predefined');

/**
 * The MessageHandler logs listeners that are attached by the user and receives
 * messages from clients, which it then uses to call the appropriate listener.
 *
 * @memberof module:server
 *
 * @param {module:server.WorkSpace} workspace - the model used when responding
 * to messages.
 */
class MessageHandler {
  constructor(workspace) {
    /**
     * The model to access when responding to messages.
     *
     * @type {module:server.WorkSpace}
     */
    this.workspace = workspace;

    /**
     * Custom event listeners. Maps string events names to arrays of functions.
     * Functions will be called with two arguments: the event object, and the
     * view object.
     *
     * Handlers can also be connected directly as "onX" properties of the
     * object, however only one handler can be connected per event type in this
     * manner.
     *
     * @type {object}
     */
    this.listeners = {};
  }

  /**
   * Handle a message for the given gesture.
   *
   * @param {string} gesture
   */
  handle(gesture, view) {
    function doGesture({ data }) {
      const target = view.lockedItem;
      if (target != null) {
        const { centroid } = data;
        const { x, y } = view.transformPoint(centroid.x, centroid.y);
        const event = { view, target, x, y };
        this[gesture](event, data);
      }
    }
    return doGesture.bind(this);
  }

  /**
   * Apply a click event
   *
   * @param {object} event
   */
  click(event) {
    const { target, x, y } = event;

    if (typeof target.containsPoint === 'function' && target.containsPoint(x, y)) {
      if (target.onclick) target.onclick(event);
    } else {
      const target = this.workspace.findFreeItemByCoordinates(x, y) || event.view;
      if (target.onclick) target.onclick({ ...event, target });
    }
  }

  /**
   * Performs locking and unlocking based on the phase and number of active
   * points.
   *
   * @param {Object} data
   * @param {module:shared.Point2D[]} data.active - Currently active contact
   * points.
   * @param {module:shared.Point2D} data.centroid - Centroid of active contact
   * points.
   * @param {string} data.phase - 'start', 'move', or 'end', the gesture phase.
   * @param {module:server.ServerView} view - Origin of track request.
   */
  track({ active, centroid, phase }, view) {
    if (phase === 'start' && view.lockedItem == null) {
      this.workspace.obtainLock(centroid.x, centroid.y, view);
    } else if (phase === 'end' && active.length === 0) {
      view.releaseLockedItem();
    }
  }

  /**
   * Apply a transformation event, splitting it into rotate, scale, and
   * move.
   *
   * @param {object} event
   * @param {object} data
   */
  transform(event, data) {
    const { delta } = data;

    if (Object.prototype.hasOwnProperty.call(delta, 'scale')) {
      this.scale(event, delta);
    }

    if (Object.prototype.hasOwnProperty.call(delta, 'rotation')) {
      this.rotate(event, delta);
    }

    if (Object.prototype.hasOwnProperty.call(delta, 'translation')) {
      this.drag(event, delta);
    }
  }

  /**
   * Apply a scale event
   *
   * @param {object} event
   * @param {object} scale
   */
  scale(event, { scale }) {
    if (event.target.onpinch) event.target.onpinch({ ...event, scale });
  }

  /**
   * Apply a rotate event
   *
   * @param {object} event
   * @param {object} rotation
   */
  rotate(event, { rotation }) {
    if (event.target.onrotate) event.target.onrotate({ ...event, rotation });
  }

  /**
   * Apply a swipe event
   *
   * @param {object} event
   * @param {module:shared.Point2D} change
   */
  drag(event, { translation }) {
    if (event.target.ondrag) {
      const d = event.view.transformPointChange(translation.x, translation.y);
      event.target.ondrag({
        ...event,
        dx: d.x,
        dy: d.y,
      });
    }
  }

  /**
   * Apply a swipe event
   *
   * @param {object} event
   * @param {object} data
   */
  swipe(event, data) {
    const { target } = event;
    const { velocity, direction } = data;
    if (target.onswipe) target.onswipe({ ...event, velocity, direction });
  }

  /**
   * Send Message to clients to dispatch custom Client event.
   *
   * @param {string} event name of the user-defined event.
   * @param {object} payload argument to pass to the event handler.
   */
  dispatch(action, payload) {
    const dreport = new DataReporter({
      data: { action, payload },
    });
    new Message(Message.DISPATCH, dreport).emitWith(this.workspace.namespace);
  }

  /**
   * Handle custom Server event dispatched by a client.
   *
   * @param {string} event name of the event.
   * @param {object} payload argument to pass to the event handler.
   */
  handleEvent(event, payload) {
    const callback_name = `on${event}`;
    if (!this[callback_name] && (!this.listeners[event] || this.listeners[event].length === 0)) {
      return console.warn(`Server is not listening for custom event "${event}"`);
    }
    if (this[callback_name]) this[callback_name](payload);
    this.listeners[event].forEach((listener) => listener(payload));
  }

  /**
   * Add a listener for the given event.
   *
   * @param {string} event name of the event.
   * @param {function} listener function to call when the event is dispatched.
   */
  addEventListener(event, listener) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(listener);
  }

  /**
   * Remove a listener for the given event.
   *
   * @param {string} event name of the event.
   * @param {function} listener function to call when the event is dispatched.
   * @returns {boolean} true if the listener was removed, false if it was not
   */
  removeEventListener(event, listener) {
    if (!this.listeners[event]) return false;
    const index = this.listeners[event].indexOf(listener);
    if (index === -1) return false;
    this.listeners[event].splice(index, 1);
    return true;
  }
}

module.exports = MessageHandler;
