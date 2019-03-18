/*
 * Contains the abstract Pinch class.
 */

'use strict';

const Gesture = require('../core/Gesture.js');

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
   * must be active for a Pinch to be recognized.
   * @param {boolean} [options.smoothing=true] Whether to apply
   * smoothing to emitted data.
   */
  constructor(options = {}) {
    super('pinch');
    const settings = { ...Pinch.DEFAULTS, ...options };

    /**
     * The minimum number of inputs that must be active for a Pinch to be
     * recognized.
     *
     * @type {number}
     */
    this.minInputs = settings.minInputs;

    /**
     * The function through which emits are passed.
     *
     * @type {function}
     */

    this.emit = null;
    if (settings.smoothing) {
      this.emit = this.smooth.bind(this);
    } else {
      this.emit = data => data;
    }

    /**
     * The previous distance.
     *
     * @type {number}
     */
    this.previous = 0;

    /**
     * Stage the emitted data once if applying smoothing. This smoothing
     * technique delays the emitted data by one "move" event. The difference is
     * imperceptible to the human eye, and the fractional change that gets
     * tossed out at the end of the gesture is negligible. This allows for emits
     * that are about to get cancelled to out to not be emitted in the first
     * place, removing high-frequency jitter.
     *
     * @type {module:gestures.ReturnTypes.RotateData}
     */
    this.stagedEmit = null;
  }

  /**
   * Initializes the gesture progress and stores it in the first input for
   * reference events.
   *
   * @param {module:gestures.State} state - current input state.
   */
  restart(state) {
    if (state.active.length >= this.minInputs) {
      const distance = state.centroid.averageDistanceTo(state.activePoints);
      this.previous = distance;
    }
    this.stagedEmit = null;
  }

  /**
   * Event hook for the start of a Pinch.
   *
   * @param {module:gestures.State} state - current input state.
   */
  start(state) {
    this.restart(state);
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

    const midpoint = state.centroid;
    const distance = midpoint.averageDistanceTo(state.activePoints);
    const change = distance / this.previous;

    this.previous = distance;
    return this.emit({ distance, midpoint, change });
  }

  /**
   * Event hook for the end of a Pinch.
   *
   * @param {module:gestures.State} input status object
   */
  end(state) {
    this.restart(state);
  }

  /**
   * Event hook for the cancel of a Pinch.
   *
   * @param {module:gestures.State} input status object
   */
  cancel(state) {
    this.restart(state);
  }

  /**
   * Smooth out the outgoing data.
   *
   * @param {module:gestures.ReturnTypes.PinchData} next
   *
   * @return {?module:gestures.ReturnTypes.PinchData}
   */
  smooth(next) {
    let result = null;

    if (this.stagedEmit) {
      result = this.stagedEmit;
      const avg = (result.change + next.change) / 2;
      result.change = next.change = avg;
    }

    this.stagedEmit = next;
    return result;
  }
}

Pinch.DEFAULTS = Object.freeze({
  minInputs: 2,
  smoothing: true,
});

module.exports = Pinch;

