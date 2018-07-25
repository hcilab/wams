/*
 * If Jest will work with client-side code, this file will test out the client
 * side of the WAMS API.
 */

'use strict';

const client = require('../src/client.js');
const ClientViewer = client.ClientViewer;
const ClientItem = client.ClientItem;
const ClientController = client.ClientController;
const ShadowViewer = client.ShadowViewer;

expect.extend({
  toHaveImmutableProperty(received, argument) {
    const descs = Object.getOwnPropertyDescriptor(received, argument);
    const pass = Boolean(descs && !(descs.configurable || descs.writable));
    const not = pass ? 'not ' : ''
    return {
      message: () =>
        `expected ${received} ${not}to have immutable property '${argument}'`,
      pass: pass,
    };
  },
});

describe('ShadowViewer', () => {
  describe('constructor(values)', () => {
    const DEFAULTS = Object.freeze({
      x: 0,
      y: 0,
      effectiveWidth: window.innerWidth,
      effectiveHeight: window.innerHeight,
    });

    test('Uses defaults if no values provided', () => {
      expect(new ShadowViewer()).toMatchObject(DEFAULTS);
    });

    test('Uses defined values, if provided', () => {
      const vals = {
        x: 43,
        y: 42,
        effectiveWidth: 900,
        effectiveHeight: 120,
      };
      expect(new ShadowViewer(vals)).toMatchObject(vals);
    });
  });
  
  describe('draw(context)', () => {
    const vals = {
      x: 43,
      y: 42,
      effectiveWidth: 900,
      effectiveHeight: 120,
    };
    const sv = new ShadowViewer(vals);
    const ctx = {
      beginPath: jest.fn(),
      rect: jest.fn(),
      stroke: jest.fn(),
    }

    test('Throws exception if no context provided', () => {
      expect(() => sv.draw()).toThrow();
    });

    test('Draws a rectangle representing the shadow viewer', () => {
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

describe('ClientItem', () => {
  describe('constructor(data)', () => {
    const data = {
      x: 42,
      y: 43,
      width: 800,
      height: 97,
      type: 'booyah',
      imgsrc: 'home',
    };

    test('Constructs an object of the correct type', () => {
      expect(new ClientItem()).toBeInstanceOf(ClientItem);
    });

    test('Does not initialize any data if no data provided', () => {
      const ci = new ClientItem();
      Object.values(ci).forEach( v => expect(v).toBeNull() );
    });

    test('Defines the expected properties', () => {
      const ci = new ClientItem();
      expect(Object.keys(ci)).toEqual([
        'x',
        'y',
        'width',
        'height',
        'type',
        'imgsrc',
        'drawCustom',
        'drawStart',
        'img',
      ]);
    });

    test('Uses input values, if provided', () => {
      const ci = new ClientItem(data);
      Object.keys(data).forEach( k => {
        expect(ci[k]).toBe(data[k]);
      });
    });

    test('If data has an ID, stamps it immutably onto the item', () => {
      data.id = 4;
      const ci = new ClientItem(data);
      expect(ci).toHaveImmutableProperty('id');
      expect(ci.id).toBe(4);
    });

    test('Creates an image, if data provides an imgsrc', () => {
      const ci = new ClientItem(data);
      expect(ci).toHaveProperty('img');
      expect(ci.img).toBeInstanceOf(Image);
      expect(ci.img.src).toBe(data.imgsrc);
    });

    test('Does not create an image, if no imgsrc provided', () => {
      delete data.imgsrc;
      const ci = new ClientItem(data);
      expect(ci.img).toBeNull();
    });
  });
  
  describe('draw(context)', () => {
    const data = {
      x: 42,
      y: 43,
      width: 800,
      height: 97,
      type: 'booyah',
      imgsrc: 'home',
    };

    const ctx = {
      drawImage: jest.fn()
    };

    test('Throws an exception if no context provided', () => {
      const ci = new ClientItem(data);
      expect(() => ci.draw()).toThrow();
    });

    test('If an image is provided, draws an image', () => {
      const ci = new ClientItem(data);
      expect(() => ci.draw(ctx)).not.toThrow();
      expect(ctx.drawImage).toHaveBeenCalledTimes(1);
      expect(ctx.drawImage).toHaveBeenLastCalledWith(
        ci.img, ci.x, ci.y, ci.width, ci.height
      );
    });
  });
});

describe('ClientViewer', () => {
  const DEFAULTS = Object.freeze({
    x: 0,
    y: 0,
    width: window.innerWidth,
    height: window.innerHeight,
    effectiveWidth: window.innerWidth,
    effectiveHeight: window.innerHeight,
    rotation: 0,
    scale: 1,
  });

  describe('constructor(values)', () => {
    test('Uses defaults if no values provided', () => {
      expect(new ClientViewer()).toMatchObject(DEFAULTS);
    });
  });

  describe('addItem(values)', () => {
  });

  describe('addViewer(values)', () => {
  });

  describe('draw(context)', () => {
  });

  describe('locate(context)', () => {
  });

  describe('removeItem(item)', () => {
  });

  describe('removeViewer(viewer)', () => {
  });

  describe('resizeToFillWindow()', () => {
  });

  describe('setup(data)', () => {
  });

  describe('showStatus(context)', () => {
  });

  describe('updateItems(items)', () => {
  });

  describe('updateViewer(data)', () => {
  });
});

