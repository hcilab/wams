'use strict';

const Gestures = require('../gestures.js');

/**
 * The GestureController is in charge of processing server-side gestures for the
 * purpose of enabling multi-device gestures.
 *
 * @memberof module:server
 *
 * @param {module:server.MessageHandler} messageHandler - For responding to
 * gestures.
 * @param {module:server.ServerViewGroup} group - The view group associated with
 * this controller.
 */
class GestureController {
  constructor(messageHandler, group) {
    /**
     * For responding to gestures.
     *
     * @type {module:server.MessageHandler}
     */
    this.messageHandler = messageHandler;

    /**
     * Track the active group.
     *
     * @type {module:server.ServerViewGroup}
     */
    this.group = group;

    /**
     * The "region" which takes care of gesture processing.
     *
     * @type {module:server.Gestures.Region}
     */
    this.region = new Gestures.Region();

    this.begin();
  }

  /**
   * The Gestures component uses Gesture objects, and expects those objects to
   * be bound to a handler for responding to that gesture. This method takes
   * care of those activities.
   */
  begin() {
    const pan = new Gestures.Pan();
    const rotate = new Gestures.Rotate();
    const pinch = new Gestures.Pinch();
    const swipe = new Gestures.Swipe();
    const tap = new Gestures.Tap();
    const track = new Gestures.Track(['start', 'end']);

    const handleGesture = this.messageHandler.handleGesture;
    this.region.addGesture(pan, handleGesture.bind(this.messageHandler, 'drag', this.group));
    this.region.addGesture(tap, handleGesture.bind(this.messageHandler, 'click', this.group));
    this.region.addGesture(pinch, handleGesture.bind(this.messageHandler, 'scale', this.group));
    this.region.addGesture(rotate, handleGesture.bind(this.messageHandler, 'rotate', this.group));
    this.region.addGesture(swipe, handleGesture.bind(this.messageHandler, 'swipe', this.group));
    this.region.addGesture(track, ({ data }) => this.messageHandler.track(data, this.group));
  }

  /**
   * Processes a PointerEvent that has been forwarded from a client.
   *
   * @param {PointerEvent} event - The event from the client.
   */
  process(event) {
    this.region.arbitrate(event);
  }

  /**
   * Clear out inputs associated with the given view.
   *
   * @param {number} id - id of the view to clear our.
   */
  clearOutView(id) {
    this.region.clearInputsFromSource(id);
  }
}

module.exports = GestureController;
