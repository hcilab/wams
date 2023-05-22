'use strict';

const Input = require('./Input.js');
const PHASE = require('./PHASE.js');
const { Point2D } = require('westures');

const symbols = Object.freeze({
  inputs: Symbol.for('inputs'),
});

/**
 * Filter out elements of struct that satisfy the given predicate.
 *
 * @inner
 * @memberof module:gestures.State
 *
 * @param {Map.<*>} struct - Actually any container object that has a 'forEach'
 * method using a callback that takes (value, key) as its first arguments, and
 * which as a delete(key) method.
 * @param {function} predicate - Predicate function which accepts a single value
 * and returns true or false.
 */
function filterout(struct, predicate) {
  struct.forEach((v, k) => {
    if (predicate(v)) struct.delete(k);
  });
}

/**
 * The State class maintains the list of input points.
 *
 * @memberof module:gestures
 */
class State {
  constructor() {
    /**
     * Keeps track of the current Input objects.
     *
     * @type {Map.<module:gestures.Input>}
     */
    this[symbols.inputs] = new Map();

    /**
     * All currently valid inputs, including those that have ended.
     *
     * @type {module:gestures.Input[]}
     */
    this.inputs = [];

    /**
     * The array of currently active inputs, sourced from the current Input
     * objects. "Active" is defined as not being in the 'end' phase.
     *
     * @type {module:gestures.Input[]}
     */
    this.active = [];

    /**
     * The array of latest point data for the currently active inputs, sourced
     * from this.active.
     *
     * @type {module:westures.Point2D[]}
     */
    this.activePoints = [];

    /**
     * The centroid of the currently active points.
     *
     * @type {module:westures.Point2D}
     */
    this.centroid = new Point2D();

    /**
     * The latest event that the state processed.
     *
     * @type {TouchEvent}
     */
    this.event = null;
  }

  /**
   * Deletes all inputs that are in the 'end' phase.
   */
  clearEndedInputs() {
    filterout(this[symbols.inputs], (v) => v.phase === 'end');
  }

  /**
   * Deletes all inputs originating from the view with the given id.
   *
   * @param {number} id - The id of the source view.
   */
  clearInputsFromSource(id) {
    filterout(this[symbols.inputs], (v) => v.source === id);
  }

  /**
   * @param {string} phase - One of 'start', 'move', or 'end'.
   *
   * @return {module:gestures.Input[]} Inputs in the given phase.
   */
  getInputsInPhase(phase) {
    return this.inputs.filter((i) => i.phase === phase);
  }

  /**
   * @param {string} phase - One of 'start', 'move', or 'end'.
   *
   * @return {module:gestures.Input[]} Inputs <b>not</b> in the given phase.
   */
  getInputsNotInPhase(phase) {
    return this.inputs.filter((i) => i.phase !== phase);
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
   */
  updateInput(event) {
    const id = event.pointerId;
    if (PHASE[event.type] === 'start') {
      this[symbols.inputs].set(id, new Input(event, id));
    } else if (this[symbols.inputs].has(id)) {
      this[symbols.inputs].get(id).update(event);
    }
  }

  /**
   * Updates the inputs with new information based upon a new event being fired.
   *
   * @param {PointerEvent} event - The event being captured.
   */
  updateAllInputs(event) {
    this.updateInput(event);
    this.event = event;
    this.updateFields();
  }

  /**
   * Updates the convenience fields.
   */
  updateFields() {
    this.inputs = Array.from(this[symbols.inputs].values());
    this.active = this.getInputsNotInPhase('end');
    this.activePoints = this.active.map((i) => i.current.point);
    this.centroid = Point2D.centroid(this.activePoints) || new Point2D();
  }
}

module.exports = State;
