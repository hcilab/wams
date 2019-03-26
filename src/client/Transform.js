/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: December 2018
 */

'use strict';

const Westures = require('westures');

/**
 * The Transform class is a custom Westures gestures that combines Pan, Rotate,
 * and Scale into one gesture so that the three gestures can be emitted
 * together, reducing jitter.
 *
 * @memberof module:client
 */
class Transform extends Westures.Gesture {
  constructor() {
    super('transform');

    /**
     * The Pinch gesture.
     *
     * @type {Pinch}
     */
    this.pinch = new Westures.Pinch();

    /**
     * The Rotate gesture.
     *
     * @type {Rotate}
     */
    this.rotate = new Westures.Rotate();

    /**
     * The Pan gesture.
     *
     * @type {Pan}
     */
    this.pan = new Westures.Pan({ muteKey: 'ctrlKey' });
  }

  /**
   * Hook for the 'start' phase.
   *
   * @param {State} state
   */
  start(state) {
    this.pinch.start(state);
    this.rotate.start(state);
    this.pan.start(state);
  }

  /**
   * Hook for the 'move' phase.
   *
   * @param {State} state
   */
  move(state) {
    const result = {
      centroid: state.centroid,
      delta:    {},
    };

    const pinch_data = this.pinch.move(state);
    const rotate_data = this.rotate.move(state);
    const pan_data = this.pan.move(state);
    let emit = false;

    if (pinch_data) {
      result.delta.scale = pinch_data.scale;
      emit = true;
    }

    if (rotate_data) {
      result.delta.rotation = rotate_data.rotation;
      emit = true;
    }

    if (pan_data) {
      result.delta.translation = pan_data.translation;
      emit = true;
    }

    return emit ? result : null;
  }

  /**
   * Hook for the 'end' phase.
   *
   * @param {State} state
   */
  end(state) {
    this.pinch.end(state);
    this.rotate.end(state);
    this.pan.end(state);
  }

  /**
   * Hook for the 'cancel' phase.
   *
   * @param {State} state
   */
  cancel(state) {
    this.pinch.cancel(state);
    this.rotate.cancel(state);
    this.pan.cancel(state);
  }
}

module.exports = Transform;

