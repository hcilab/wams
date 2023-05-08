'use strict';

const { View } = require('shared.js');
const ServerView = require('server/ServerView.js');

let props, socket, view;
beforeAll(() => {
  socket = {
    emit: jest.fn(),
    broadcast: {
      emit: jest.fn(),
    },
  };
  props = {
    x: 0,
    y: 0,
    width: 50,
    height: 50,
    type: 'testing/view',
    scale: 1,
    rotation: 0,
    index: 1,
  };
});

describe('ServerView', () => {
  describe('constructor(values)', () => {
    test('Creates correct item type.', () => {
      expect(() => new ServerView()).not.toThrow();
      expect(new ServerView()).toBeInstanceOf(ServerView);
    });

    test('Uses default values if none provided', () => {
      expect(new ServerView(socket)).toMatchObject({
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

    test('Uses user-defined values, if provided', () => {
      expect(() => (view = new ServerView(socket, props))).not.toThrow();
      expect(view).toMatchObject(props);
    });

    test('Stamps an immutable Id onto the item', () => {
      expect(view).toHaveImmutableProperty('id');
      expect(view.id).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Methods', () => {
    beforeAll(() => {
      view = new ServerView(socket, props);
    });

    describe('scaleBy(scale)', () => {
      test('Works with an acceptable scale', () => {
        expect(() => view.scaleBy(2)).not.toThrow();
        expect(view.scale).toBe(2);
        expect(() => view.scaleBy(0.25)).not.toThrow();
        expect(view.scale).toBe(0.5);
      });

      test('Has no effect if arguments omitted', () => {
        expect(() => view.scaleBy()).not.toThrow();
        expect(view.scale).toBe(0.5);
      });
    });

    describe('moveTo(x,y)', () => {
      test('Has no effect if arguments omitted', () => {
        expect(() => view.moveTo()).not.toThrow();
        expect(view.x).toBe(0);
        expect(view.y).toBe(0);
      });

      test('Works with acceptable destinations', () => {
        expect(() => view.moveTo(1, 1)).not.toThrow();
        expect(view.x).toBe(1);
        expect(view.y).toBe(1);
        expect(() => view.moveTo(25.23, 47.8)).not.toThrow();
        expect(view.x).toBe(25.23);
        expect(view.y).toBe(47.8);
        expect(() => view.moveTo(50, 50)).not.toThrow();
        expect(view.x).toBe(50);
        expect(view.y).toBe(50);
        expect(() => view.moveTo(0, 0)).not.toThrow();
        expect(view.x).toBe(0);
        expect(view.y).toBe(0);
      });
    });

    describe('moveBy(dx,dy)', () => {
      test('Has no effect if arguments omitted', () => {
        expect(() => view.moveBy()).not.toThrow();
        expect(view.x).toBe(0);
        expect(view.y).toBe(0);
      });

      test('Works with valid input', () => {
        expect(() => view.moveBy(-5, -5)).not.toThrow();
        expect(view.x).toBe(-5);
        expect(view.y).toBe(-5);
        expect(() => view.moveBy(-45, -45)).not.toThrow();
        expect(view.x).toBe(-50);
        expect(view.y).toBe(-50);
        expect(() => view.moveBy(1, 1)).not.toThrow();
        expect(view.x).toBe(-49);
        expect(view.y).toBe(-49);
        expect(() => view.moveBy(49, 49)).not.toThrow();
        expect(view.x).toBe(0);
        expect(view.y).toBe(0);
      });
    });
  });
});
