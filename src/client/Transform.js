'use strict';

const wes = require('westures');

/**
 * The Transform class is a custom Westures gestures that combines Pan, Rotate,
 * and Scale into one gesture so that the three gestures can be emitted
 * together, reducing jitter.
 *
 * @memberof module:client
 */
class Transform extends wes.Gesture {
  constructor(element, handler, options = {}) {
    super('transform', element, handler, { ...Transform.DEFAULTS, ...options });

    /**
     * The Pinch gesture.
     *
     * @type {Pinch}
     */
    this.pinch = new wes.Pinch(element, null);

    /**
     * The Rotate gesture.
     *
     * @type {Rotate}
     */
    this.rotate = new wes.Rotate(element, null);

    /**
     * The Pan gesture.
     *
     * @type {Pan}
     */
    this.pan = new wes.Pan(element, null, { disableKeys: ['ctrlKey'] });
  }

  /**
   * Hook for the 'start' phase.
   *
   * @param {State} state
   */
  start(state) {
    if (this.pinch.isEnabled(state)) {
      this.pinch.start(state);
    }
    if (this.rotate.isEnabled(state)) {
      this.rotate.start(state);
    }
    if (this.pan.isEnabled(state)) {
      this.pan.start(state);
    }
  }

  /**
   * Hook for the 'move' phase.
   *
   * @param {State} state
   */
  move(state) {
    const result = {
      centroid: state.centroid,
      delta: {},
    };

    let emit = false;

    if (this.pinch.isEnabled(state)) {
      const pinchData = this.pinch.move(state);
      if (pinchData) {
        result.delta.scale = pinchData.scale;
        emit = true;
      }
    }

    if (this.rotate.isEnabled(state)) {
      const rotateData = this.rotate.move(state);
      if (rotateData) {
        result.delta.rotation = rotateData.rotation;
        emit = true;
      }
    }

    if (this.pan.isEnabled(state)) {
      const panData = this.pan.move(state);
      if (panData) {
        result.delta.translation = panData.translation;
        emit = true;
      }
    }

    return emit ? result : null;
  }

  /**
   * Hook for the 'end' phase.
   *
   * @param {State} state
   */
  end(state) {
    if (this.pinch.isEnabled(state)) {
      this.pinch.end(state);
    }
    if (this.rotate.isEnabled(state)) {
      this.rotate.end(state);
    }
    if (this.pan.isEnabled(state)) {
      this.pan.end(state);
    }
  }

  /**
   * Hook for the 'cancel' phase.
   *
   * @param {State} state
   */
  cancel(state) {
    if (this.pinch.isEnabled(state)) {
      this.pinch.cancel(state);
    }
    if (this.rotate.isEnabled(state)) {
      this.rotate.cancel(state);
    }
    if (this.pan.isEnabled(state)) {
      this.pan.cancel(state);
    }
  }
}

module.exports = Transform;
