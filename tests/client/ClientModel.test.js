/**
 * @jest-environment jsdom
 */

'use strict';

const ClientModel = require('client/ClientModel.js');
const ClientView = require('client/ClientView.js');
const ClientItem = require('client/ClientItem.js');
const ShadowView = require('client/ShadowView.js');

describe('ClientModel', () => {
  let item, shadow;
  beforeEach(() => {
    item = {
      x: 42,
      y: 43,
      type: 'booyah',
      id: 11,
    };

    shadow = {
      x: 43,
      y: 42,
      width: 1800,
      height: 240,
      scale: 2,
      effectiveWidth: 900,
      effectiveHeight: 120,
      id: 25,
    };

    // eslint-disable-next-line
    new CanvasRenderingContext2D();
  });

  describe('constructor(values)', () => {
    test('Creates correct type of object', () => {
      expect(new ClientModel()).toBeInstanceOf(ClientModel);
    });
  });

  describe('Methods', () => {
    let cm;
    beforeAll(() => {
      cm = new ClientModel();
      cm.view = new ClientView(new CanvasRenderingContext2D());
    });

    describe('addItem(values)', () => {
      test('Throws exception if no values provided', () => {
        expect(() => cm.addItem()).toThrow();
      });

      test('Adds a ClientItem using the provided values', () => {
        expect(() => cm.addItem(item)).not.toThrow();
        expect(cm.items.get(item.id)).toMatchObject(item);
        expect(cm.items.get(item.id)).toBeInstanceOf(ClientItem);
      });
    });

    describe('addShadow(values)', () => {
      test('Throws exception if no values provided', () => {
        expect(() => cm.addShadow()).toThrow();
      });

      test('Adds a ShadowView using the provided values', () => {
        expect(() => cm.addShadow(shadow)).not.toThrow();
        expect(cm.shadows.get(shadow.id)).toMatchObject(shadow);
        expect(cm.shadows.get(shadow.id)).toBeInstanceOf(ShadowView);
      });
    });

    describe('removeItem(item)', () => {
      let bitem, citem;
      beforeAll(() => {
        bitem = { x: 555, y: 253, id: 50 };
        citem = { x: 1, y: 2, id: 89 };
        cm.addItem(bitem);
        cm.addItem(citem);
      });

      test('Throws exception if no item provided', () => {
        expect(() => cm.removeItem()).toThrow();
      });

      test('Removes the item', () => {
        const i = cm.items.get(item.id);
        expect(() => cm.removeItem(i.toJSON())).not.toThrow();
        expect(cm.items.size).toBe(2);
        expect(cm.items).not.toContain(i);
      });
    });

    describe('removeShadow(shadow)', () => {
      let bshadow, cshadow;
      beforeAll(() => {
        bshadow = { x: 80, y: 90, id: 44 };
        cshadow = { x: 22, y: 5, id: 900 };
        cm.addShadow(bshadow);
        cm.addShadow(cshadow);
      });

      test('Throws exception if no shadow provided', () => {
        expect(() => cm.removeShadow()).toThrow();
      });

      test('Removes the shadow', () => {
        const s = cm.shadows.get(shadow.id);
        expect(() => cm.removeShadow(s.toJSON())).not.toThrow();
        expect(cm.shadows.size).toBe(2);
        expect(cm.shadows).not.toContain(s);
      });
    });

    describe('setup(data)', () => {
      let data;
      beforeAll(() => {
        data = {
          id: 33,
          views: [
            { x: 80, y: 90, id: 44 },
            { x: 22, y: 5, id: 900 },
          ],
          items: [
            { x: 555, y: 253, id: 50 },
            { x: 1, y: 2, id: 89 },
          ],
          color: '#4ab93d',
        };
      });

      test('Throws exception if no data provided', () => {
        expect(() => cm.setup()).toThrow();
      });

      test('Throws exception if data is missing parameters', () => {
        expect(() => cm.setup({ id: 1, views: [] })).toThrow();
        expect(() => cm.setup({ id: 1, items: [] })).toThrow();
        expect(() => cm.setup({ items: [], views: [] })).toThrow();
      });

      test('Does not throw exception if data provided', () => {
        expect(() => cm.setup(data)).not.toThrow();
      });

      test('Adds all the views in the data as shadows', () => {
        data.views.forEach((v) => {
          expect(cm.shadows.has(v.id)).toBe(true);
          const s = cm.shadows.get(v.id);
          expect(s).toMatchObject(v);
        });
      });

      test('Adds all the items in the data', () => {
        data.items.forEach((i) => {
          expect(cm.items.has(i.id)).toBe(true);
          const t = cm.items.get(i.id);
          expect(t).toMatchObject(i);
        });
      });
    });

    describe('updateItem(data)', () => {
      let data;
      beforeAll(() => {
        data = {
          id: item.id,
          x: item.x + 101,
          y: item.y - 73,
        };
        cm.addItem(item);
      });

      test('Throws exception if no data provided', () => {
        expect(() => cm.updateItem()).toThrow();
      });

      test('Does not throw exception when provided with valid data', () => {
        expect(() => cm.updateItem(data)).not.toThrow();
      });

      test('Updates item data to the provided values', () => {
        const i = cm.items.get(item.id);
        expect(i.x).toBe(data.x);
        expect(i.y).toBe(data.y);
      });
    });

    describe('updateShadow(data)', () => {
      let data;
      beforeAll(() => {
        data = {
          id: shadow.id,
          x: shadow.x + 101,
          y: shadow.y - 73,
        };
        cm.addShadow(shadow);
      });

      test('Throws exception if no data provided', () => {
        expect(() => cm.updateShadow()).toThrow();
      });

      test('Does not throw exception when provided with valid data', () => {
        expect(() => cm.updateShadow(data)).not.toThrow();
      });

      test('Updates shadow data to the provided values', () => {
        const s = cm.shadows.get(shadow.id);
        expect(s.x).toBe(data.x);
        expect(s.y).toBe(data.y);
      });
    });
  });
});
