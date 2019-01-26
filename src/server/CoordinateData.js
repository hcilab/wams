/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 *
 * Stores coordinate data and can transform data to convert from a View's space
 * to the model's space.
 */

'use strict';

const { constants } = require('../shared.js');

// symbols to identify these methods as intended only for internal use
const symbols = Object.freeze({
  scale: Symbol('scale'),
  rotate: Symbol('rotate'),
  translate: Symbol('translate'),
});

class CoordinateData {
  constructor(x = 0, y = 0, dx = 0, dy = 0) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
  }

  /**
   * Transform pointer coordinates and movement originating from inside a
   * client's View into coordinates corresponding to the principle model.
   *
   * view: The View corresponding to the client where the coordinates
   *       originated.
   */
  transformFrom(view) {
    /*
     * WARNING: It is crucially important that the instructions below occur
     * in *precisely* this order!
     */
    this[symbols.scale](view.scale);
    this[symbols.rotate](-view.rotation);
    this[symbols.translate](view.x, view.y);

    return this;
  }

  /**
   * Inner helper function for scaling coordinate data.
   *
   * scale: Factor by which to scale the coordinates. (Will divide by this much)
   */
  [symbols.scale](scale) {
    this.x /= scale;
    this.y /= scale;
    this.dx /= scale;
    this.dy /= scale;
  }

  /**
   * Inner helper function for applying a translation to coordinate data.
   *
   * x: distance to move along x axis
   * y: distance to move along y ayis
   */
  [symbols.translate](x, y) {
    this.x += x;
    this.y += y;
  }

  /**
   * Inner helper function for applying a rotation to coordinate data.
   *
   * theta: Amount of rotation, in radians
   */
  [symbols.rotate](theta) {
    const cos_theta = Math.cos(theta);
    const sin_theta = Math.sin(theta);

    const x = this.x;
    const y = this.y;
    const dx = this.dx;
    const dy = this.dy;

    this.x = rotateX(x, y, cos_theta, sin_theta);
    this.y = rotateY(x, y, cos_theta, sin_theta);
    this.dx = rotateX(dx, dy, cos_theta, sin_theta);
    this.dy = rotateY(dx, dy, cos_theta, sin_theta);
  }
}

function rotateX(x, y, cos_theta, sin_theta) {
  return x * cos_theta - y * sin_theta;
}

function rotateY(x, y, cos_theta, sin_theta) {
  return x * sin_theta + y * cos_theta;
}

module.exports = CoordinateData;

