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
  const DEFAULTS = Object.freeze({ x: 0, y: 0, rotation: 0, scale: 1, });
  const item = {
    x:42, y:43, width:80, height:97, 
    type:'booyah', imgsrc:'home', id: 11
  };
  const shadow = { 
    x: 43, y: 42, 
    effectiveWidth: 900, effectiveHeight: 120, id: 25
  };
  const context = new CanvasRenderingContext2D();

  describe('constructor(values)', () => {
    test('Creates correct type of object', () => {
      expect(new ClientView({ context })).toBeInstanceOf(ClientView);
    });

    test('Uses defaults if no values provided', () => {
      expect(new ClientView({ context })).toMatchObject(DEFAULTS);
    });

    test('Uses provided values', () => {
      const custom = Object.freeze({ context, x: 42, y: 43, });
      const cv = new ClientView(custom);
      expect(cv).toMatchObject(custom);
      expect(cv.rotation).toBe(DEFAULTS.rotation);
      expect(cv.scale).toBe(DEFAULTS.scale);
    });
  });

  describe('addItem(values)', () => {
    const cv = new ClientView({ context });
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
    const cv = new ClientView({ context });
    test('Throws exception if no values provided', () => {
      expect(() => cv.addShadow()).toThrow();
    });

    test('Adds a ShadowView using the provided values', () => {
      expect(() => cv.addShadow(shadow)).not.toThrow();
      expect(cv.shadows[0]).toMatchObject(shadow);
      expect(cv.shadows[0]).toBeInstanceOf(ShadowView);
    });
  });

  describe('draw(context)', () => {
    // To be tested...
  });

  describe('removeItem(item)', () => {
    const cv = new ClientView({ context });
    cv.addItem({x:555, y:253, id:50});
    cv.addItem(item);
    cv.addItem({x:1,y:2, id:89});

    test('Throws exception if no item provided', () => {
      expect(() => cv.removeItem()).toThrow();
    });

    test('Removes the item', () => {
      const i = cv.items[1];
      expect(() => cv.removeItem(i)).not.toThrow();
      expect(cv.items.length).toBe(2);
      expect(cv.items).not.toContain(i);
    });
  });

  describe('removeShadow(shadow)', () => {
    const cv = new ClientView({ context });
    cv.addShadow({x:80,y:90,id:44});
    cv.addShadow(shadow);
    cv.addShadow({x:22,y:5,id:900});

    test('Throws exception if not shadow provided', () => {
      expect(() => cv.removeShadow()).toThrow();
    });

    test('Removes the shadow', () => {
      const s = cv.shadows[1];
      expect(() => cv.removeShadow(s)).not.toThrow();
      expect(cv.shadows.length).toBe(2);
      expect(cv.shadows).not.toContain(s);
    });
  });

  describe('resizeToFillWindow()', () => {
    const cv = new ClientView({ context });

    test('Adjusts size of client view to the window size', () => {
      expect(cv.width).not.toBe(window.innerWidth);
      expect(cv.height).not.toBe(window.innerHeight);
      window.innerWidth += 45;
      window.innerHeight -= 87;
      cv.resizeToFillWindow();
      expect(cv.width).toBe(window.innerWidth);
      expect(cv.height).toBe(window.innerHeight);
    });
  });

  describe('setup(data)', () => {
    const cv = new ClientView({ context });
    const data = {
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
        const s = cv.shadows.find( x => x.id === v.id );
        expect(s).toMatchObject(v);
      });
    });
  
    test('Adds all the items in the data', () => {
      data.items.forEach( i => {
        const t = cv.items.find( y => y.id === i.id );
        expect(t).toMatchObject(i);
      });
    });
  });

  describe('updateItem(data)', () => {
    const cv = new ClientView({ context });
    const data = {
      id: item.id,
      x: item.x + 101,
      y: item.y - 73,
    }
    cv.addItem(item);

    test('Throws exception if no data provided', () => {
      expect(() => cv.updateItem()).toThrow();
    });

    test('Does not throw exception when provided with valid data', () => {
      expect(() => cv.updateItem(data)).not.toThrow();
    });

    test('Updates item data to the provided values', () => {
      const i = cv.items.find( x => x.id === item.id );
      expect(i.x).toBe(data.x);
      expect(i.y).toBe(data.y);
    });
  });

  describe('updateShadow(data)', () => {
    const cv = new ClientView({ context });
    const data = {
      id: shadow.id,
      x: shadow.x + 101,
      y: shadow.y - 73,
    }
    cv.addShadow(shadow);

    test('Throws exception if no data provided', () => {
      expect(() => cv.updateShadow()).toThrow();
    });

    test('Does not throw exception when provided with valid data', () => {
      expect(() => cv.updateShadow(data)).not.toThrow();
    });

    test('Updates shadow data to the provided values', () => {
      const s = cv.shadows.find( x => x.id === shadow.id );
      expect(s.x).toBe(data.x);
      expect(s.y).toBe(data.y);
    });
  });
});


