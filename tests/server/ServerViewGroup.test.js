'use strict';

const { View } = require('shared.js');
const Application = require('server/Application.js');
const ServerViewGroup = require('server/ServerViewGroup.js');
const ServerView = require('server/ServerView.js');
const MessageHandler = require('server/MessageHandler.js');

describe('ServerViewGroup', () => {
  describe('constructor(messageHandler)', () => {
    test('constructs correct type of object', () => {
      expect(new ServerViewGroup(new MessageHandler(new Application()))).toBeInstanceOf(ServerViewGroup);
    });

    test('Uses defaults', () => {
      expect(new ServerViewGroup(new MessageHandler(new Application()))).toMatchObject({
        views: expect.any(Array),
        x: 0,
        y: 0,
        width: 1600,
        height: 900,
        rotation: 0,
        scale: 1,
        type: 'view/background',
        index: undefined,
      });
    });
  });
});
