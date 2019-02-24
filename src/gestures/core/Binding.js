/*
 * Contains the Binding class.
 */

'use strict';

/**
 * A Binding associates a gesture with an element and a handler function that
 * will be called when the gesture is recognized.
 *
 * @memberof module:gestures
 */
class Binding {
  /**
   * Constructor function for the Binding class.
   *
   * @param {module:gestures.Gesture} gesture - A instance of the Gesture type.
   * @param {Function} handler - The function handler to execute when a gesture
   *    is recognized on the associated element.
   */
  constructor(gesture, handler) {
    /**
     * The gesture to associate with the given element.
     *
     * @type {module:gestures.Gesture}
     */
    this.gesture = gesture;

    /**
     * The function handler to execute when the gesture is recognized on the
     * associated element.
     *
     * @type {Function}
     */
    this.handler = handler;
  }

  /**
   * Evalutes the given gesture hook, and dispatches any data that is produced.
   *
   * @param {string} hook - which gesture hook to call, must be one of 'start',
   *    'move', or 'end'.
   * @param {module:gestures.State} state - The current State instance.
   */
  evaluateHook(hook, state) {
    const data = this.gesture[hook](state);
    if (data) {
      data.phase = hook;
      data.event = state.event;
      data.type = this.gesture.type;
      this.handler(data);
    }
  }
}

module.exports = Binding;

