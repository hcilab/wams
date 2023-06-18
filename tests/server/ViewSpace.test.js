'use strict';

const { View } = require('shared.js');
const Application = require('server/Application.js');
const MessageHandler = require('server/MessageHandler.js');
const ServerViewGroup = require('server/ServerViewGroup.js');
const ServerView = require('server/ServerView.js');
const ViewSpace = require('server/ViewSpace.js');

describe('ViewSpace', () => {
  describe('Methods', () => {
    let socket, viewspace, view;
    beforeEach(() => {
      viewspace = new ViewSpace(new MessageHandler(new Application()));
    });
    beforeEach(() => {
      socket = { emit: jest.fn() };
    });

    describe('spawnView(socket)', () => {
      test('Returns a ServerView', () => {
        expect(viewspace.spawnView(socket)).toBeInstanceOf(ServerView);
      });

      test('Uses default View values', () => {
        expect(viewspace.spawnView(socket)).toMatchObject({
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
        view = viewspace.spawnView(socket);
        expect(viewspace.views).toContain(view);
      });
    });

    describe('toJSON()', () => {
      test('Returns an array', () => {
        expect(viewspace.toJSON()).toBeInstanceOf(Array);
      });

      test('Does not return the actual Views, but simple Objects', () => {
        viewspace.spawnView(socket);
        viewspace.toJSON().forEach((v) => {
          expect(v).not.toBeInstanceOf(ServerView);
          expect(v).toBeInstanceOf(Object);
        });
      });

      test('Objects returned contain only the expected data', () => {
        viewspace.spawnView(socket);
        viewspace.toJSON().forEach((v) => {
          expect(Object.getOwnPropertyNames(v)).toEqual(
            expect.arrayContaining(['x', 'y', 'width', 'height', 'rotation', 'scale', 'type', 'index'])
          );
        });
      });

      test('Returns data for each View in the workspace', () => {
        viewspace.spawnView(socket);
        viewspace.spawnView(socket);
        viewspace.spawnView(socket);
        expect(viewspace.toJSON().length).toBe(viewspace.views.length);
      });
    });

    describe('removeView(view)', () => {
      test('Removes a view if it is found', () => {
        view = viewspace.spawnView(socket);
        expect(viewspace.views).toContain(view);
        expect(() => viewspace.removeView(view)).not.toThrow();
        expect(viewspace.views).not.toContain(view);
      });

      test('Does not remove anything if view not found', () => {
        view = viewspace.spawnView(socket);
        const v = new ServerView({ x: 200, y: 200 });
        const curr = Array.from(viewspace.views);
        expect(() => viewspace.removeView(v)).not.toThrow();
        expect(viewspace.views).toEqual(curr);
      });

      test('Throws exception if not view provided', () => {
        expect(() => viewspace.removeView()).toThrow();
      });
    });
  });
});
