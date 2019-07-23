/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 */

/**
 * Bundles together the predefined callback factories.
 *
 * <br>
 * <img
 * src =
 * "https://raw.githubusercontent.com/mvanderkamp/wams/master/graphs/
 * predefined.png"
 * style = "max-height: 150px;"
 * >
 *
 * @module predefined
 */

'use strict';

const items   = require('./predefined/items.js');
const layouts = require('./predefined/layouts.js');
const utilities = require('./predefined/utilities.js');
const actions = require('./predefined/actions.js');

module.exports = Object.freeze({
  actions,
  items,
  layouts,
  utilities,
});

