'use strict';

const { View } = require('../shared.js');

// Data fields to write for status indicator text.
const STATUS_KEYS = Object.freeze(['x', 'y', 'width', 'height', 'rotation', 'scale']);

// Mark these methods as intended only for internal use.
const symbols = Object.freeze({
  align: Symbol('align'),
  drawBackground: Symbol('dragBackground'),
  drawItems: Symbol('drawItems'),
  drawShadows: Symbol('drawShadows'),
  drawStatus: Symbol('drawStatus'),
  wipe: Symbol('wipe'),
});

// Default ClientView configuration.
const DEFAULT_CONFIG = Object.freeze({
  showStatus: false,
  shadows: false,
});

/**
 * The ClientView is responsible for rendering the view. To do this, it keeps
 * track of its own position, scale, and orientation, as well as those values
 * for all items and all other views (which will be represented with outlines).
 *
 * @extends module:shared.View
 * @memberof module:client
 *
 * @param {CanvasRenderingContext2D} context - The canvas context in which to
 * render the model.
 */
class ClientView extends View {
  constructor(context) {
    super(ClientView.DEFAULTS);

    /**
     * The CanvasRenderingContext2D is required for drawing (rendering) to take
     * place.
     *
     * @type {CanvasRenderingContext2D}
     */
    this.context = context;

    /**
     * The model holds the information about items and shadows that need
     * rendering.
     *
     * @type {module:client.ClientModel}
     */
    this.model = null;

    /**
     * Configuration of ClientView that can be
     * modified in user-defined `window.WAMS_CONFIG`.
     *
     * @type {object}
     */
    this.config = { ...DEFAULT_CONFIG };
  }

  /**
   * Positions the rendering context precisely, taking into account all
   * transformations, so that rendering can proceed correctly.
   *
   * @alias [@@align]
   * @memberof module:client.ClientView
   */
  [symbols.align]() {
    /*
     * WARNING: It is crucially important that the instructions below occur
     * in *precisely* this order!
     */
    this.context.scale(this.scale, this.scale);
    this.context.rotate(this.rotation);
    this.context.translate(-this.x, -this.y);
  }

  /**
   * Renders all the items.
   *
   * @alias [@@drawItems]
   * @memberof module:client.ClientView
   */
  [symbols.drawItems]() {
    this.model.itemOrder.forEach((o) => o.draw(this.context, this));
  }

  /**
   * Renders outlines of all the other views.
   *
   * @alias [@@drawShadows]
   * @memberof module:client.ClientView
   */
  [symbols.drawShadows]() {
    this.model.shadows.forEach((v) => v.draw(this.context));
  }

  /**
   * Renders text describing the status of the view to the upper left corner of
   * the view, to assist with debugging.
   *
   * @alias [@@drawShadows]
   * @memberof module:client.ClientView
   */
  [symbols.drawStatus]() {
    const messages = STATUS_KEYS.map((k) => `${k}: ${this[k].toFixed(2)}`).concat([
      `# of Shadows: ${this.model.shadows.size}`,
    ]);
    let ty = 40;
    const tx = 20;

    this.context.save();
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.font = '18px Georgia';
    messages.forEach((m) => {
      this.context.fillText(m, tx, ty);
      ty += 20;
    });
    this.context.restore();
  }

  /**
   * Clears all previous renders, to ensure a clean slate for the upcoming
   * render.
   *
   * @alias [@@wipe]
   * @memberof module:client.ClientView
   */
  [symbols.wipe]() {
    this.context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }

  /**
   * Fully render the current state of the system.
   */
  draw() {
    this.context.save();
    this[symbols.wipe]();
    this[symbols.align]();
    this[symbols.drawItems]();
    if (this.config.shadows) this[symbols.drawShadows]();
    if (this.config.status) this[symbols.drawStatus]();
    this.context.restore();
  }

  /**
   * Fill all available space in the window.
   */
  resizeToFillWindow(dpr, iOS) {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    if (!iOS) this.context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
}

module.exports = ClientView;
