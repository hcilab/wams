/*
 * Shared Message class for the WAMS application.
 *
 * Author: Michael van der Kamp
 * Date: July / August 2018
 */

'use strict';

const Utils = require('./util.js');

const TYPES = Object.freeze({ 
  // For the server to inform about changes to the model
  ADD_ITEM:   'wams-add-item',
  ADD_SHADOW: 'wams-add-shadow',
  RM_ITEM:    'wams-remove-item',
  RM_SHADOW:  'wams-remove-shadow',
  UD_ITEM:    'wams-update-item',
  UD_SHADOW:  'wams-update-shadow',
  UD_VIEW:  'wams-update-view',

  // Connection establishment related (disconnect, initial setup)
  INITIALIZE: 'wams-initialize',
  LAYOUT:     'wams-layout',

  // User event related
  CLICK:      'wams-click',
  DRAG:       'wams-drag',
  RESIZE:     'wams-resize',
  ROTATE:     'wams-rotate',
  SCALE:      'wams-scale',
});

const TYPE_VALUES = Object.freeze(Object.values(TYPES));

class Message {
  constructor(type, reporter) {
    if (!TYPE_VALUES.includes(type)) {
      throw 'Invalid message type!';
    }
    this.type = type;
    this.reporter = reporter;
  }

  emitWith(emitter) {
    // console.log('emitting:', this.type, this.reporter.report());
    emitter.emit(this.type, this.reporter.report());
  }
}

Object.entries(TYPES).forEach( ([p,v]) => {
  Utils.defineOwnImmutableEnumerableProperty( Message, p, v );
});

module.exports = Message;

