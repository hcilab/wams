/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 *
 * Original author: Jesse Rolheiser
 * Other revisions and supervision: Scott Bateman
 *
 * A Connection maintains a socket.io connection between a client and the
 * server. It tracks a view associated with the client, as well as the 
 * associated workspace.
 */

'use strict';

const { FullStateReporter, Message, NOP } = require('../shared.js');

const symbols = Object.freeze({
  attachListeners: Symbol('attachListeners'),
  fullStateReport: Symbol('fullStateReport'),
});

class Connection {
  constructor(index, socket, workspace) {
    this.index = index;
    this.socket = socket;
    this.workspace = workspace;
    this.view = this.workspace.spawnView();
    this[symbols.attachListeners]();
    this[symbols.fullStateReport]();
  }

  [symbols.attachListeners]() {
    const listeners = {
      // For the server to inform about changes to the model
      [Message.ADD_ITEM]:   NOP,
      [Message.ADD_SHADOW]: NOP,
      [Message.RM_ITEM]:    NOP,
      [Message.RM_SHADOW]:  NOP,
      [Message.UD_ITEM]:    NOP,
      [Message.UD_SHADOW]:  NOP,
      [Message.UD_VIEW]:    NOP,

      // Connection establishment related (disconnect, initial setup)
      [Message.INITIALIZE]: NOP,
      [Message.LAYOUT]:     (...args) => this.layout(...args),

      // User event related
      [Message.CLICK]:  (...args) => this.handle('click', ...args),
      [Message.DRAG]:   (...args) => this.handle('drag', ...args),
      [Message.RESIZE]: (...args) => this.resize(...args),
      [Message.ROTATE]: (...args) => this.handle('rotate', ...args),
      [Message.SCALE]:  (...args) => this.handle('scale', ...args),
      [Message.SWIPE]:  (...args) => this.handle('swipe', ...args),
    };

    Object.entries(listeners).forEach( ([p,v]) => this.socket.on(p, v) );
  }

  [symbols.fullStateReport]() {
    const fsreport = new FullStateReporter({
      views: this.workspace.reportViews(),
      items: this.workspace.reportItems(),
      color: this.workspace.settings.color,
      id: this.view.id,
    });
    new Message(Message.INITIALIZE, fsreport).emitWith(this.socket);
  }
  
  disconnect() {
    if (this.workspace.removeView(this.view)) {
      this.view.releaseLockedItem();
      this.socket.disconnect(true);
      return true;
    } 
    return false;
  }

  handle(message, ...args) {
    this.workspace.handle(message, this.view, ...args);
  }

  layout(data) {
    this.view.assign(data);
    new Message(Message.ADD_SHADOW, this.view).emitWith(this.socket.broadcast);
    this.workspace.handle('layout', this.view, this.index);
  }

  resize(data) {
    this.view.assign(data);
    new Message(Message.UD_SHADOW, this.view).emitWith(this.socket.broadcast);
  }
}

module.exports = Connection;

