/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 *
 * Original author: Jesse Rolheiser
 * Other revisions and supervision: Scott Bateman
 *
 * The ServerView provides operations for the server to locate, move,
 * and rescale views.
 */

'use strict';

const WamsShared = require('../shared.js');

const DEFAULTS = {
  x: 0,
  y: 0,
  width: 1600,
  height: 900,
  type: 'view/background',
  scale: 1,
  rotation: 0,
  bounds: {
    x: 10000,
    y: 10000,
  },
};

const STAMPER = new WamsShared.IdStamper();

class ServerView extends WamsShared.View {
  /*
   * XXX: At some point, the effective width and height should be made to be
   *      updated whenever either the width, height, or scale of the
   *      view get updated. This could be achieve with getters and 
   *      setters on those three values. Might need to think through all the
   *      possible complications though.
   *
   *      The same thing could maybe be done with the 'center' getter, so
   *      that it refers to an actual stored value that gets updated whenever
   *      the effective width or height gets updated, or when the x or y
   *      values get updated. This would prevent having to recompute every
   *      time the value is accessed, which is the way things are working
   *      currently.
   *
   *      Perhaps one technique would be to find a way of storing the actual
   *      x, y, width, height, effectiveWidth, effectiveHeight, and scale
   *      using some private data technique with alternative names for the
   *      variables (or some other storage method) and have the original 
   *      names be used for the getters and setters. Might want to have a
   *      look at the shared Reporter factory definition to see if this can
   *      be handled at a more general level.
   */
  constructor(values = {}) {
    super(WamsShared.getInitialValues(DEFAULTS, values));
    this.bounds = values.bounds || DEFAULTS.bounds;
    this.effectiveWidth = this.width / this.scale;
    this.effectiveHeight = this.height / this.scale;
    STAMPER.stampNewId(this);
  }

  get bottom()  { return this.y + this.effectiveHeight; }
  get left()    { return this.x; }
  get right()   { return this.x + this.effectiveWidth; }
  get top()     { return this.y; }

  canBeScaledTo(width = this.width, height = this.height) {
    return  (width  > 0) &&
      (height > 0) &&
      (this.x + width  <= this.bounds.x) &&
      (this.y + height <= this.bounds.y);
  }

  /*
   * The canMoveTo[XY] functions are split up in order to allow for the x and
   * y dimensions to be independently moved. In other words, if a move fails
   * in the x direction, it can still succeed in the y direction. This makes
   * it easier to push the view into the boundaries.
   *
   * XXX: Can they be unified simply while still allowing this kind of 
   *      separation?
   */
  canMoveToX(x = this.x) {
    return (x >= 0) && (x + this.effectiveWidth <= this.bounds.x);
  }

  canMoveToY(y = this.y) {
    return (y >= 0) && (y + this.effectiveHeight <= this.bounds.y);
  }

  refineMouseCoordinates(x, y, dx, dy) {
    const data = { x, y, dx, dy };
    /*
     * WARNING: It is crucially important that the instructions below occur
     * in *precisely* this order!
     */
    applyScale(data, this.scale);
    applyRotation(data, (2 * Math.PI) - this.rotation);
    applyTranslation(data, this.x, this.y);
    return data;

    function applyScale(data, scale) {
      data.x /= scale;
      data.y /= scale;
      data.dx /= scale;
      data.dy /= scale;
    }

    function applyTranslation(data, x, y) {
      data.x += x;
      data.y += y;
    }

    function applyRotation(data, theta) {
      const cos_theta = Math.cos(theta);
      const sin_theta = Math.sin(theta);
      const x = data.x;
      const y = data.y;
      const dx = data.dx;
      const dy = data.dy;

      data.x = rotateX(x, y, cos_theta, sin_theta);
      data.y = rotateY(x, y, cos_theta, sin_theta);
      data.dx = rotateX(dx, dy, cos_theta, sin_theta);
      data.dy = rotateY(dx, dy, cos_theta, sin_theta);

      function rotateX(x, y, cos_theta, sin_theta) {
        return x * cos_theta - y * sin_theta;
      }

      function rotateY(x, y, cos_theta, sin_theta) {
        return x * sin_theta + y * cos_theta;
      }
    }
  }

  /*
   * Views are constrained to stay within the boundaries of the workspace.
   */
  moveTo(x = this.x, y = this.y) {
    const coordinates = { x: this.x, y: this.y };
    if (this.canMoveToX(x)) coordinates.x = x;
    if (this.canMoveToY(y)) coordinates.y = y;
    this.assign(coordinates);
  }

  moveBy(dx = 0, dy = 0) {
    this.moveTo(this.x + dx, this.y + dy);
  }

  /*
   * The scaled width and height (stored permanently as effective width and
   * height) are determined by dividing the width or height by the scale.
   * This might seem odd at first, as that seems to be the opposite of what
   * should be done. But what these variables are actually representing is the
   * amount of the underlying workspace that can be displayed inside the
   * view. So a larger scale means that each portion of the workspace takes
   * up more of the view, therefore _less_ of the workspace is visible.
   * Hence, division.
   *
   * XXX: One thing that could be done in this function is to try anchoring
   *      on the right / bottom if anchoring on the left / top produces a
   *      failure. (By anchoring, I mean that the given position remains
   *      constant while the scaling is occurring).
   */
  rescale(scale = this.scale) {
    const effectiveWidth = this.width / scale;
    const effectiveHeight = this.height / scale;
    if (this.canBeScaledTo(effectiveWidth, effectiveHeight)) {
      this.assign({ scale, effectiveWidth, effectiveHeight });
      return true;
    }
    return false;
  }
}

module.exports = ServerView;

