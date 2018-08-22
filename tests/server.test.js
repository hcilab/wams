/* 
 * Test suite for src/server.js
 *
 * Author: Michael van der Kamp
 * Date: July/August 2018
 */

'use strict';

const Wams = require('../src/server.js');
const WamsServer = require('../src/server/WamsServer.js');
const { CanvasBlueprint } = require('canvas-sequencer');

test('Expected values were correctly exported', () => {
  expect(Wams).toBeInstanceOf(Function);
  expect(Wams.Sequence).toBeInstanceOf(Function);
  expect(Wams.Sequence.prototype).toBe(CanvasBlueprint.prototype);
  expect(Wams.prototype).toBe(WamsServer.prototype);
});


