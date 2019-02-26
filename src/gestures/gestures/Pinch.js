/*
 * Contains the abstract Pinch class.
 */

'use strict';

const Gesture = require('../core/Gesture.js');

const DEFAULT_MIN_INPUTS = 2;

/**
 * Data returned when a Pinch is recognized.
 *
 * @typedef {Object} PinchData
 * @mixes module:gestures.ReturnTypes.BaseData
 *
 * @property {number} distance - The average distance from an active input to
 *    the centroid.
 * @property {number} change - The change in distance since last emit.
 * @property {module:gestures.Point2D} midpoint - The centroid of the currently
 * active points.
 *
 * @memberof module:gestures.ReturnTypes
 */

/**
 * A Pinch is defined as two or more inputs moving either together or apart.
 *
 * @extends module:gestures.Gesture
 * @see module:gestures.ReturnTypes.PinchData
 * @memberof module:gestures
 */
class Pinch extends Gesture {
  /**
   * Constructor function for the Pinch class.
   *
   * @param {Object} [options]
   * @param {number} [options.minInputs=2] The minimum number of inputs that
   *    must be active for a Pinch to be recognized.
   */
  constructor(options = {}) {
    super('pinch');

    /**
     * The minimum number of inputs that must be active for a Pinch to be
     * recognized.
     *
     * @type {number}
     */
    this.minInputs = options.minInputs || DEFAULT_MIN_INPUTS;
  }

  /**
   * Initializes the gesture progress and stores it in the first input for
   * reference events.
   *
   * @param {module:gestures.State} state - current input state.
   */
  initializeProgress(state) {
    const distance = state.physicalCentroid
      .averageDistanceTo(state.physicalPoints);
    // const distance = state.centroid.averageDistanceTo(state.activePoints);
    const progress = state.active[0].getProgressOfGesture(this.id);
    progress.previousDistance = distance;
    // console.log(`INITIAL: ${distance}`);
  }

  /**
   * Event hook for the start of a Pinch.
   *
   * @param {module:gestures.State} state - current input state.
   */
  start(state) {
    if (state.active.length >= this.minInputs) {
      this.initializeProgress(state);
    }
  }

  /**
   * Event hook for the move of a Pinch.
   *
   * @param {module:gestures.State} state - current input state.
   * @return {?module:gestures.ReturnTypes.PinchData} <tt>null</tt> if not
   * recognized.
   */
  move(state) {
    if (state.active.length < this.minInputs) return null;

    const distance = state.physicalCentroid
      .averageDistanceTo(state.physicalPoints);
    // const distance = state.centroid.averageDistanceTo(state.activePoints);
    // console.log(`EMITTED: ${distance}`);
    const progress = state.active[0].getProgressOfGesture(this.id);
    const change = distance / progress.previousDistance;
    // console.log(`CHANGE: ${change}`);
    progress.previousDistance = distance;

    return {
      distance,
      midpoint: state.centroid,
      change,
    };
  }

  /**
   * Event hook for the end of a Pinch.
   *
   * @param {module:gestures.State} input status object
   */
  end(state) {
    if (state.active.length >= this.minInputs) {
      this.initializeProgress(state);
    }
  }
}

module.exports = Pinch;

