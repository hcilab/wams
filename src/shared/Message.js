/*
 * Shared Message class for the WAMS application.
 *
 * Author: Michael van der Kamp
 * Date: July / August 2018
 *
 * The purpose of this class is to provide a funnel through which all messages
 * between client and server must pass. In concert with the Reporter interface,
 * it allows for a sanity check such that the correct sort of data is getting
 * passed back and forth.
 *
 * Unfortunately this does not provide a strict guarantee that informal and ad
 * hoc messages aren't getting emitted somewhere, so it is up to the programmer
 * to be disciplined and adhere to the Message / Reporter principle.
 */

'use strict';

const { defineOwnImmutableEnumerableProperty } = require('./utilities.js');

/**
 * TYPES is an explicit list of the types of messages that will be passed back
 * and forth. Messages not on this list should be ignored!
 *
 * @enum {string}
 * @readonly
 * @lends module:shared.Message
 */
const TYPES = {
  // For the server to inform about changes to the model
  /** @const */ ADD_ELEMENT: 'add-element',
  /** @const */ ADD_IMAGE: 'add-image',
  /** @const */ ADD_ITEM: 'add-item',
  /** @const */ ADD_SHADOW: 'add-shadow',
  /** @const */ ADD_GROUP: 'add-group',
  /** @const */ RM_ITEM: 'remove-item',
  /** @const */ RM_SHADOW: 'remove-shadow',
  /** @const */ UD_ITEM: 'update-item',
  /** @const */ UD_SHADOW: 'update-shadow',
  /** @const */ UD_VIEW: 'update-view',

  // For hopefully occasional extra adjustments to objects in the model.
  /** @const */ RM_ATTRS: 'remove-attributes',
  /** @const */ SET_ITEMS: 'set-items',
  /** @const */ SET_ATTRS: 'set-attributes',
  /** @const */ SET_IMAGE: 'set-image',
  /** @const */ SET_RENDER: 'set-render',
  /** @const */ SET_PARENT: 'set-parent',

  // Connection establishment related (disconnect, initial setup)
  /** @const */ INITIALIZE: 'initialize',
  /** @const */ LAYOUT: 'layout',
  /** @const */ FULL: 'full',

  // User event related
  /** @const */ CLICK: 'click',
  /** @const */ RESIZE: 'resize',
  /** @const */ SWIPE: 'swipe',
  /** @const */ TRACK: 'track',
  /** @const */ TRANSFORM: 'transform',

  // Multi-device gesture related
  /** @const */ POINTER: 'pointer',
  /** @const */ BLUR: 'blur',

  // Page event related
  /** @const */ IMG_LOAD: 'image-loaded',

  // User defined actions
  /** @const */ DISPATCH: 'dispatch',
};
Object.freeze(TYPES);

const TYPE_VALUES = Object.freeze(Object.values(TYPES));

/**
 * The Message class provides a funnel through which data passed between the
 * client and server must flow.
 *
 * If an invalid type is received, the constructor throws an exception. If an
 * invalid reporter is received, an exception will not be thrown until
 * 'emitWith()' is called.
 *
 * @memberof module:shared
 *
 * @throws TypeError
 *
 * @param {string} type - The message type. Must be one of the explicitly listed
 * message types available on the Message object.
 * @param {module:shared.Reporter} reporter - A Reporter instance, containing
 * the data to be emitted.
 */
class Message {
  constructor(type, reporter) {
    if (!TYPE_VALUES.includes(type)) {
      throw new TypeError('Invalid message type!');
    }

    /**
     * The type of Message. Must be one of the predefined types available as
     * static fields on the Message class.
     *
     * @type {string}
     */
    this.type = type;

    /**
     * The Reporter which holds the data to send in the Message.
     *
     * @type {module:shared.Reporter}
     */
    this.reporter = reporter;
  }

  /**
   * Emits the data contained in the reporter along the channel defined by
   * emitter.
   *
   * @param {Emitter} emitter - An object capable of emitting data packets. Must
   * have an 'emit()' function.
   */
  emitWith(emitter) {
    emitter.emit(this.type, this.reporter.report());
  }
}

/*
 * Only define the messages once, above, and now attach them to the Message
 * Class object for external reference.
 */
Object.entries(TYPES).forEach(([p, v]) => {
  defineOwnImmutableEnumerableProperty(Message, p, v);
});

module.exports = Message;
