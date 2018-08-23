/*
 * WAMS code to be executed in the client browser.
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 *
 * Original author: Jesse Rolheiser
 * Other revisions and supervision: Scott Bateman
 *
 * The ClientController coordinates communication with the wams server. It sends
 * messages based on user interaction with the canvas and receives messages from
 * the server detailing changes to post to the view. This is essentially the
 * controller in an MVC-esque design.
 */

'use strict';

const io = require('socket.io-client');
const { 
  constants: globals, 
  IdStamper, 
  Message, 
  MouseReporter,
  NOP,
  RotateReporter,
  ScaleReporter,
} = require('../shared.js');
const ClientView = require('./ClientView.js');
const Interactor = require('./Interactor.js');

const STAMPER = new IdStamper();

const symbols = Object.freeze({
  attachListeners: Symbol('attachListeners'),
  establishSocket: Symbol('establishSocket'),
});

class ClientController { 
  constructor(canvas) {
    this.canvas = canvas;
    this.socket = null;
    this.view = new ClientView({ context: this.canvas.getContext('2d') });
    this.interactor = new Interactor(this.canvas, {
      pan:    this.pan.bind(this),
      rotate: this.rotate.bind(this),
      tap:    this.tap.bind(this),
      zoom:   this.zoom.bind(this),
    });

    this.resizeCanvasToFillWindow();
    window.addEventListener('resize', this.resize.bind(this), false);
    this[symbols.establishSocket]();
  }

  [symbols.attachListeners]() {
    const listeners = {
      // For the server to inform about changes to the model
      [Message.ADD_ITEM]:   (...args) => this.handle('addItem', ...args),
      [Message.ADD_SHADOW]: (...args) => this.handle('addShadow', ...args),
      [Message.RM_ITEM]:    (...args) => this.handle('removeItem', ...args),
      [Message.RM_SHADOW]:  (...args) => this.handle('removeShadow', ...args),
      [Message.UD_ITEM]:    (...args) => this.handle('updateItem', ...args),
      [Message.UD_SHADOW]:  (...args) => this.handle('updateShadow', ...args),
      [Message.UD_VIEW]:    (...args) => this.handle('assign', ...args),

      // Connection establishment related (disconnect, initial setup)
      [Message.INITIALIZE]: (...args) => this.setup(...args),
      [Message.LAYOUT]:     NOP,

      // User event related
      [Message.CLICK]:  NOP,
      [Message.DRAG]:   NOP,
      [Message.RESIZE]: NOP,
      [Message.ROTATE]: NOP,
      [Message.SCALE]:  NOP,

      /*
       * TODO: This could be more... elegant...
       */
      'wams-full': () => document.body.innerHTML = 'WAMS is full! :(',
    };

    Object.entries(listeners).forEach( ([p,v]) => this.socket.on(p, v) );
  }

  [symbols.establishSocket]() {
    this.socket = io.connect( globals.NS_WAMS, {
      autoConnect: false,
      reconnection: false,
    });
    this[symbols.attachListeners]();
    this.socket.connect();
  }

  handle(message, ...args) {
    this.view.handle(message, ...args);
  }

  pan(x, y, dx, dy) {
    const mreport = new MouseReporter({ x, y, dx, dy });
    new Message(Message.DRAG, mreport).emitWith(this.socket);
  }

  resize() {
    this.resizeCanvasToFillWindow();
    new Message(Message.RESIZE, this.view).emitWith(this.socket);
  }

  resizeCanvasToFillWindow() {
    this.canvas.width = window.innerWidth; 
    this.canvas.height = window.innerHeight;
    this.handle('resizeToFillWindow');
  }

  setup(data) {
    STAMPER.cloneId(this, data.id);
    this.canvas.style.backgroundColor = data.color;
    this.handle('setup', data);
    new Message(Message.LAYOUT, this.view).emitWith(this.socket);
  }

  rotate(radians) {
    const rreport = new RotateReporter({ radians });
    new Message(Message.ROTATE, rreport).emitWith(this.socket);
  }

  tap(x, y) {
    const mreport = new MouseReporter({ x, y });
    new Message(Message.CLICK, mreport).emitWith(this.socket);
  }

  zoom(diff) {
    const scale = this.view.scale + diff;
    const sreport = new ScaleReporter({ scale });
    new Message(Message.SCALE, sreport).emitWith(this.socket);
  }
}

module.exports = ClientController;

