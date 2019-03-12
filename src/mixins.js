/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 */

/**
 * Mixins used by the WAMS project.
 *
 * @see For a rundown on the mixin pattern I use: {@link
 * http://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/}.
 * Note that I actually like the base syntax, and prefer not to add another
 * dependency by requiring the module implemented by the author of that article.
 *
 * @module mixins
 */

'use strict';

const Hittable = require('./mixins/Hittable.js');
const Identifiable = require('./mixins/Identifiable.js');
const Interactable = require('./mixins/Interactable.js');
const Lockable = require('./mixins/Lockable.js');
const Locker = require('./mixins/Locker.js');
const Publishable = require('./mixins/Publishable.js');
const Transformable2D = require('./mixins/Transformable2D.js');

module.exports = {
  Hittable,
  Identifiable,
  Interactable,
  Locker,
  Lockable,
  Publishable,
  Transformable2D,
};

