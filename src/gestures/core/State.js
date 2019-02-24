/*
 * Contains the {@link State} class
 */

'use strict';

const Input   = require('./Input.js');
const PHASE   = require('./PHASE.js');
const Point2D = require('./Point2D.js');

const symbols = Object.freeze({
  inputs: Symbol.for('inputs'),
});

/**
 * Set of helper functions for updating inputs based on type of input.
 * Must be called with a bound 'this', via bind(), or call(), or apply().
 *
 * @inner
 * @memberof module:gestures.State
 */
// const update_fns = {
//   TouchEvent: function TouchEvent(event) {
//     Array.from(event.changedTouches).forEach(touch => {
//       this.updateInput(event, touch.identifier);
//     });
//   },

//   PointerEvent: function PointerEvent(event) {
//     this.updateInput(event, event.pointerId);
//   },

//   MouseEvent: function MouseEvent(event) {
//     if (event.button === 0) {
//       this.updateInput(event, event.button);
//     }
//   },
// };

/**
 * Keeps track of currently active and ending input points on the interactive
 * surface.
 *
 * @memberof module:gestures
 */
class State {
  /**
   * Constructor for the State class.
   */
  constructor() {
    /**
     * Keeps track of the current Input objects.
     *
     * @type {Map}
     */
    this[symbols.inputs] = new Map();

    /**
     * All currently valid inputs, including those that have ended.
     *
     * @type {Input[]}
     */
    this.inputs = [];

    /**
     * The array of currently active inputs, sourced from the current Input
     * objects. "Active" is defined as not being in the 'end' phase.
     *
     * @type {Input[]}
     */
    this.active = [];

    /**
     * The array of latest point data for the currently active inputs, sourced
     * from this.active.
     *
     * @type {module:gestures.Point2D[]}
     */
    this.activePoints = [];

    /**
     * The centroid of the currently active points.
     *
     * @type {module:gestures.Point2D}
     */
    this.centroid = {};

    /**
     * The latest event that the state processed.
     *
     * @type {PointerEvent}
     */
    this.event = null;
  }

  /**
   * Deletes all inputs that are in the 'end' phase.
   */
  clearEndedInputs() {
    this[symbols.inputs].forEach((v, k) => {
      if (v.phase === 'end') this[symbols.inputs].delete(k);
    });
  }

  /**
   * @param {string} phase - One of 'start', 'move', or 'end'.
   *
   * @return {module:gestures.Input[]} Inputs in the given phase.
   */
  getInputsInPhase(phase) {
    return this.inputs.filter(i => i.phase === phase);
  }

  /**
   * @param {string} phase - One of 'start', 'move', or 'end'.
   *
   * @return {module:gestures.Input[]} Inputs <b>not</b> in the given phase.
   */
  getInputsNotInPhase(phase) {
    return this.inputs.filter(i => i.phase !== phase);
  }

  /**
   * @return {boolean} True if there are no active inputs. False otherwise.
   */
  hasNoActiveInputs() {
    return this[symbols.inputs].size === 0;
  }

  /**
   * Update the input with the given identifier using the given event.
   *
   * @param {PointerEvent} event - The event being captured.
   * @param {string} identifier - The identifier of the input to update.
   */
  updateInput(event, identifier) {
    if (PHASE[event.type] === 'start') {
      this[symbols.inputs].set(identifier, new Input(event, identifier));
    } else if (this[symbols.inputs].has(identifier)) {
      this[symbols.inputs].get(identifier).update(event);
    }
  }

  /**
   * Updates the inputs with new information based upon a new event being fired.
   *
   * @param {PointerEvent} event - The event being captured.
   */
  updateAllInputs(event) {
    // update_fns[event.constructor.name].call(this, event);
    this.updateInput(event, event.pointerId);
    this.inputs = Array.from(this[symbols.inputs].values());
    this.active = this.getInputsNotInPhase('end');
    this.activePoints = this.active.map(i => i.current.point);
    this.centroid = Point2D.midpoint(this.activePoints);
    this.event = event;
  }
}

module.exports = State;

