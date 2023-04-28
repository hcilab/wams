'use strict';

const ShadowView = require('client/ShadowView.js');

describe('ShadowView', () => {
  const view = {
    x: 43,
    y: 42,
    effectiveWidth: 900,
    effectiveHeight: 120,
    id: 1,
  };

  describe('constructor(values)', () => {
    test('Throws exception if no values provided', () => {
      expect(() => new ShadowView()).toThrow();
    });

    test('Uses defined values, if provided', () => {
      expect(new ShadowView(view)).toMatchObject(view);
    });
  });

  describe('draw(context)', () => {
    const sv = new ShadowView(view);
    const ctx = new CanvasRenderingContext2D();

    test('Throws exception if no context provided', () => {
      expect(() => sv.draw()).toThrow();
    });

    test('Draws a rectangle representing the shadow view', () => {
      expect(() => sv.draw(ctx)).not.toThrow();
      expect(ctx.strokeRect).toHaveBeenCalled();
    });
  });
});
