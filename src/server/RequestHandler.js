/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 *
 * Original author: Jesse Rolheiser
 * Other revisions and supervision: Scott Bateman
 */

'use strict';

const path = require('path');
const express = require('express');

/*
 * XXX: The paths being used in the request handler are a little hacky and all
 *      over the place right now. Look into how to normalize them.
 */

function establishMainRoutes(app) {
  const view   = path.join(__dirname, '../../dist/view.html');
  const source = path.join(__dirname, '../../dist/wams-client.js');
  app.get('/',               (req, res) => res.sendFile(view)  );
  app.get('/wams-client.js', (req, res) => res.sendFile(source));
}

function establishAuxiliaryRoutes(app) {
  /* 
   * express.static() generates a middleware function for serving static
   * assets from the directory specified.
   *
   * - The order in which these functions are registered with this.app.use() is
   *   important! The callbacks will be triggered in this order!
   *
   * - When app.use() is called without a 'path' argument it uses the default
   *   '/' argument, with the result that these callbacks will be executed for
   *   _every_ request to the app! This is why we specify the path!!
   *
   * TODO: Should also consider specifying options. Possibly useful:
   *    + immutable
   *    + maxAge
   */
  const images = path.join(__dirname, '../../img');
  const libs = path.join(__dirname, '../../libs');
  app.use('/img', express.static(images));
  app.use('/libs', express.static(libs));
}

/*
 * XXX: This is a little gross, I'm not sure I like how this works.
 */
class RequestHandler {
  constructor() {
    const app = express();
    establishMainRoutes(app);
    establishAuxiliaryRoutes(app);
    return app;
  }
}

module.exports = RequestHandler;

