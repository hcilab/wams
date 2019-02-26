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

const { removeById, View } = require('../shared.js');
const { Locker, Lockable, Transformable2D } = require('../mixins.js');

/**
 * The ServerViewGroup groups a number of ServerViews together into a single
 * View, so that they can move together as one block.
 *
 * @memberof module:server
 * @extends module:server.View
 * @mixes module:mixins.Transformable2D
 * @mixes module:mixins.Lockable
 * @mixes module:mixins.Locker
 */
class ServerViewGroup extends Locker(Lockable(Transformable2D(View))) {
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
  }

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
  }

  /**
   * Disallow 'moveTo'
   *
   * @override
   * @throws ReferenceError
   */
  moveTo() {
    throw new ReferenceError('Invalid operation for groups.');
  }

  /**
   * Remove a view from the group.
   *
   * @param {module:server.ServerView} view - View to remove from the group.
   */
  removeView(view) {
    removeById(this.views, view);
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
}

/**
 * The default values for a ServerViewGroup.
 *
 * @type {object}
 */
ServerViewGroup.DEFAULTS = Object.freeze({
  x:        0,
  y:        0,
  width:    1600,
  height:   900,
  type:     'viewgroup',
  scale:    1,
  rotation: 0,
});

module.exports = ServerViewGroup;

