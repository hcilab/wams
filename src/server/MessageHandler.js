/*
 * WAMS code to be executed in the client browser.
 *
 * Author: Michael van der Kamp
 */

'use strict';

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
     * Layout handler, for when clients connect to the application.
     *
     * @type {function}
     */
    this.onlayout = null;
  }

  /**
   * Handle a message for the given gesture.
   *
   * @param {string} gesture
   */
  handle(gesture, view) {
    function do_gesture({ data }) {
      const target = view.lockedItem;
      if (target != null) {
        const { centroid } = data;
        const { x, y } = view.transformPoint(centroid.x, centroid.y);
        const event = { view, target, x, y };
        this[gesture](event, data);
      }
    }
    return do_gesture.bind(this);
  }

  /**
   * Apply a click event
   *
   * @param {object} event
   */
  click(event) {
    const { target, x, y } = event;

    if (typeof target.containsPoint === 'function' &&
      target.containsPoint(x, y)) {
      if (target.onclick) target.onclick(event);
    } else {
      const target = this.workspace.findFreeItemByCoordinates(x, y) ||
        event.view;
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
    if (phase === 'start' && active.length === 1) {
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

    if (delta.hasOwnProperty('scale')) {
      this.scale(event, { ...event, scale: delta.scale });
    }

    if (delta.hasOwnProperty('rotation')) {
      this.rotate(event, { ...event, rotation: delta.rotation });
    }

    if (delta.hasOwnProperty('translation')) {
      const change = delta.translation;
      const d = event.view.transformPointChange(change.x, change.y);
      this.drag(event, { ...event, dx: d.x, dy: d.y });
    }
  }

  /**
   * Apply a scale event
   *
   * @param {object} event
   * @param {object} data
   */
  scale(event, data) {
    if (event.target.onscale) event.target.onscale(data);
  }

  /**
   * Apply a rotate event
   *
   * @param {object} event
   * @param {object} data
   */
  rotate(event, data) {
    if (event.target.onrotate) event.target.onrotate(data);
  }

  /**
   * Apply a swipe event
   *
   * @param {object} event
   * @param {object} data
   */
  drag(event, data) {
    if (event.target.ondrag) event.target.ondrag(data);
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
}

module.exports = MessageHandler;

