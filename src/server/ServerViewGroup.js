'use strict';

const GestureController = require('./GestureController.js');
const ServerView = require('./ServerView.js');
const { removeById, View } = require('../shared.js');
const { Lockable, Transformable2D, Locker } = require('../mixins.js');

/**
 * The ServerViewGroup groups a number of ServerViews together into a single
 * View, so that they can move together as one block.
 *
 * @memberof module:server
 * @extends module:server.View
 * @mixes module:mixins.Locker
 * @mixes module:mixins.Lockable
 * @mixes module:mixins.Transformable2D
 *
 * @param {module:server.MessageHandler} messageHandler - For responding to
 * messages from clients.
 */
class ServerViewGroup extends Locker(Lockable(Transformable2D(View))) {
  constructor(messageHandler) {
    super();

    /**
     * Controls server-side gestures.
     *
     * @type {module:server.GestureController}
     */
    this.gestureController = new GestureController(messageHandler, this);

    /**
     * The views belonging to this group.
     *
     * @type {module:server.ServerView[]}
     */
    this.views = [];
  }

  /**
   * Clear the inputs associated with the given view from the gesture
   * controller.
   *
   * @param {number} id - Id of the view whose inputs should be cleared.
   */
  clearInputsFromView(id) {
    // FIXME TODO: reinstate support for server-side gestures
    // this.gestureController.clearOutView(id);
  }

  /*
   * Move all the views by the given amounts.
   *
   * @override
   *
   * @param {number} [ dx=0 ] - Movement along the x axis.
   * @param {number} [ dy=0 ] - Movement along the y ayis.
   */
  moveBy(dx = 0, dy = 0) {
    super.moveBy(-dx, -dy);
    this.views.forEach((v) => v.moveBy(dx, dy));
  }

  /**
   * Remove a view from the group.
   *
   * @param {module:server.ServerView} view - View to remove from the group.
   */
  removeView(view) {
    removeById(this.views, view);
    // FIXME TODO: reinstate support for server-side gestures
    // this.clearInputsFromView(view.id);
  }

  /**
   * @return {module:shared.View[]} Reports of the views in this group.
   */
  reportViews() {
    return this.views.map((v) => v.report());
  }

  /*
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
    super.rotateBy(-radians, px, py);
    this.views.forEach((v) => v.rotateBy(radians, px, py));
  }

  /*
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
    super.scaleBy(ds, mx, my, 'divideBy');
    this.views.forEach((v) => v.scaleBy(ds, mx, my));
  }

  /**
   * Spawn a view into the group.
   *
   * @param {Namespace} socket - Socket.io socket for publishing changes.
   */
  spawnView(socket, index) {
    const view = new ServerView(socket, { ...this, index });
    this.views.push(view);
    return view;
  }
}

module.exports = ServerViewGroup;
