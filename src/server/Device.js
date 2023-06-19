'use strict';

const { View } = require('../shared.js');
const { Transformable2D } = require('../mixins.js');

/**
 * A Device keeps track of the physical position of a device connected to an
 * application.
 *
 * @memberof module:server
 * @extends module:shared.View
 * @mixes module:mixins.Transformable2D
 */
class Device extends Transformable2D(View) {
  constructor(values = {}) {
    super(values);

    /**
     * The view that this device is attached to.
     *
     * @type {module:server.ServerView}
     */
    this.view = null;
  }
}

module.exports = Device;
