/*
 * Contains the Rotate class.
 */

'use strict';

const Gesture = require('../core/Gesture.js');

/**
 * Data returned when a Rotate is recognized.
 *
 * @typedef {Object} RotateData
 * @mixes module:gestures.ReturnTypes.BaseData
 *
 * @property {number} rotation - In radians, the change in angle since last
 * emit.
 * @property {module:gestures.Point2D} pivot - The centroid of the
 * currently active points.
 *
 * @memberof module:gestures.ReturnTypes
 */

const PI2 = 2 * Math.PI;

/**
 * Helper function to regulate angular differences, so they don't jump from 0 to
 * 2*PI or vice versa.
 *
 * @inner
 * @memberof module:gestures.Rotate
 *
 * @param {number} a - Angle in radians.
 * @param {number} b - Angle in radians.
 * @return {number} c, given by: c = a - b such that || < PI
 */
function angularMinus(a, b = 0) {
  let diff = a - b;
  if (diff < -Math.PI) {
    diff += PI2;
  } else if (diff > Math.PI) {
    diff -= PI2;
  }
  return diff;
}

/**
 * A Rotate is defined as two inputs moving with a changing angle between them.
 *
 * @extends module:gestures.Gesture
 * @see module:gestures.ReturnTypes.RotateData
 * @memberof module:gestures
 */
class Rotate extends Gesture {
  /**
   * @param {Object} [options]
   * @param {number} [options.minInputs=2] The minimum number of inputs that
   * must be active for a Rotate to be recognized.
   * @param {boolean} [options.smoothing=true] Whether to apply smoothing to
   * emitted data.
   */
  constructor(options = {}) {
    super('rotate');
    const settings = { ...Rotate.DEFAULTS, ...options };

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
     * Track the previously emitted rotation angle.
     *
     * @type {number[]}
     */
    this.previousAngles = [];

    /**
     * Stage the emitted data once.
     *
     * @type {module:gestures.ReturnTypes.RotateData}
     */
    this.stagedEmit = null;
  }

  /**
   * Store individual angle progress on each input, return average angle change.
   *
   * @param {module:gestures.State} state - current input state.
   */
  getAngle(state) {
    if (state.active.length < this.minInputs) return null;

    let angle = 0;
    const stagedAngles = [];

    state.active.forEach((input, idx) => {
      const currentAngle = state.centroid.angleTo(input.current.point);
      angle += angularMinus(currentAngle, this.previousAngles[idx]);
      stagedAngles[idx] = currentAngle;
    });

    angle /= (state.active.length);
    this.previousAngles = stagedAngles;
    return angle;
  }

  /**
   * Restart the gesture;
   *
   * @param {State} state - current input state.
   */
  restart(state) {
    this.previousAngles = [];
    this.stagedEmit = null;
    this.getAngle(state);
  }

  /**
   * Event hook for the start of a gesture.
   *
   * @param {module:gestures.State} state - current input state.
   */
  start(state) {
    this.restart(state);
  }

  /**
   * Event hook for the move of a Rotate gesture.
   *
   * @param {module:gestures.State} state - current input state.
   * @return {?module:gestures.ReturnTypes.RotateData} <tt>null</tt> if this
   * event did not occur
   */
  move(state) {
    const rotation = this.getAngle(state);
    if (rotation) {
      return this.emit({ rotation });
    }
    return null;
  }

  /**
   * Event hook for the end of a gesture.
   *
   * @param {module:gestures.State} state - current input state.
   */
  end(state) {
    this.restart(state);
  }

  /**
   * Event hook for the cancel of a gesture.
   *
   * @param {module:gestures.State} state - current input state.
   */
  cancel(state) {
    this.restart(state);
  }

  /**
   * Smooth out the outgoing data.
   *
   * @param {module:gestures.ReturnTypes.RotateData} next
   *
   * @return {?module:gestures.ReturnTypes.RotateData}
   */
  smooth(next) {
    let result = null;

    if (this.stagedEmit) {
      result = this.stagedEmit;
      const avg = (result.rotation + next.rotation) / 2;
      result.rotation = avg;
      next.rotation = avg;
    }

    this.stagedEmit = next;
    return result;
  }
}

Rotate.DEFAULTS = Object.freeze({
  minInputs: 2,
  smoothing: true,
});

module.exports = Rotate;

