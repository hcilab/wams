'use strict';

const { View } = require('shared.js');
const ServerViewGroup = require('server/ServerViewGroup.js');
const ServerView = require('server/ServerView.js');
const MessageHandler = require('server/MessageHandler.js');

describe('ServerViewGroup', () => {
  describe('constructor(messageHandler)', () => {
    test('constructs correct type of object', () => {
      expect(new ServerViewGroup(new MessageHandler())).toBeInstanceOf(ServerViewGroup);
    });

    test('Uses defaults', () => {
      expect(new ServerViewGroup(new MessageHandler())).toMatchObject({
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

  describe('Methods', () => {
    let socket, viewGroup, view;
    beforeAll(() => {
      viewGroup = new ServerViewGroup(new MessageHandler());
    });
    beforeEach(() => {
      socket = { emit: jest.fn() };
    });

    describe('spawnView(socket)', () => {
      test('Returns a ServerView', () => {
        expect(viewGroup.spawnView(socket)).toBeInstanceOf(ServerView);
      });

      test('Uses default View values', () => {
        expect(viewGroup.spawnView(socket)).toMatchObject({
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

      test('Keeps track of View', () => {
        view = viewGroup.spawnView(socket);
        expect(viewGroup.views).toContain(view);
      });
    });

    describe('toJSON()', () => {
      test('Returns an array', () => {
        expect(viewGroup.toJSON()).toBeInstanceOf(Array);
      });

      test('Does not return the actual Views, but simple Objects', () => {
        viewGroup.toJSON().forEach((v) => {
          expect(v).not.toBeInstanceOf(ServerView);
          expect(v).toBeInstanceOf(Object);
        });
      });

      test('Objects returned contain only the expected data', () => {
        viewGroup.toJSON().forEach((v) => {
          expect(Object.getOwnPropertyNames(v)).toEqual(
            expect.arrayContaining(['x', 'y', 'width', 'height', 'rotation', 'scale', 'type', 'index'])
          );
        });
      });

      test('Returns data for each View in the workspace', () => {
        expect(viewGroup.toJSON().length).toBe(viewGroup.views.length);
      });
    });

    describe('removeView(view)', () => {
      test('Removes a view if it is found', () => {
        expect(viewGroup.views).toContain(view);
        expect(() => viewGroup.removeView(view)).not.toThrow();
        expect(viewGroup.views).not.toContain(view);
      });

      test('Does not remove anything if view not found', () => {
        const v = new ServerView({ x: 200, y: 200 });
        const curr = Array.from(viewGroup.views);
        expect(() => viewGroup.removeView(v)).not.toThrow();
        expect(viewGroup.views).toEqual(curr);
      });

      test('Throws exception if not view provided', () => {
        expect(() => viewGroup.removeView()).toThrow();
      });
    });
  });
});
