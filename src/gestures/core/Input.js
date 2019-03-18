/*
 * Contains the {@link Input} class
 */

'use strict';

const PointerData = require('./PointerData.js');

/**
 * Tracks a single input and contains information about the current, previous,
 * and initial events. Contains the progress of each Input and its associated
 * gestures.
 *
 * @memberof module:gestures
 */
class Input {
  /**
   * Constructor function for the Input class.
   *
   * @param {TouchEvent} event - The input event which will initialize this
   *    Input object.
   * @param {Touch} touch - The touch point data.
   * @param {string} identifier - The identifier for this input, so that it can
   *    be located in subsequent Event objects.
   */
  constructor(event, touch, identifier) {
    const currentData = new PointerData(event, touch);

    /**
     * Holds the initial data from the mousedown / touchstart / pointerdown that
     * began this input.
     *
     * @type {module:gestures.PointerData}
     */
    this.initial = currentData;

    /**
     * Holds the most current pointer data for this Input.
     *
     * @type {module:gestures.PointerData}
     */
    this.current = currentData;

    /**
     * Holds the previous pointer data for this Input.
     *
     * @type {module:gestures.PointerData}
     */
    this.previous = currentData;

    /**
     * The identifier for the pointer / touch / mouse button associated with
     * this input.
     *
     * @type {number}
     */
    this.identifier = identifier;

    /**
     * Stores internal state between events for each gesture based off of the
     * gesture's id.
     *
     * @type {Object}
     */
    this.progress = {};

    /**
     * The id of the source view for this input.
     *
     * @type {number}
     */
    this.source = event.source;
  }

  /**
   * The phase of the input: 'start' or 'move' or 'end'
   *
   * @type {string}
   */
  get phase() { return this.current.type; }

  /**
   * The timestamp of the initiating event for this input.
   *
   * @type {number}
   */
  get startTime() { return this.initial.time; }

  /**
   * @param {string} id - The ID of the gesture whose progress is sought.
   *
   * @return {Object} The progress of the gesture.
   */
  getProgressOfGesture(id) {
    if (!this.progress[id]) {
      this.progress[id] = {};
    }
    return this.progress[id];
  }

  /**
   * @return {number} The distance between the initiating event for this input
   *    and its current event.
   */
  totalDistance() {
    return this.initial.distanceTo(this.current);
  }

  /**
   * Saves the given raw event in PointerData form as the current data for this
   * input, pushing the old current data into the previous slot, and tossing
   * out the old previous data.
   *
   * @param {TouchEvent} event - The event object to wrap with a PointerData.
   * @param {Touch} touch - The touch point data.
   */
  update(event, touch) {
    this.previous = this.current;
    this.current = new PointerData(event, touch);
  }
}

module.exports = Input;

