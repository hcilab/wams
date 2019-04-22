/*
 * Contains the Region class
 */

'use strict';

const Binding = require('./Binding.js');
const State   = require('./State.js');
const PHASE   = require('./PHASE.js');

const EVALUATION_RATE = 1000 / 60;

/**
 * The Region class is the entry point into the gestures module. It maintains
 * the list of active gestures and acts as a supervisor for all gesture
 * processes.
 *
 * @memberof module:gestures
 */
class Region {
  constructor() {
    /**
     * The list of relations between elements, their gestures, and the handlers.
     *
     * @type {module:gestures.Binding[]}
     */
    this.bindings = [];

    /**
     * The internal state object for a Region.  Keeps track of inputs.
     *
     * @type {module:gestures.State}
     */
    this.state = new State();

    /**
     * Whether an update to the state has occurred.
     *
     * @type {boolean}
     */
    this.hasUpdated = false;

    /**
     * The phase for the next update.
     *
     * @type {string}
     */
    this.nextUpdatePhase = null;

    setInterval(() => {
      if (this.hasUpdated) {
        this.evaluateBindings();
      }
    }, EVALUATION_RATE);
  }

  /**
   * Evaluate the active bindings for the current state and phase.
   */
  evaluateBindings() {
    this.bindings.forEach(binding => {
      binding.evaluateHook(this.nextUpdatePhase, this.state);
    });

    this.state.clearEndedInputs();
    this.hasUpdated = false;
    this.nextUpdatePhase = null;
  }

  /**
   * All input events flow through this function. It makes sure that the input
   * state is maintained, determines which bindings to analyze based on the
   * initial position of the inputs, calls the relevant gesture hooks, and
   * dispatches gesture data.
   *
   * @param {TouchEvent} event - The event received from a client.
   */
  arbitrate(event) {
    const phase = PHASE[event.type];
    if (this.nextUpdatePhase && phase !== this.nextUpdatePhase) {
      this.evaluateBindings();
    }

    this.state.updateAllInputs(event);
    this.nextUpdatePhase = phase;
    this.hasUpdated = true;
  }

  /**
   * Bind an element to a gesture with an associated handler.
   *
   * @param {Element} element - The element object.
   * @param {module:gestures.Gesture} gesture - Gesture type with which to bind.
   * @param {Function} handler - The function to execute when a gesture is
   *    recognized.
   */
  addGesture(gesture, handler) {
    this.bindings.push(new Binding(gesture, handler));
  }

  /**
   * Unbinds an element from either the specified gesture or all if no gesture
   * is specified.
   *
   * @param {Element} element - The element to unbind.
   * @param {module:gestures.Gesture} [ gesture ] - The gesture to unbind. If
   * undefined, will unbind all Bindings associated with the given element.
   */
  removeGestures(element, gesture) {
    this.getBindingsByElement(element).forEach(b => {
      if (gesture == null || b.gesture === gesture) {
        this.bindings.splice(this.bindings.indexOf(b), 1);
      }
    });
  }

  /**
   * Clears the view with the given id from the gesture state.
   *
   * @param {number} id - Id of source view to clear out.
   */
  clearInputsFromSource(id) {
    this.state.clearInputsFromSource(id);
    this.state.updateFields();
    this.nextUpdatePhase = 'cancel';
    this.evaluateBindings();
  }
}

module.exports = Region;

