'use strict';

/*
 * This file is intended to be used for testing the WamsShared module. It will
 * test the module on the server side.
 *
 * TODO: Open up a server once tests are complete for testing code on the
 *  client side.
 */

const WamsShared = require('shared.js');

const reporters = Object.keys(require('shared/Reporters.js'));
const utilities = Object.keys(require('shared/utilities.js'));

const other = ['colours', 'Circle', 'constants', 'IdStamper', 'Message', 'Polygon2D', 'Point2D', 'Rectangle'];

const expected = reporters.concat(utilities).concat(other);

test('Exports all the proper shared utilities', () => {
  const exported = Object.keys(WamsShared);
  expect(exported).toEqual(expect.arrayContaining(expected));
  expect(exported.length).toBe(expected.length);
});
