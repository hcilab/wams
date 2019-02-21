/* 
 * Test suite for src/server.js
 *
 * Author: Michael van der Kamp
 * Date: July/August 2018
 */

'use strict';

const Api = require('../src/server.js');
const Application = require('../src/server/Application.js');
const { CanvasBlueprint } = require('canvas-sequencer');

test('Expected values were correctly exported', () => {
  expect(Api).toBeInstanceOf(Function);
  expect(Api.Sequence).toBeInstanceOf(Function);
  expect(Api.Sequence.prototype).toBe(CanvasBlueprint.prototype);
  expect(Api.prototype).toBe(Application.prototype);
});


