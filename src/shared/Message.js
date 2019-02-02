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

const { defineOwnImmutableEnumerableProperty } = require('./util.js');

/**
 * TYPES is an explicit list of the types of messages that will be passed back
 * and forth. Messages not on this list should be ignored!
 */
const TYPES = Object.freeze({ 
  // For the server to inform about changes to the model
  ADD_ITEM:   'wams-add-item',
  ADD_SHADOW: 'wams-add-shadow',
  RM_ITEM:    'wams-remove-item',
  RM_SHADOW:  'wams-remove-shadow',
  UD_ITEM:    'wams-update-item',
  UD_SHADOW:  'wams-update-shadow',
  UD_VIEW:    'wams-update-view',

  // Connection establishment related (disconnect, initial setup)
  INITIALIZE: 'wams-initialize',
  LAYOUT:     'wams-layout',
  FULL:       'wams-full',

  // User event related
  CLICK:      'wams-click',
  DRAG:       'wams-drag',
  RESIZE:     'wams-resize',
  ROTATE:     'wams-rotate',
  SCALE:      'wams-scale',
  SWIPE:      'wams-swipe',
  TRACK:      'wams-track',

  // Page event related
  IMG_LOAD:   'wams-image-loaded',
});

const TYPE_VALUES = Object.freeze(Object.values(TYPES));

/**
 * The Message class provides a funnel through which data passed between the
 * client and server must flow.
 */
class Message {
  /**
   * If an invalid type is received, throws an exception. If an invalid reporter
   * is received, an exception will not be thrown until 'emitWith()' is called.
   *
   * type    : The message type. Must be one of the explicitly listed message
   *           types available on the Message object.
   * reporter: A Reporter instance, containing the data to be emitted.
   */
  constructor(type, reporter) {
    if (!TYPE_VALUES.includes(type)) throw 'Invalid message type!';

    this.type = type;
    this.reporter = reporter;
  }

  /**
   * Emits the data contained in the reporter along the channel defined by
   * emitter.
   *
   * emitter: An object capable of emitting data packets. Must have an 'emit()'
   *          function.
   */
  emitWith(emitter) {
    emitter.emit(this.type, this.reporter.report());
  }
}

// Only define the messages once, above, and now attach them to the Message
// class object for external reference.
Object.entries(TYPES).forEach( ([p,v]) => {
  defineOwnImmutableEnumerableProperty( Message, p, v );
});

module.exports = Message;

