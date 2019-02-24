/*
 * Contains the Rotate class.
 */

'use strict';

const Gesture = require('../core/Gesture.js');

const REQUIRED_INPUTS = 1;
const defaults = Object.freeze({
  deadzoneRadius: 10,
});

/**
 * Data returned when a Swivel is recognized.
 *
 * @typedef {Object} SwivelData
 * @mixes module:gestures.ReturnTypes.BaseData
 *
 * @property {number} delta - In radians, the change in angle since last emit.
 * @property {module:gestures.Point2D} pivot - The pivot point.
 * @property {module:gestures.Point2D} point - The current location of the input
 * point.
 *
 * @memberof module:gestures.ReturnTypes
 */

/**
 * A Swivel is a single input rotating around a fixed point. The fixed point is
 * determined by the input's location at its 'start' phase.
 *
 * @extends module:gestures.Gesture
 * @see module:gestures.ReturnTypes.SwivelData
 * @memberof module:gestures
 */
class Swivel extends Gesture {
  /**
   * Constructor for the Swivel class.
   *
   * @param {Object} [options]
   * @param {number} [options.deadzoneRadius=10] - The radius in pixels around
   *    the start point in which to do nothing.
   * @param {string} [options.enableKey=undefined] - One of 'altKey', 'ctrlKey',
   *    'metaKey', or 'shiftKey'. If set, gesture will only be recognized while
   *    this key is down.
   */
  constructor(options = {}) {
    super('swivel');

    /**
     * The radius around the start point in which to do nothing.
     *
     * @type {number}
     */
    this.deadzoneRadius = options.deadzoneRadius || defaults.deadzoneRadius;

    /**
     * If this is set, gesture will only respond to events where this property
     * is truthy. Should be one of 'ctrlKey', 'altKey', or 'shiftKey'.
     *
     * @type {string}
     */
    this.enableKey = options.enableKey;
  }

  /**
   * Returns whether this gesture is currently enabled.
   *
   * @param {Event} event - The state's current input event.
   *
   * @return {boolean} true if the gesture is enabled, false otherwise.
   */
  enabled(event) {
    return !this.enableKey || event[this.enableKey];
  }

  /**
   * Restart the given progress object using the given input object.
   *
   * @param {Object} progress - Progress object to restart.
   * @param {Input} input - Input object to use for restarting progress.
   */
  restart(progress, input) {
    progress.active = true;
    progress.pivot = input.current.point;
    progress.previousAngle = 0;
  }

  /**
   * Event hook for the start of a Swivel gesture.
   *
   * @param {module:gestures.State} state - current input state.
   */
  start(state) {
    const started = state.getInputsInPhase('start');
    if (started.length === REQUIRED_INPUTS && this.enabled(state.event)) {
      this.restart(started[0].getProgressOfGesture(this.id), started[0]);
    }
  }

  /**
   * Determine the data to emit. To be called once valid state for a swivel has
   * been assured, except for deadzone.
   *
   * @param {Object} progress - Progress object to restart.
   * @param {Input} input - Input object to use for restarting progress.
   */
  calculateOutput(progress, input) {
    const point = input.current.point;
    const pivot = progress.pivot;
    const angle = pivot.angleTo(point);
    const delta = angle - progress.previousAngle;
    progress.previousAngle = angle;

    if (pivot.distanceTo(point) > this.deadzoneRadius) {
      return { delta, pivot, point };
    }
    return null;
  }

  /**
   * Event hook for the move of a Swivel gesture.
   *
   * @param {module:gestures.State} state - current input state.
   *
   * @return {?module:gestures.ReturnTypes.SwivelData} <tt>null</tt> if the
   * gesture is not recognized.
   */
  move(state) {
    if (state.active.length !== REQUIRED_INPUTS) return null;

    const input = state.active[0];
    const progress = input.getProgressOfGesture(this.id);
    let output = null;

    if (this.enabled(state.event)) {
      if (progress.active) {
        output = this.calculateOutput(progress, input);
      } else {
        // The enableKey was just pressed again.
        this.restart(progress, input);
      }
    } else {
      // The enableKey was released, therefore pivot point is now invalid.
      progress.active = false;
    }

    return output;
  }

  /**
   * Event hook for the end of a Swivel.
   *
   * @param {module:gestures.State} state - current input state.
   *
   * @return {?module:gestures.ReturnTypes.SwivelData} <tt>null</tt> if the
   * gesture is not recognized.
   */
  end(state) {
    const active = state.active;
    if (active.length === REQUIRED_INPUTS && this.enabled(state.event)) {
      this.restart(active[0].getProgressOfGesture(this.id), active[0]);
    }
  }
}

module.exports = Swivel;
