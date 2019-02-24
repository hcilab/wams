/*
 * Contains the Track class.
 */

'use strict';

const Gesture = require('../core/Gesture.js');

/**
 * Data returned when a Track is recognized.
 *
 * @typedef {Object} TrackData
 * @mixes module:gestures.ReturnTypes.BaseData
 *
 * @property {module:gestures.Point2D[]} active - Points currently in 'start' or
 *    'move' phase.
 * @property {module:gestures.Point2D} centroid - centroid of currently active
 * points.
 *
 * @memberof module:gestures.ReturnTypes
 */

/**
 * A Track gesture forwards a list of active points and their centroid on each
 * of the selected phases.
 *
 * @extends module:gestures.Gesture
 * @see module:gestures.ReturnTypes.TrackData
 * @memberof module:gestures
 */
class Track extends Gesture {
  /**
   * Constructor for the Track class.
   *
   * @param {string[]} [phases=[]] Phases to recognize. Entries can be any or
   *    all of 'start', 'move', and 'end'.
   */
  constructor(phases = []) {
    super('track');
    this.trackStart = phases.includes('start');
    this.trackMove  = phases.includes('move');
    this.trackEnd   = phases.includes('end');
  }

  /**
   * Unpacks the state and returns a slimmed down object for emitting.
   *
   * @param {module:gestures.State} state - current input state.
   * @return {module:gestures.ReturnTypes.TrackData}
   */
  data({ activePoints, centroid }) {
    return { active: activePoints, centroid };
  }

  /**
   * Event hook for the start of a Track gesture.
   *
   * @param {module:gestures.State} state - current input state.
   * @return {?module:gestures.ReturnTypes.TrackData} <tt>null</tt> if not
   * recognized.
   */
  start(state) {
    return this.trackStart ? this.data(state) : null;
  }

  /**
   * Event hook for the move of a Track gesture.
   *
   * @param {module:gestures.State} state - current input state.
   * @return {?module:gestures.ReturnTypes.TrackData} <tt>null</tt> if not
   * recognized.
   */
  move(state) {
    return this.trackMove ? this.data(state) : null;
  }

  /**
   * Event hook for the end of a Track gesture.
   *
   * @param {module:gestures.State} state - current input state.
   * @return {?module:gestures.ReturnTypes.TrackData} <tt>null</tt> if not
   * recognized.
   */
  end(state) {
    return this.trackEnd ? this.data(state) : null;
  }
}

module.exports = Track;

