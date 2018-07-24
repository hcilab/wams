/*
 * If Jest will work with client-side code, this file will test out the client
 * side of the WAMS API.
 */

'use strict';

const client = require('../src/client.js');
const ClientViewer = client.ClientViewer;
const ClientItem = client.ClientItem;

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


});

