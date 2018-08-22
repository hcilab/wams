/*
 * Test suite for the ShadowView class.
 *
 * Author: Michael van der Kamp
 * Date: July/August 2018
 */

'use strict';

const ShadowView = require('../../src/client/ShadowView.js');

describe('ShadowView', () => {
  const view = {
    x: 43,
    y: 42,
    effectiveWidth: 900,
    effectiveHeight: 120,
    id: 1,
  };

  describe('constructor(values)', () => {
    const DEFAULTS = Object.freeze({
      x: 0,
      y: 0,
      effectiveWidth: window.innerWidth,
      effectiveHeight: window.innerHeight,
    })
    test('Throws exception if no values provided', () => {
      expect(() => new ShadowView()).toThrow();
    });

    test('Uses defined values, if provided', () => {
      expect(new ShadowView(view)).toMatchObject(view);
    });
  });

  describe.skip('draw(context)', () => {
    const sv = new ShadowView(view);
    const ctx = {
      save: jest.fn(),
      restore: jest.fn(),
      beginPath: jest.fn(),
      rect: jest.fn(),
      stroke: jest.fn(),
    }

    test('Throws exception if no context provided', () => {
      expect(() => sv.draw()).toThrow();
    });

    test('Draws a rectangle representing the shadow view', () => {
      expect(() => sv.draw(ctx)).not.toThrow();
      expect(ctx.beginPath).toHaveBeenCalledTimes(1);
      expect(ctx.beginPath).toHaveBeenLastCalledWith();
      expect(ctx.rect).toHaveBeenCalledTimes(1);
      expect(ctx.rect).toHaveBeenLastCalledWith(
        sv.x, sv.y, sv.effectiveWidth, sv.effectiveHeight
      );
      expect(ctx.stroke).toHaveBeenCalledTimes(1);
      expect(ctx.stroke).toHaveBeenLastCalledWith();
    });
  });
});

