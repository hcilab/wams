'use strict';

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
