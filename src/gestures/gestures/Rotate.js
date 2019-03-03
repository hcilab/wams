/*
 * Contains the Rotate class.
 */

'use strict';

const Gesture = require('../core/Gesture.js');

const REQUIRED_INPUTS = 2;

/**
 * Data returned when a Rotate is recognized.
 *
 * @typedef {Object} RotateData
 * @mixes module:gestures.ReturnTypes.BaseData
 *
 * @property {number} delta - In radians, the change in angle since last emit.
 * @property {module:gestures.Point2D} pivot - The centroid of the currently
 * active points.
 *
 * @memberof module:gestures.ReturnTypes
 */

const PI2 = 2 * Math.PI;

/**
 * Helper function to regulate angular differences, so they don't jump from 0 to
 * 2*PI or vice versa.
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
   * Constructor function for the Rotate class.
   */
  constructor() {
    super('rotate');
  }

  /**
   * Store individual angle progress on each input, return average angle change.
   *
   * @param {module:gestures.State} state - current input state.
   */
  getAngle(state) {
    if (state.active.length < REQUIRED_INPUTS) return null;

    let angle = 0;
    state.active.forEach(i => {
      const progress = i.getProgressOfGesture(this.id);
      const currentAngle = state.centroid.angleTo(i.current.point);
      angle += angularMinus(currentAngle, progress.previousAngle);
      progress.previousAngle = currentAngle;
    });
    angle /= (state.active.length);
    return angle;
  }

  /**
   * Event hook for the start of a gesture.
   *
   * @param {module:gestures.State} state - current input state.
   */
  start(state) {
    this.getAngle(state);
  }

  /**
   * Event hook for the move of a Rotate gesture.
   *
   * @param {module:gestures.State} state - current input state.
   * @return {?module:gestures.ReturnTypes.RotateData} <tt>null</tt> if this
   * event did not occur
   */
  move(state) {
    const delta = this.getAngle(state);
    return delta ? { pivot: state.centroid, delta } : null;
  }

  /**
   * Event hook for the end of a gesture.
   *
   * @param {module:gestures.State} state - current input state.
   */
  end(state) {
    this.getAngle(state);
  }

  /**
   * Event hook for the cancel of a gesture.
   *
   * @param {module:gestures.State} state - current input state.
   */
  cancel(state) {
    this.getAngle(state);
  }
}

module.exports = Rotate;

