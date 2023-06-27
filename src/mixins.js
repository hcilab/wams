/**
 * Mixins used by the WAMS project. These provide much of the functionality for
 * manipulating items and views.
 *
 * <br>
 * <img
 * src =
 * "https://raw.githubusercontent.com/wiki/hcilab/wams/graphs/mixins.png"
 * style = "max-height: 200px;"
 * >
 * <p>
 *
 * @see For a rundown on the mixin pattern used: {@link
 * http://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/}.
 *
 * @private
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
