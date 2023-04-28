'use strict';

const Api = require('server.js');
const Application = require('server/Application.js');

test('Expected values were correctly exported', () => {
  expect(Api).toBeInstanceOf(Object);
  expect(Api.Application.prototype).toBe(Application.prototype);
  expect(Api.Router).toBeInstanceOf(Function);
});
