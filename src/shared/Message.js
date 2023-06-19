'use strict';

/**
 * Enum of the various message types.
 *
 * @name Message
 * @enum {string}
 * @readonly
 */
const Message = {
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
  /** @const */ RESIZE: 'resize',

  // Gesture related
  /** @const */ POINTER: 'pointer',
  /** @const */ BLUR: 'blur',
  /** @const */ KEYBOARD: 'keyboard',

  // Page event related
  /** @const */ IMG_LOAD: 'image-loaded',

  // User defined actions
  /** @const */ DISPATCH: 'dispatch',
};
Object.freeze(Message);

module.exports = Message;
