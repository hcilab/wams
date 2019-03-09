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
 * @module client
 */

'use strict';

const ClientController = require('./client/ClientController.js');
const ClientModel = require('./client/ClientModel.js');
const ClientView = require('./client/ClientView.js');

window.addEventListener(
  'load',
  function run() {
    document.addEventListener('contextmenu', e => e.preventDefault());

    const canvas = document.querySelector('canvas');
    const context = canvas.getContext('2d');

    const model = new ClientModel();
    const view = new ClientView(context);
    const ctrl = new ClientController(canvas, view, model);

    model.view = view;
    view.model = model;

    ctrl.connect();
  },
  {
    capture: false,
    once:    true,
    passive: true,
  }
);

