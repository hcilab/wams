'use strict';

const { Pan, Rotate, Pinch, Swipe, Tap, Track } = require('westures');
const { Region } = require('/Users/mvanderkamp/projects/westures-core');

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
     * @type {module:westures.Region}
     */
    this.region = new Region(null, { headless: true });

    this.begin();
  }

  /**
   * The Gestures component uses Gesture objects, and expects those objects to
   * be bound to a handler for responding to that gesture. This method takes
   * care of those activities.
   */
  begin() {
    const handleGesture = this.messageHandler.handleGesture;

    const pan = new Pan(this.group, handleGesture.bind(this.messageHandler, 'drag', this.group));
    const rotate = new Rotate(this.group, handleGesture.bind(this.messageHandler, 'rotate', this.group));
    const pinch = new Pinch(this.group, handleGesture.bind(this.messageHandler, 'scale', this.group));
    const swipe = new Swipe(this.group, handleGesture.bind(this.messageHandler, 'swipe', this.group));
    const tap = new Tap(this.group, handleGesture.bind(this.messageHandler, 'click', this.group));
    const track = new Track(this.group, (data) => this.messageHandler.track(data, this.group), {
      phases: ['start', 'end'],
    });

    this.region.addGesture(pan);
    this.region.addGesture(tap);
    this.region.addGesture(pinch);
    this.region.addGesture(rotate);
    this.region.addGesture(swipe);
    this.region.addGesture(track);
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
    this.region.cancel({ type: 'blur' });
  }
}

module.exports = GestureController;
