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
  });

  beforeEach(() => {
    const pan = jest.fn();
    const tap = jest.fn();
    const rotate = jest.fn();
    const zoom = jest.fn();
    handlers = { pan, tap, rotate, zoom };
  });

  describe('constructor(canvas, handlers)', () => {
    test('Throws an exception if no valid canvas provided', () => {
      expect(() => new Interactor()).toThrow();
    });

    test('Works if canvas provided, but no handlers', () => {
      expect(() => new Interactor(canvas)).not.toThrow();
    });

    test.each(['pan', 'tap', 'rotate', 'zoom'])(
      'Accepts a %s handler', 
      (name) => {
        let itr;
        expect(() => itr = new Interactor(canvas, { [name]: handlers[name] }))
          .not.toThrow();
        expect(itr.handlers[name]).toBe(handlers[name]);
      }
    );

    test('Ignores unrecognized handlers', () => {
      let itr;
      const fly = jest.fn();
      expect(() => itr = new Interactor(canvas, { fly } )).not.toThrow();
      expect(itr.handlers.fly).toBeUndefined();
    });
  });

  describe('tap', () => {
    let itr;
    beforeEach(() => {
      handlers.tap = jest.fn();
      itr = new Interactor(canvas, { tap: handlers.tap });
    });

    test('Works with mouse input', () => {
      canvas.dispatchEvent(new MouseEvent('mousedown', { 
        clientX: 42,
        clientY: 43,
      }));
      canvas.dispatchEvent(new MouseEvent('mouseup', { 
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

