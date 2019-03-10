/*
 * Contains the {@link State} class
 */

'use strict';

const Input   = require('./Input.js');
const PHASE   = require('./PHASE.js');
const { Point2D } = require('../../shared.js');

const symbols = Object.freeze({
  inputs: Symbol.for('inputs'),
});

/**
 * Filter out elements of struct that satisfy the given predicate.
 *
 * @param {Map} struct - Actually any container object that has a 'forEach'
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
    filterout(this[symbols.inputs], v => v.phase === 'end');
  }

  /**
   * Deletes all inputs originating from the view with the given id.
   *
   * @param {number} id - The id of the source view.
   */
  clearInputsFromSource(id) {
    filterout(this[symbols.inputs], v => v.source === id);
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
    this.updateInput(event, event.pointerId);
    this.inputs = Array.from(this[symbols.inputs].values());
    this.active = this.getInputsNotInPhase('end');
    this.activePoints = this.active.map(i => i.current.point);
    this.centroid = Point2D.midpoint(this.activePoints) || {};
    this.event = event;
  }
}

module.exports = State;

