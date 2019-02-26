/*
 * Contains the Pan class.
 */

'use strict';

const Gesture = require('../core/Gesture.js');

const REQUIRED_INPUTS = 1;

/**
 * Data returned when a Pan is recognized.
 *
 * @typedef {Object} PanData
 * @mixes module:gestures.ReturnTypes.BaseData
 *
 * @property {module:gestures.Point2D} change - The change vector from the last
 * emit.
 * @property {module:gestures.Point2D} point - The centroid of the currently
 * active points.
 *
 * @memberof module:gestures.ReturnTypes
 */

/**
 * A Pan is defined as a normal movement in any direction.
 *
 * @extends module:gestures.Gesture
 * @see module:gestures.ReturnTypes.PanData
 * @memberof module:gestures
 */
class Pan extends Gesture {
  /**
   * @param {Object} [options]
   * @param {string} [options.muteKey=undefined] - If this key is pressed, this
   *    gesture will be muted (i.e. not recognized). One of 'altKey', 'ctrlKey',
   *    'shiftKey', or 'metaKey'.
   */
  constructor(options = {}) {
    super('pan');

    /**
     * Don't emit any data if this key is pressed.
     *
     * @type {string}
     */
    this.muteKey = options.muteKey;
  }

  /**
   * Resets the gesture's progress by saving the current centroid of the active
   * inputs. To be called whenever the number of inputs changes.
   *
   * @param {module:gestures.State} state - The state object received by a hook.
   */
  initialize(state) {
    const progress = state.active[0].getProgressOfGesture(this.id);
    progress.lastEmitted = state.centroid;
  }

  /**
   * Event hook for the start of a Pan. Records the current centroid of
   * the inputs.
   *
   * @param {module:gestures.State} state - current input state.
   */
  start(state) {
    if (state.active.length >= REQUIRED_INPUTS) {
      this.initialize(state);
    }
  }

  /**
   * Event hook for the move of a Pan.
   *
   * @param {module:gestures.State} state - current input state.
   * @return {?module:gestures.ReturnTypes.PanData} <tt>null</tt> if the gesture
   * was muted or otherwise not recognized.
   */
  move(state) {
    if (state.active.length < REQUIRED_INPUTS) return null;
    if (this.muteKey && state.event[this.muteKey]) {
      this.initialize(state);
      return null;
    }

    const progress = state.active[0].getProgressOfGesture(this.id);
    const point = state.centroid;
    // const change = point.minus(state.previousCentroid);
    const change = point.minus(progress.lastEmitted);
    progress.lastEmitted = point;

    return { change, point };
  }

  /**
   * Event hook for the end of a Pan. Records the current centroid of
   * the inputs.
   *
   * @param {module:gestures.State} state - current input state.
   */
  end(state) {
    if (state.active.length >= REQUIRED_INPUTS) {
      this.initialize(state);
    }
  }
}

module.exports = Pan;

