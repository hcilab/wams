/*
 * Test suite for src/server.js
 *
 * Author: Michael van der Kamp
 * Date: July/August 2018
 */

'use strict';

const Api = require('server.js');
const Application = require('server/Application.js');
const { CanvasSequence } = require('canvas-sequencer');

test('Expected values were correctly exported', () => {
  expect(Api).toBeInstanceOf(Function);
  expect(Api.CanvasSequence).toBeInstanceOf(Function);
  expect(Api.CanvasSequence.prototype).toBe(CanvasSequence.prototype);
  expect(Api.prototype).toBe(Application.prototype);
});


