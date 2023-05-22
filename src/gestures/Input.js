'use strict';

const PointerData = require('./PointerData.js');

/**
 * Tracks a single input and contains information about the current, previous,
 * and initial events. Also tracks the client from whom the input originates.
 *
 * @memberof module:gestures
 *
 * @param {PointerEvent} event - The input event which will initialize this Input
 * object.
 * @param {string} identifier - The identifier for this input, so that it can be
 * located in subsequent Event objects.
 */
class Input {
  constructor(event, identifier) {
    const currentData = new PointerData(event);

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
     * The identifier for the pointer associated with this input.
     *
     * @type {number}
     */
    this.identifier = identifier;

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
  get phase() {
    return this.current.phase;
  }

  /**
   * The timestamp of the initiating event for this input.
   *
   * @type {number}
   */
  get startTime() {
    return this.initial.time;
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
   * @param {PointerEvent} event - The event object to wrap with a PointerData.
   */
  update(event) {
    this.current = new PointerData(event);
  }
}

module.exports = Input;
