'use strict';

const { Region, Pan, Rotate, Pinch, Swipe, Swivel, Tap } = require('westures/index');

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

    const pan = new Pan(this.group, handleGesture.bind(this.messageHandler, 'drag', this.group), {
      disableKeys: ['ctrlKey'],
    });
    const rotate = new Rotate(this.group, handleGesture.bind(this.messageHandler, 'rotate', this.group));
    const pinch = new Pinch(this.group, handleGesture.bind(this.messageHandler, 'scale', this.group));
    const swipe = new Swipe(this.group, handleGesture.bind(this.messageHandler, 'swipe', this.group));
    const tap = new Tap(this.group, handleGesture.bind(this.messageHandler, 'click', this.group));
    const swivel = new Swivel(this.group, this.processSwivel.bind(this), {
      enableKeys: ['ctrlKey'],
      dynamicPivot: true,
    });

    this.region.addGesture(pan);
    this.region.addGesture(tap);
    this.region.addGesture(pinch);
    this.region.addGesture(rotate);
    this.region.addGesture(swipe);
    this.region.addGesture(swivel);
  }

  /**
   * Process a swivel event from the gesture library, to make it look like a
   * regular rotate event.
   *
   * @param {string} event
   */
  processSwivel(event) {
    event.centroid = event.pivot;
    this.messageHandler.handleGesture('rotate', this.group, event);
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
   * Handle a keyboard event.
   *
   * @param {KeyboardEvent} event - The keyboard event.
   */
  handleKeyboardEvent(event) {
    this.region.handleKeyboardEvent(event);
  }

  /**
   * Clear out inputs associated with the given view.
   *
   * @param {number} id - id of the view to clear our.
   */
  clearOutView(id) {
    this.region.cancel({ type: 'blur' });
  }

  /**
   * Whether there are no active inputs- that is, the gesture controller is at
   * rest.
   *
   * @return {boolean} Whether there are active inputs.
   */
  hasNoInputs() {
    return this.region.state.hasNoInputs();
  }
}

module.exports = GestureController;
