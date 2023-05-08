'use strict';

const WamsShared = require('shared.js');

const bases = Object.keys(require('shared/bases.js'));
const utilities = Object.keys(require('shared/utilities.js'));

const other = ['colours', 'Circle', 'constants', 'IdStamper', 'Message', 'Polygon2D', 'Point2D', 'Rectangle'];

const expected = bases.concat(utilities).concat(other);

test('Exports all the proper shared utilities', () => {
  const exported = Object.keys(WamsShared);
  expect(exported).toEqual(expect.arrayContaining(expected));
  expect(exported.length).toBe(expected.length);
});
