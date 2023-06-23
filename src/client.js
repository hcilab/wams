/*
 * WAMS code to be executed in the client browser.
 */

/**
 * This file defines the entry point for the client side of a WAMS application.
 *
 * <br>
 * <img
 * src =
 * "https://raw.githubusercontent.com/wiki/hcilab/wams/graphs/client.png"
 * style = "max-height: 200px;"
 * >
 *
 * @module client
 */

'use strict';

const ClientController = require('./client/ClientController.js');
const ClientModel = require('./client/ClientModel.js');
const ClientView = require('./client/ClientView.js');

class ClientApplication {
  constructor(controller) {
    this.controller = controller;
  }

  on(event, func) {
    // listen for this DOM event
    document.addEventListener(event, func);
    this.controller.eventListeners.push(event);

    // if this event was called before this code executed, dispatch it again
    this.controller.eventQueue.forEach((ev) => {
      if (ev.action === event) {
        document.dispatchEvent(new CustomEvent(event, { detail: ev.payload }));
      }
    });

    // Remove events from the queue that have been dispatched.
    this.controller.eventQueue = this.controller.eventQueue.filter((ev) => ev.action !== event);
  }

  dispatch(event, func) {
    this.controller.dispatch(event, func);
  }
}

function run() {
  const root = document.querySelector('#root');
  if (!root) throw Error('No root element was found on the page.');
  const canvas = document.querySelector('canvas#wams');
  if (!canvas) throw Error('No canvas element was found on the page.');

  const context = canvas.getContext('2d');

  // Note: Scaling to account for device pixel ratio is disabled for iOS as a
  // workaround for a bug with Safari and Chrome, where `context.setTransform`
  // would make the page unresponsive.
  const iOS = /iPad|iPhone|iPod|Apple/.test(window.navigator.platform);
  const dpr = iOS ? 1 : window.devicePixelRatio || 1;

  const model = new ClientModel(root);
  const view = new ClientView(context, iOS, dpr);
  const controller = new ClientController(canvas, view, model, iOS, dpr);
  window.WAMS = new ClientApplication(controller);

  model.view = view;
  view.model = model;
  controller.connect();
}

window.addEventListener('load', run, {
  capture: false,
  once: true,
  passive: true,
});
