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
 * @property {module:gestures.Point2D} translation - The change vector from the
 * last emit.
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

    /**
     * The previous point location.
     *
     * @type {module:gestures.Point2D}
     */
    this.previous = null;
  }

  /**
   * Resets the gesture's progress by saving the current centroid of the active
   * inputs. To be called whenever the number of inputs changes.
   *
   * @param {module:gestures.State} state - The state object received by a hook.
   */
  refresh(state) {
    if (state.active.length >= REQUIRED_INPUTS) {
      this.previous = state.centroid;
    }
  }

  /**
   * Event hook for the start of a Pan. Records the current centroid of
   * the inputs.
   *
   * @param {module:gestures.State} state - current input state.
   */
  start(state) {
    this.refresh(state);
  }

  /**
   * Event hook for the move of a Pan.
   *
   * @param {module:gestures.State} state - current input state.
   * @return {?module:gestures.ReturnTypes.PanData} <tt>null</tt> if the gesture
   * was muted or otherwise not recognized.
   */
  move(state) {
    if (state.active.length < REQUIRED_INPUTS) {
      return null;
    }

    if (this.muteKey && state.event[this.muteKey]) {
      this.refresh(state);
      return null;
    }

    const point = state.centroid;
    const translation = point.minus(this.previous);
    this.previous = point;

    return { translation, point };
  }

  /**
   * Event hook for the end of a Pan. Records the current centroid of
   * the inputs.
   *
   * @param {module:gestures.State} state - current input state.
   */
  end(state) {
    this.refresh(state);
  }

  /**
   * Event hook for the cancel of a Pan. Resets the current centroid of
   * the inputs.
   *
   * @param {module:gestures.State} state - current input state.
   */
  cancel(state) {
    this.refresh(state);
  }
}

module.exports = Pan;

