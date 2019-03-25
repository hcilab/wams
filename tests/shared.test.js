'use strict';

/*
 * This file is intended to be used for testing the WamsShared module. It will
 * test the module on the server side.
 *
 * TODO: Open up a server once tests are complete for testing code on the
 *  client side.
 */

const WamsShared = require('../src/shared.js');

const expected = [
  'colours',
  'constants',
  'IdStamper',
  'Message',
  'View',
  'Item',
  'DataReporter',
  'FullStateReporter',
  'defineOwnImmutableEnumerableProperty',
  'NOP',
  'removeById',
];

test('Exports all the proper shared utilities', () => {
  const exported = Object.keys(WamsShared);
  expect(exported).toEqual(expect.arrayContaining(expected));
  expect(exported.length).toBe(expected.length);
});


