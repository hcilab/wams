'use strict';

// const Westures = require('../../../westures');
const Westures = require('westures');

const { NOP } = require('../shared.js');

/**
 * The Interactor class provides a layer of abstraction between the
 * ClientController and the code that processes user inputs.  Data from
 * recognized gestures is reported directly through to the handlers. The
 * handlers are initialized to NOPs so that the functions which call the
 * handlers don't need to check whether the handler exists.
 *
 * Currently, the Interactor makes use of the Westures library.
 *
 * @memberof module:client
 *
 * @see {@link https://mvanderkamp.github.io/westures/}
 *
 * @param {Object} handlers - Object with keys as the names gestures and values
 *    as the corresponding function for handling that gesture when it is
 *    recognized.
 * @param {Function} [handlers.swipe=NOP]
 * @param {Function} [handlers.tap=NOP]
 * @param {Function} [handlers.track=NOP]
 * @param {Function} [handlers.transform=NOP]
 */
class Interactor {
  constructor(root, handlers = {}, applySmoothing = true) {
    /**
     * Object holding the handlers, so they can be dynamically referenced by
     * name.
     *
     * @type {Object}
     * @property {Function} [swipe=NOP]
     * @property {Function} [tap=NOP]
     * @property {Function} [track=NOP]
     * @property {Function} [transform=NOP]
     */
    this.handlers = { ...Interactor.DEFAULT_HANDLERS, ...handlers };

    /**
     * Whether to apply smoothing to the gestures on coarse pointer devices.
     *
     * @type {boolean}
     * @default true
     */
    this.applySmoothing = applySmoothing;

    /**
     * Object to coalesce state from multiple gestures during one event cycle.
     *
     * @type {Object}
     */
    this._changes = this._resetChanges();
    this._scheduled = false;

    // Begin listening activities immediately.
    this.addGestures(root);
    window.addEventListener('wheel', this.wheel.bind(this), false);
  }

  /**
   * Sets up gesture listeners via westures.
   */
  addGestures(root) {
    const region = new Westures.Region(root, { preventDefault: false });

    region.addGesture(
      new Westures.Pan(root, this.coalesce.bind(this), {
        disableKeys: ['ctrlKey'],
        applySmoothing: this.applySmoothing,
      })
    );
    region.addGesture(
      new Westures.Pinch(root, this.coalesce.bind(this), {
        applySmoothing: this.applySmoothing,
      })
    );
    region.addGesture(
      new Westures.Rotate(root, this.coalesce.bind(this), {
        applySmoothing: this.applySmoothing,
      })
    );
    region.addGesture(
      new Westures.Swipe(root, this.handlers.swipe, {
        applySmoothing: this.applySmoothing,
      })
    );
    region.addGesture(
      new Westures.Swivel(root, this.swivel.bind(this), {
        enableKeys: ['ctrlKey'],
        dynamicPivot: true,
        maxInputs: 1,
      })
    );
    region.addGesture(new Westures.Tap(root, this.handlers.tap));
    region.addGesture(new Westures.Track(root, this.handlers.track, { phases: ['start', 'end'] }));
  }

  _resetChanges() {
    return {
      centroid: { x: 0, y: 0 },
      delta: {
        scale: 1,
        rotation: 0,
        translation: { x: 0, y: 0 },
      },
    };
  }

  /**
   * Coalesce state changes for this event cycle.
   */
  coalesce(data) {
    this._changes.centroid = data.centroid;
    if (data.scale) {
      this._changes.delta.scale *= data.scale;
    }
    if (data.rotation) {
      this._changes.delta.rotation += data.rotation;
    }
    if (data.translation) {
      this._changes.delta.translation.x += data.translation.x;
      this._changes.delta.translation.y += data.translation.y;
    }
    if (!this._scheduled) {
      window.setTimeout(this._emit.bind(this), 0);
      this._scheduled = true;
    }
  }

  /**
   * Emit a transform event with the coalesced state changes.
   */
  _emit() {
    this.handlers.transform(this._changes);
    this._changes = this._resetChanges();
    this._scheduled = false;
  }

  /**
   * Send a swivel event through as a transformation.
   */
  swivel({ rotation, pivot }) {
    this.coalesce({ rotation, centroid: pivot });
  }

  /**
   * Treat scrollwheel events as zoom events.
   *
   * @param {WheelEvent} event - The wheel event from the window.
   */
  wheel(event) {
    event.preventDefault();
    const factor = event.ctrlKey ? 0.02 : 0.1;
    const scale = -(Math.sign(event.deltaY) * factor) + 1;
    const centroid = { x: event.clientX, y: event.clientY };
    this.handlers.transform({ centroid, delta: { scale } });
  }
}

/**
 * The default handlers used by the Interactor.
 *
 * @type {object}
 */
Interactor.DEFAULT_HANDLERS = Object.freeze({
  swipe: NOP,
  tap: NOP,
  track: NOP,
  transform: NOP,
});

module.exports = Interactor;
