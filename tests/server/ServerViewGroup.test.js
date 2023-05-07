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
      expect(new ServerViewGroup(new MessageHandler())).toMatchObject(ServerViewGroup.DEFAULTS);
    });
  });

  describe('Methods', () => {
    let socket, svg, view;
    beforeAll(() => {
      svg = new ServerViewGroup(new MessageHandler());
    });
    beforeEach(() => {
      socket = { emit: jest.fn() };
    });

    describe('spawnView(socket)', () => {
      test('Returns a ServerView', () => {
        expect(svg.spawnView(socket)).toBeInstanceOf(ServerView);
      });

      test('Uses default View values', () => {
        expect(svg.spawnView(socket)).toMatchObject(ServerView.DEFAULTS);
      });

      test('Keeps track of View', () => {
        view = svg.spawnView(socket);
        expect(svg.views).toContain(view);
      });
    });

    describe('toJSON()', () => {
      let expectedProperties;
      beforeAll(() => {
        expectedProperties = expect.arrayContaining(Object.keys(View.DEFAULTS));
      });

      test('Returns an array', () => {
        expect(svg.toJSON()).toBeInstanceOf(Array);
      });

      test('Does not return the actual Views, but simple Objects', () => {
        svg.toJSON().forEach((v) => {
          expect(v).not.toBeInstanceOf(ServerView);
          expect(v).toBeInstanceOf(Object);
        });
      });

      test('Objects returned contain only the expected data', () => {
        svg.toJSON().forEach((v) => {
          expect(Object.getOwnPropertyNames(v)).toEqual(expectedProperties);
        });
      });

      test('Returns data for each View in the workspace', () => {
        expect(svg.toJSON().length).toBe(svg.views.length);
      });
    });

    describe('removeView(view)', () => {
      test('Removes a view if it is found', () => {
        expect(svg.views).toContain(view);
        expect(() => svg.removeView(view)).not.toThrow();
        expect(svg.views).not.toContain(view);
      });

      test('Does not remove anything if view not found', () => {
        const v = new ServerView({ x: 200, y: 200 });
        const curr = Array.from(svg.views);
        expect(() => svg.removeView(v)).not.toThrow();
        expect(svg.views).toEqual(curr);
      });

      test('Throws exception if not view provided', () => {
        expect(() => svg.removeView()).toThrow();
      });
    });
  });
});
