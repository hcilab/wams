'use strict';

const { removeById } = require('../shared.js');
const ServerViewGroup = require('./ServerViewGroup');
const ServerView = require('./ServerView');

/**
 * The ViewSpace keeps track of views and view groups.
 *
 * @memberof module:server
 *
 * @param {module:server.MessageHandler} messageHandler - The message handler for
 * this viewspace.
 */
class ViewSpace {
  constructor(messageHandler) {
    /**
     * The views that are currently in this viewspace.
     *
     * @type {module:server.ServerView[]}
     */
    this.views = [];

    /**
     * The view groups that are currently in this viewspace.
     *
     * @type {module:server.ServerViewGroup[]}
     */
    this.groups = [];

    /**
     * The message handler for this viewspace.
     *
     * @type {module:server.MessageHandler}
     */
    this.messageHandler = messageHandler;
  }

  /**
   * @memberof module:server.ViewSpace
   *
   * @return {module:shared.View[]} Serialize the views in this group.
   */
  toJSON() {
    return this.views.map((v) => v.toJSON());
  }

  /**
   * Remove a view from the viewspace.
   *
   * @memberof module:server.ViewSpace
   *
   * @param {module:server.ServerView} view - View to remove.
   */
  removeView(view) {
    const group = view.group;
    if (group) {
      group.remove(view);
      if (group.views.length === 0) {
        removeById(this.groups, group);
      }
    }
    removeById(this.views, view);
  }

  /**
   * Spawn a view into the viewspace.
   *
   * @memberof module:server.ViewSpace
   *
   * @param {Namespace} socket - Socket.io socket for publishing changes.
   */
  spawnView(socket, index) {
    const group = new ServerViewGroup(this.messageHandler);
    this.groups.push(group);
    const view = new ServerView(socket, { ...this, index });
    this.views.push(view);
    group.add(view);
    return view;
  }

  /**
   * Spawn a view group into the viewspace.
   *
   * @memberof module:server.ViewSpace
   *
   * @return {module:server.ServerViewGroup} The new view group.
   */
  createViewGroup() {
    const group = new ServerViewGroup(this.messageHandler);
    this.groups.push(group);
    return group;
  }
}

module.exports = ViewSpace;
