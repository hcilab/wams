/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 *
 * Original author: Jesse Rolheiser
 * Other revisions and supervision: Scott Bateman
 */

'use strict';

const Gestures = require('../gestures.js');

/**
 * The GestureController is in charge of processing server-side gestures for the
 * purpose of enabling multi-device gestures.
 *
 * @memberof module:server
 */
class GestureController {
  /**
   * @param {module:server.MessageHandler} messageHandler - For responding to
   * gestures.
   * @param {module:server.ServerViewGroup} group - The view group associated
   * with this controller.
   */
  constructor(messageHandler, group, workspace) {
    /**
     * The view group associated with this controller.
     *
     * @type {module:server.ServerViewGroup}
     */
    this.group = group;

    /**
     * For responding to gestures.
     *
     * @type {module:server.MessageHandler}
     */
    this.messageHandler = messageHandler;

    /**
     * This is a shared reference to the single principle WorkSpace. Think of it
     * like a 'parent' reference in a tree node.
     *
     * @type {module:server.WorkSpace}
     */
    this.workspace = workspace;

    /**
     * The "region" which takes care of gesture processing.
     *
     * @type {module:server.Gestures.Region}
     */
    this.region = new Gestures.Region();

    this.begin();
  }

  /**
   * The Gestures component uses Gesture objects, and expects those objects to
   * be bound to a handler for responding to that gesture. This method takes
   * care of those activities.
   */
  begin() {
    const pan     = new Gestures.Pan();
    const rotate  = new Gestures.Rotate();
    const pinch   = new Gestures.Pinch();
    const swipe   = new Gestures.Swipe();
    const tap     = new Gestures.Tap();
    const track   = new Gestures.Track(['start', 'end']);

    this.region.addGesture(pan,    this.handle('drag'));
    this.region.addGesture(tap,    this.handle('click'));
    this.region.addGesture(pinch,  this.handle('scale'));
    this.region.addGesture(rotate, this.handle('rotate'));
    this.region.addGesture(swipe,  this.handle('swipe'));
    this.region.addGesture(track,  this.handle('track'));
  }

  /**
   * Generates a function that handles the appropriate gesture and data.
   *
   * @param {string} message - name of a gesture to handle.
   *
   * @return {Function} Handler for westures that receives a data object and
   * handles it according to the given gesture name.
   */
  handle(message) {
    function do_handle(data) {
      this.messageHandler.handle(message, this.group, data);
    }
    return do_handle.bind(this);
  }

  /**
   * Processes a PointerEvent that has been forwarded from a client.
   *
   * @param {PointerEvent} event - The event from the client.
   */
  process(event) {
    this.region.arbitrate(event);
  }

  /**
   * Performs locking and unlocking based on the phase and number of active
   * points.
   *
   * @param {Object} data
   * @param {module:server.Point2D[]} data.active - Currently active contact
   * points.
   * @param {module:server.Point2D} data.centroid - Centroid of active contact
   * points.
   * @param {string} data.phase - 'start', 'move', or 'end', the gesture phase.
   */
  track({ active, centroid, phase }) {
    if (phase === 'start' && active.length === 1) {
      this.workspace.obtainLock(centroid.x, centroid.y, this.group);
    } else if (phase === 'end' && active.length === 0) {
      this.group.releaseLockedItem();
    }
  }
}

module.exports = GestureController;

