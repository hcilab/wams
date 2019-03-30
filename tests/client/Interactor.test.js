/*
 * Test suite for the Interactor class.
 *
 * Author: Michael van der Kamp
 * Date: July / August 2018
 */

'use strict';

const Interactor = require('../../src/client/Interactor.js');

describe('Interactor', () => {
  let canvas, handlers;

  beforeAll(() => {
    canvas = document.createElement('canvas');
    canvas.getBoundingClientRect = jest.fn();
    canvas.getBoundingClientRect.mockReturnValue({
      left:   0,
      top:    0,
      right:  1600,
      bottom: 900,
      x:      0,
      y:      0,
      width:  1600,
      height: 900,
    });
  });

  beforeEach(() => {
    handlers = {
      swipe:     jest.fn(),
      tap:       jest.fn(),
      track:     jest.fn(),
      transform: jest.fn(),
    };
  });

  describe('constructor(canvas, handlers)', () => {
    test.each(['swipe', 'tap', 'track', 'transform'])(
      'Accepts a %s handler',
      (name) => {
        let itr;
        expect(() => itr = new Interactor({ [name]: handlers[name] }))
          .not.toThrow();
        expect(itr.handlers[name]).toBe(handlers[name]);
      }
    );
  });

  describe('tap', () => {
    let itr;
    beforeEach(() => {
      handlers.tap = jest.fn();
      itr = new Interactor({ tap: handlers.tap });
    });

    test.skip('Works with mouse input', () => {
      canvas.dispatchEvent(new MouseEvent('mousedown', {
        buttons: 1,
        clientX: 42,
        clientY: 43,
      }));
      canvas.dispatchEvent(new MouseEvent('mouseup', {
        buttons: 1,
        clientX: 42,
        clientY: 43,
      }));
      expect(handlers.tap).toHaveBeenCalledTimes(1);
      expect(handlers.tap).toHaveBeenLastCalledWith(43, 42);
    });
  });

  describe('pan', () => {
  });

  describe('rotate', () => {
  });

  describe('zoom', () => {
  });
});

