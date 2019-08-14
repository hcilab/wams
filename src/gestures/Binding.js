/*
 * Contains the Binding class.
 */

'use strict';

/**
 * A Binding associates a gesture with a handler function that will be called
 * when the gesture is recognized.
 *
 * @memberof module:gestures
 *
 * @param {westures.Gesture} gesture - The Gesture to bind.
 * @param {Function} handler - The function handler to execute when a gesture is
 * recognized on the associated element.
 */
class Binding {
  constructor(gesture, handler) {
    /**
     * The gesture to associate with the given element.
     *
     * @type {westures.Gesture}
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
    const data = {...this.gesture[hook](state)};
    if (data) {
      delete data.active;
      delete data.target;
      delete data.radius;
      this.handler({
        data: {
          x:        state.centroid.x,
          y:        state.centroid.y,
          phase:    hook,
          ...data,
        },
      });
    }
  }
}

module.exports = Binding;

