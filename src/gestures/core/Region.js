/*
 * Contains the {@link Region} class
 */

'use strict';

const Binding = require('./Binding.js');
const State   = require('./State.js');
const PHASE   = require('./PHASE.js');

/**
 * Allows the user to specify the control region which will listen for user
 * input events.
 *
 * @memberof module:gestures
 */
class Region {
  /**
   * Constructor function for the Region class.
   */
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
  }

  /**
   * All input events flow through this function. It makes sure that the input
   * state is maintained, determines which bindings to analyze based on the
   * initial position of the inputs, calls the relevant gesture hooks, and
   * dispatches gesture data.
   *
   * @param {PointerEvent} event - The event received from a client.
   */
  arbitrate(event) {
    this.state.updateAllInputs(event);

    this.bindings.forEach(binding => {
      binding.evaluateHook(PHASE[event.type], this.state);
    });

    this.state.clearEndedInputs();
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
}

module.exports = Region;

