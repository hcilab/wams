'use strict';

/*
 * This file is intented to be used for testing the WamsShared module. It will test
 * the module on the server side.
 *
 * TODO: Open up a server once tests are complete for testing code on the
 *  client side.
 */

/*
 * Routines to test:
 *   + makeOwnPropertyImmutable,
 *   + getInitialValues,
 *   + IdStamper,
 *   + View,
 *   + Item,
 */
const WamsShared = require('../src/shared.js');
const IdStamper = WamsShared.IdStamper;
const Message = WamsShared.Message;
const View = WamsShared.View;
const Item = WamsShared.Item;

