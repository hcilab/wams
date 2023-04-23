/*
 * WAMS code to be executed in the client browser.
 *
 * Author: Michael van der Kamp
 * Date: July 2018 - Jan 2019
 *
 * Original author: Jesse Rolheiser
 * Other revisions and supervision: Scott Bateman
 */

/**
 * This file defines the entry point for the client side of a WAMS application.
 *
 * <br>
 * <img
 * src =
 * "https://raw.githubusercontent.com/mvanderkamp/wams/master/graphs/
 * client.png"
 * style = "max-height: 200px;"
 * >
 *
 * @module client
 */

'use strict';

const ClientController = require('./client/ClientController.js');
const ClientModel = require('./client/ClientModel.js');
const ClientView = require('./client/ClientView.js');

function ClientApplication(controller) {
  return {
    on: (event, func) => {
      // listen for this DOM event
      document.addEventListener(event, func);
      controller.eventListeners.push(event);

      // if this event was called before this code executed,
      // dispatch it again
      controller.eventQueue.forEach((ev) => {
        if (ev.action === event) {
          document.dispatchEvent(new CustomEvent(event, { detail: ev.payload }));
        }
      });

      // Remove events from the queue that have been dispatched.
      controller.eventQueue = controller.eventQueue.filter((ev) => ev.action !== event);
    },
    dispatch: (event, func) => controller.dispatch(event, func),
  };
}

function run() {
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  const root = document.querySelector('#root');
  if (!root) throw Error('No root element was found on the page.');
  const canvas = document.querySelector('canvas');
  if (!canvas) throw Error('No canvas element was found on the page.');

  const context = canvas.getContext('2d');

  const model = new ClientModel(root);
  const view = new ClientView(context);
  const controller = new ClientController(root, canvas, view, model);
  window.WAMS = ClientApplication(controller);

  model.view = view;
  view.model = model;
  controller.connect();
}

window.addEventListener('load', run, {
  capture: false,
  once: true,
  passive: true,
});
