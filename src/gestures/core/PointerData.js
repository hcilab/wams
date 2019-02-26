/*
 * Contains the {@link PointerData} class
 */

'use strict';

const Point2D = require('./Point2D.js');
const PHASE   = require('./PHASE.js');

/**
 * Low-level storage of pointer data based on incoming data from an interaction
 * event.
 *
 * @memberof module:gestures
 */
class PointerData {
  /**
   * @constructor
   *
   * @param {PointerEvent} event - The event object being wrapped.
   */
  constructor(event) {
    /**
     * The original event object.
     *
     * @type {PointerEvent}
     */
    this.originalEvent = event;

    /**
     * The type or 'phase' of this batch of pointer data. 'start' or 'move' or
     * 'end'.
     *
     * @type {string}
     */
    this.type = PHASE[event.type];

    /**
     * The timestamp of the event in milliseconds elapsed since January 1, 1970,
     * 00:00:00 UTC.
     *
     * @type {number}
     */
    this.time = Date.now();

    /**
     * The (x,y) coordinate of the event, wrapped in a Point2D.
     *
     * @type {module:gestures.Point2D}
     */
    this.point = new Point2D(event.clientX, event.clientY);

    /**
     * The (x,y) physical coordinate of the event, wrapped in a Point2D.
     *
     * @type {module:gestures.Point2D}
     */
    this.physical = new Point2D(event.physX, event.physY);
  }

  /**
   * Calculates the angle between this event and the given event.
   *
   * @param {module:gestures.PointerData} pdata
   *
   * @return {number} Radians measurement between this event and the given
   *    event's points.
   */
  angleTo(pdata) {
    return this.point.angleTo(pdata.point);
  }

  /**
   * Calculates the distance between two PointerDatas.
   *
   * @param {module:gestures.PointerData} pdata
   *
   * @return {number} The distance between the two points, a.k.a. the
   *    hypoteneuse.
   */
  distanceTo(pdata) {
    return this.point.distanceTo(pdata.point);
  }
}

module.exports = PointerData;

