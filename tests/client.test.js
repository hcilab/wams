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
    })
    const vals = {
      x: 43,
      y: 42,
      effectiveWidth: 900,
      effectiveHeight: 120,
    };

    test('Throws exception if no values provided', () => {
      expect(() => new ShadowViewer()).toThrow();
    });

    test('Uses defined values, if provided', () => {
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
      x: 42, y: 43, width: 800, height: 97,
      type: 'booyah',
      imgsrc: 'home',
    };

    test('Constructs an object of the correct type', () => {
      expect(new ClientItem(data)).toBeInstanceOf(ClientItem);
    });

    test('Throws exception if no data provided', () => {
      expect(() => new ClientItem()).toThrow();
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
  const DEFAULTS = Object.freeze({ x: 0, y: 0, rotation: 0, scale: 1, });
  const item = {x:42, y:43, width:80, height:97, type:'booyah', imgsrc:'home'};
  const shadow = { x: 43, y: 42, effectiveWidth: 900, effectiveHeight: 120, };

  describe('constructor(values)', () => {
    test('Creates correct type of object', () => {
      expect(new ClientViewer()).toBeInstanceOf(ClientViewer);
    });

    test('Uses defaults if no values provided', () => {
      expect(new ClientViewer()).toMatchObject(DEFAULTS);
    });

    test('Uses provided values', () => {
      const custom = Object.freeze({ x: 42, y: 43, });
      const cv = new ClientViewer(custom);
      expect(cv).toMatchObject(custom);
      expect(cv.rotation).toBe(DEFAULTS.rotation);
      expect(cv.scale).toBe(DEFAULTS.scale);
    });

    test('Resizes to fill the window', () => {
      const cv = new ClientViewer({width: 100, height: 255});
      expect(cv.width).toBe(window.innerWidth);
      expect(cv.height).toBe(window.innerHeight);
    });
  });

  describe('addItem(values)', () => {
    const cv = new ClientViewer();
    test('Throws exception if no values provided', () => {
      expect(() => cv.addItem()).toThrow();
    });

    test('Adds a ClientItem using the provided values', () => {
      expect(() => cv.addItem(item)).not.toThrow();
      expect(cv.items[0]).toMatchObject(item);
      expect(cv.items[0]).toBeInstanceOf(ClientItem);
    });
  });

  describe('addShadow(values)', () => {
    const cv = new ClientViewer();
    test('Throws exception if no values provided', () => {
      expect(() => cv.addShadow()).toThrow();
    });

    test('Adds a ShadowViewer using the provided values', () => {
      expect(() => cv.addShadow(shadow)).not.toThrow();
      expect(cv.shadows[0]).toMatchObject(shadow);
      expect(cv.shadows[0]).toBeInstanceOf(ShadowViewer);
    });
  });

  describe('draw(context)', () => {
  });

  describe('removeItem(item)', () => {
  });

  describe('removeViewer(viewer)', () => {
  });

  describe('resizeToFillWindow()', () => {
  });

  describe('setup(data)', () => {
  });

  describe('updateItem(data)', () => {
  });

  describe('updateShadow(data)', () => {
  });
});

describe('ClientController', () => {
  describe('constructor(canvas)', () => {
  });

  describe('drag(event)', () => {
  });

  describe('dragend(event)', () => {
  });

  describe('dragstart(event)', () => {
  });

  describe('getMouseCoordinates(event)', () => {
  });

  describe('resize()', () => {
  });

  describe('run()', () => {
  });

  describe('scroll(event)', () => {
  });

  describe('sendUpdate()', () => {
  });

  describe('tap(event)', () => {
  });

  describe('transform(event)', () => {
  });

  describe('transformend(event)', () => {
  });

  describe('transformstart(event)', () => {
  });
});


