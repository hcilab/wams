'use strict';

/**
 * The MessageHandler logs listeners that are attached by the user and receives
 * messages from clients, which it then uses to call the appropriate listener.
 *
 * @memberof module:server
 *
 * @param {module:server.Application} application - The WAMS application for
 * this message handler.
 */
class MessageHandler {
  constructor(application) {
    /**
     * The Application to which this MessageHandler belongs.
     * @type {module:server.Application}
     * @private
     * @readonly
     */
    this.application = application;

    /**
     * The model to access when responding to messages.
     *
     * @type {module:server.WorkSpace}
     */
    this.workspace = application.workspace;
  }

  /**
   * Handle a message for the given gesture.
   *
   * @param {string} gesture
   */
  handleGesture(gesture, data) {
    const { centroid, event } = data;
    const { device, view, group } = event;
    const target = group.lockedItem;
    if (target != null) {
      const original = device.reversePoint(centroid.x, centroid.y);
      const { x, y } = view.transformPoint(original.x, original.y);
      this[gesture]({ ...event, centroid: { x, y }, x, y, target }, data);
    }
  }

  /**
   * Apply a click event
   *
   * @param {object} event
   */
  click(event) {
    const { target, x, y } = event;

    if (typeof target.containsPoint === 'function' && target.containsPoint(x, y)) {
      target.emit('click', event);
    } else {
      const target = this.workspace.findFreeItemByCoordinates(x, y) || event.group;
      target.emit('click', { ...event, target });
    }
  }

  /**
   * Apply a scale event
   *
   * @param {object} event
   * @param {object} scale
   */
  scale(event, { scale }) {
    event.target.emit('pinch', { ...event, scale });
  }

  /**
   * Apply a rotate event
   *
   * @param {object} event
   * @param {object} rotation
   */
  rotate(event, { rotation }) {
    event.target.emit('rotate', { ...event, rotation });
  }

  /**
   * Apply a swipe event
   *
   * @param {object} event
   * @param {module:shared.Point2D} change
   */
  drag(event, { translation }) {
    const { device, view, target } = event;
    const original = device.reversePointChange(translation.x, translation.y);
    const d = view.transformPointChange(original.x, original.y);
    target.emit('drag', { ...event, dx: d.x, dy: d.y });
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
    event.target.emit('swipe', { ...event, velocity, direction });
  }
}

module.exports = MessageHandler;
