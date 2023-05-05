'use strict';

const path = require('path');
const express = require('express');

function Router() {
  const app = express();
  const view = path.join(__dirname, '../dist/index.html');
  app.get('/', (req, res) => res.sendFile(view));

  app.use('/wams', express.static(path.join(__dirname, '../dist/wams')));

  // Make the express object accessible (e.g. for express.static())
  app.express = express;

  return app;
}

module.exports = Router;
