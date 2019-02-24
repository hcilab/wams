/*
 * Test suite for the class.
 *
 * Author: Michael van der Kamp
 * Date: July/August 2018
 */

'use strict';

const ClientView = require('../../src/client/ClientView.js');
const ClientItem = require('../../src/client/ClientItem.js');
const ShadowView = require('../../src/client/ShadowView.js');

describe('ClientView', () => {
  let DEFAULTS, item, shadow, context;
  beforeEach(() => {
    DEFAULTS = { 
      x: 0, 
      y: 0, 
      rotation: 0, 
      scale: 1, 
      type: 'view/background',
    };

    item = {
      x: 42, 
      y: 43, 
      type: 'booyah', 
      imgsrc: 'home', 
      id: 11
    };

    shadow = { 
      x: 43, 
      y: 42, 
      width: 1800,
      height: 240,
      scale: 2,
      effectiveWidth: 900, 
      effectiveHeight: 120, 
      id: 25
    };

    context = new CanvasRenderingContext2D();
  });

  describe('constructor(values)', () => {
    test('Creates correct type of object', () => {
      expect(new ClientView({ context })).toBeInstanceOf(ClientView);
    });

    test('Uses defaults if no additional values provided', () => {
      expect(new ClientView({ context })).toMatchObject(DEFAULTS);
    });

    test('Uses provided values', () => {
      const custom = Object.freeze({ context, x: 42, y: 43, });
      const remain = { ...DEFAULTS, ...custom };
      const cv = new ClientView(custom);
      expect(cv).toMatchObject(custom);
      expect(cv).toMatchObject(remain);
    });
  });

  describe('addItem(values)', () => {
    let cv;
    beforeAll(() => cv = new ClientView({ context }));

    test('Throws exception if no values provided', () => {
      expect(() => cv.addItem()).toThrow();
    });

    test('Adds a ClientItem using the provided values', () => {
      expect(() => cv.addItem(item)).not.toThrow();
      expect(cv.items.get(item.id)).toMatchObject(item);
      expect(cv.items.get(item.id)).toBeInstanceOf(ClientItem);
    });
  });

  describe('addShadow(values)', () => {
    let cv;
    beforeAll(() => cv = new ClientView({ context }));

    test('Throws exception if no values provided', () => {
      expect(() => cv.addShadow()).toThrow();
    });

    test('Adds a ShadowView using the provided values', () => {
      expect(() => cv.addShadow(shadow)).not.toThrow();
      expect(cv.shadows.get(shadow.id)).toMatchObject(shadow);
      expect(cv.shadows.get(shadow.id)).toBeInstanceOf(ShadowView);
    });
  });

  describe('removeItem(item)', () => {
    let cv, bitem, citem;
    beforeAll(() => {
      bitem = { x: 555, y: 253, id: 50};
      citem = { x: 1, y: 2, id: 89 };
      cv = new ClientView({ context });
      cv.addItem(bitem);
      cv.addItem(item);
      cv.addItem(citem);
    });

    test('Throws exception if no item provided', () => {
      expect(() => cv.removeItem()).toThrow();
    });

    test('Removes the item', () => {
      const i = cv.items.get(item.id);
      expect(() => cv.removeItem(i.report())).not.toThrow();
      expect(cv.items.size).toBe(2);
      expect(cv.items).not.toContain(i);
    });
  });

  describe('removeShadow(shadow)', () => {
    let cv, bshadow, cshadow;
    beforeAll(() => { 
      bshadow = { x: 80, y: 90, id: 44};
      cshadow = { x: 22, y: 5, id: 900};

      cv = new ClientView({ context });
      cv.addShadow(bshadow);
      cv.addShadow(shadow);
      cv.addShadow(cshadow);
    });

    test('Throws exception if no shadow provided', () => {
      expect(() => cv.removeShadow()).toThrow();
    });

    test('Removes the shadow', () => {
      const s = cv.shadows.get(shadow.id);
      expect(() => cv.removeShadow(s.report())).not.toThrow();
      expect(cv.shadows.size).toBe(2);
      expect(cv.shadows).not.toContain(s);
    });
  });

  describe('draw(context)', () => {
    let cv, ctx;
    beforeAll(() => { 
      ctx = new CanvasRenderingContext2D();
      cv = new ClientView({ context: ctx });

      cv.width = 500;
      cv.height = 500;
      cv.effectiveWidth = 500;
      cv.effectiveHeight = 500;

      cv.addShadow({x:80,y:90,id:44});
      cv.addShadow(shadow);
      cv.addShadow({x:22,y:5,id:900});
      cv.addItem({x:555, y:253, id:50});
      cv.addItem(item);
      cv.addItem({x:1,y:2, id:89});

      cv.items.forEach( i => i.draw = jest.fn() );
      cv.shadows.forEach( s => s.draw = jest.fn() );

      cv.draw();
    });

    test('Aligns the context', () => {
      expect(ctx.scale).toHaveBeenCalled();
      expect(ctx.rotate).toHaveBeenCalled();
      expect(ctx.translate).toHaveBeenCalled();
    });

    test('Draws all of the items', () => {
      cv.items.forEach( i => {
        expect(i.draw).toHaveBeenCalledTimes(1);
      });
    });

    test('Draws all of the shadows', () => {
      cv.shadows.forEach( s => {
        expect(s.draw).toHaveBeenCalledTimes(1);
      });
    });

  });

  describe('resizeToFillWindow()', () => {
    let cv;
    beforeAll(() => cv = new ClientView({ context }));

    test('Adjusts size of client view to the window size', () => {
      expect(cv.width).not.toBe(window.innerWidth);
      expect(cv.height).not.toBe(window.innerHeight);
      cv.resizeToFillWindow();
      expect(cv.width).toBe(window.innerWidth);
      expect(cv.height).toBe(window.innerHeight);
    });
  });

  describe('setup(data)', () => {
    let cv, data;
    beforeAll(() => {
      cv = new ClientView({ context });
      data = {
        id: 33,
        views: [
          {x:80,y:90,id:44},
          shadow,
          {x:22,y:5,id:900},
        ],
        items: [
          {x:555, y:253, id:50},
          item,
          {x:1,y:2, id:89},
        ],
        color: '#4ab93d',
      };
    });

    test('Throws exception if no data provided', () => {
      expect(() => cv.setup()).toThrow();
    });

    test('Throws exception if data is missing parameters', () => {
      expect(() => cv.setup({id:1, views:[]})).toThrow();
      expect(() => cv.setup({id:1, items:[]})).toThrow();
      expect(() => cv.setup({items:[], views:[]})).toThrow();
    });

    test('Does not throw exception if data provided', () => {
      expect(() => cv.setup(data)).not.toThrow();
    });

    test('Stamps an immutable Id onto the ClientView', () => {
      expect(cv).toHaveImmutableProperty('id');
    });

    test('Adds all the views in the data as shadows', () => {
      data.views.forEach( v => {
        expect(cv.shadows.has(v.id)).toBe(true);
        const s = cv.shadows.get(v.id);
        expect(s).toMatchObject(v);
      });
    });
  
    test('Adds all the items in the data', () => {
      data.items.forEach( i => {
        expect(cv.items.has(i.id)).toBe(true);
        const t = cv.items.get(i.id);
        expect(t).toMatchObject(i);
      });
    });
  });

  describe('updateItem(data)', () => {
    let cv, data;
    beforeAll(() => {
      cv = new ClientView({ context });
      data = {
        id: item.id,
        x: item.x + 101,
        y: item.y - 73,
      }
      cv.addItem(item);
    });

    test('Throws exception if no data provided', () => {
      expect(() => cv.updateItem()).toThrow();
    });

    test('Does not throw exception when provided with valid data', () => {
      expect(() => cv.updateItem(data)).not.toThrow();
    });

    test('Updates item data to the provided values', () => {
      const i = cv.items.get(item.id);
      expect(i.x).toBe(data.x);
      expect(i.y).toBe(data.y);
    });
  });

  describe('updateShadow(data)', () => {
    let cv, data;
    beforeAll(() => {
      cv = new ClientView({ context });
      data = {
        id: shadow.id,
        x: shadow.x + 101,
        y: shadow.y - 73,
      }
      cv.addShadow(shadow);
    });

    test('Throws exception if no data provided', () => {
      expect(() => cv.updateShadow()).toThrow();
    });

    test('Does not throw exception when provided with valid data', () => {
      expect(() => cv.updateShadow(data)).not.toThrow();
    });

    test('Updates shadow data to the provided values', () => {
      const s = cv.shadows.get(shadow.id);
      expect(s.x).toBe(data.x);
      expect(s.y).toBe(data.y);
    });
  });
});

