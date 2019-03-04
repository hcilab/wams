/*
 * WAMS code to be executed in the client browser.
 *
 * Author: Michael van der Kamp
 */

'use strict';

const ListenerFactory = require('./ListenerFactory.js');
const { NOP } = require('../shared.js');

/**
 * The MessageHandler logs listeners that are attached by the user and receives
 * messages from clients, which it then uses to call the appropriate listener.
 *
 * @memberof module:server
 */
class MessageHandler {
  /**
   * @param {module:server.WorkSpace} workspace - the model used when responding
   * to messages.
   */
  constructor(workspace) {
    /**
     * The model to access when responding to messages.
     *
     * @type {module:server.WorkSpace}
     */
    this.workspace = workspace;

    /**
     * Store event listeners in an object, for easy access by event type.
     *
     * @type {object}
     * @property {function} click - Handler for click events.
     * @property {function} drag - Handler for drag events.
     * @property {function} layout - Handler for layout events.
     * @property {function} rotate - Handler for rotate events.
     * @property {function} scale - Handler for scale events.
     * @property {function} swipe - Handler for swipe events.
     */
    this.handlers = {};

    // Attach NOPs for the event listeners, so they are callable.
    ListenerFactory.TYPES.forEach(ev => {
      this.handlers[ev] = NOP;
    });
  }

  /**
   * Call the registered handler for the given message type.
   *
   * @param {string} message - Type of message.
   * @param {...mixed} ...args - Arguments to pass to the handler.
   */
  handle(message, ...args) {
    this.handlers[message](...args);
  }

  /**
   * Register a handler for the given event.
   *
   * @param {string} event - Event to respond to.
   * @param {function} listener - Handler / listener to register.
   */
  on(event, listener) {
    const type = event.toLowerCase();
    this.handlers[type] = ListenerFactory.build(type, listener, this.workspace);
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
    if (phase === 'start' && active.length === 1) {
      this.workspace.obtainLock(centroid.x, centroid.y, view);
    } else if (phase === 'end' && active.length === 0) {
      view.releaseLockedItem();
    }
  }
}

module.exports = MessageHandler;

