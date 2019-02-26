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

const { safeRemoveById } = require('../shared.js');
const ServerView = require('./ServerView.js');

/**
 * The ServerViewGroup groups a number of ServerViews together into a single
 * View, so that they can move together as one block.
 *
 * @memberof module:server
 * @extends module:server.ServerView
 */
class ServerViewGroup extends ServerView {
  /**
   * @param {Object} [ values ] - Object with user supplied values describing
   * the view.
   *
   * @see {@link module:shared.View}
   */
  constructor() {
    /*
     * Not supplying any values, as the default x, y, scale, and rotation values
     * are the ones that we want.
     */
    super();

    /**
     * The views belonging to this group.
     *
     * @type {module:server.ServerView[]}
     */
    this.views = [];

    /**
     * The gesture controller for this group.
     *
     * @type {module:server.GestureController}
     */
    this.gestureController = null;
  }

  /**
   * Throws a bad operation ReferenceError.
   *
   * @throws ReferenceError.
   */
  badGroupOp() {
    throw new ReferenceError('Invalid operation for groups.');
  }

  /**
   * Disallow bottomLeft getter.
   *
   * @override
   * @throws ReferenceError
   */
  get bottomLeft() { return this.badGroupOp(); }

  /**
   * Disallow bottomRight getter.
   *
   * @override
   * @throws ReferenceError
   */
  get bottomRight() { return this.badGroupOp(); }

  /**
   * Disallow topLeft getter.
   *
   * @override
   * @throws ReferenceError
   */
  get topLeft() { return this.badGroupOp(); }

  /**
   * Disallow topRight getter.
   *
   * @override
   * @throws ReferenceError
   */
  get topRight() { return this.badGroupOp(); }


  /**
   * Add a view into the group.
   *
   * @param {module:server.ServerView} view - View to add to the group.
   */
  addView(view) {
    this.views.push(view);
  }

  /**
   * Move all the views by the given amounts.
   *
   * @override
   *
   * @param {number} [ dx=0 ] - Movement along the x axis.
   * @param {number} [ dy=0 ] - Movement along the y ayis.
   */
  moveBy(dx = 0, dy = 0) {
    this.views.forEach(v => v.moveBy(dx, dy));
    this.gestureController.centroid.add({ x: dx, y: dy });
    // console.log(`dx: ${dx}, dy: ${dy}`);
    this.gestureController.inputs.forEach(input => {
      // const p = input.current.physical;
      // console.log(`BEFORE: ${p.x}, ${p.y}`);
      input.current.physical.add({ x: dx, y: dy });
      // console.log(`AFTER: ${p.x}, ${p.y}`);
    });
  }

  /**
   * Disallow 'moveTo'
   *
   * @override
   * @throws ReferenceError
   */
  moveTo() {
    this.badGroupOp();
  }

  /**
   * Remove a view from the group.
   *
   * @param {module:server.ServerView} view - View to remove from the group.
   */
  removeView(view) {
    safeRemoveById(this.views, view, ServerView);
  }

  /**
   * Rotate all the views by the given amount, in radians.
   *
   * @override
   *
   * @param {number} [ radians=0 ] - The amount of rotation to apply to the
   * view, in radians.
   * @param {number} [ px=this.x ] - The x coordinate of the point around which
   * to rotate.
   * @param {number} [ py=this.y ] - The y coordinate of the point around which
   * to rotate.
   */
  rotateBy(radians = 0, px = this.x, py = this.y) {
    this.views.forEach(v => v.rotateBy(radians, px, py));
  }

  /**
   * Adjust the scale of all the views by the given amount.
   *
   * @override
   *
   * @param {number} [ ds=1 ] - Change in desired scale.
   * @param {number} [ mx=this.x ] - The x coordinate of the point around which
   * to scale.
   * @param {number} [ my=this.y ] - The y coordinate of the point around which
   * to scale.
   */
  scaleBy(ds = 1, mx = this.x, my = this.y) {
    this.views.forEach(v => v.scaleBy(ds, mx, my));
  }

  /**
   * Assigns a GestureController to this group.
   *
   * @param {module:server.GestureController} controller
   */
  setGestureController(controller) {
    this.gestureController = controller;
  }
}

module.exports = ServerViewGroup;

