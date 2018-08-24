/*
 * Test suite for the class.
 *
 * Author: Michael van der Kamp
 * Date: July/August 2018
 */

'use strict';

const ClientItem = require('../../src/client/ClientItem.js');

describe('ClientItem', () => {
  const item = {
    x: 42, 
    y: 43, 
    width: 800, 
    height: 97,
    type: 'booyah', 
    imgsrc: 'img/scream.png', 
    id: 3
  };

  describe('constructor(data)', () => {
    test('Constructs an object of the correct type', () => {
      expect(new ClientItem(item)).toBeInstanceOf(ClientItem);
    });

    test('Throws exception if no data provided', () => {
      expect(() => new ClientItem()).toThrow();
    });

    test('Uses input values, if provided', () => {
      const ci = new ClientItem(item);
      Object.keys(item).forEach( k => {
        expect(ci[k]).toBe(item[k]);
      });
    });

    test('If data has an Id, stamps it immutably onto the item', () => {
      item.id = 4;
      const ci = new ClientItem(item);
      expect(ci).toHaveImmutableProperty('id');
      expect(ci.id).toBe(4);
    });

    test('Creates an image, if data provides an imgsrc', () => {
      const ci = new ClientItem(item);
      expect(ci).toHaveProperty('img');
      expect(ci.img).toBeInstanceOf(Image);
      expect(ci.img.src.endsWith(item.imgsrc)).toBe(true);
    });

    test('Does not create an image, if no imgsrc provided', () => {
      const ci = new ClientItem({x:10,y:12,id:42});
      expect(ci.img).toBeNull();
    });
  });

  describe('draw(context)', () => {
    const ctx = new CanvasRenderingContext2D();

    test('Throws an exception if no context provided', () => {
      const ci = new ClientItem(item);
      expect(() => ci.draw()).toThrow();
    });

    test('If an image is provided, draws an image', () => {
      const ci = new ClientItem(item);
      ci.img.loaded = true;
      expect(() => ci.draw(ctx)).not.toThrow();
      expect(ctx.drawImage).toHaveBeenCalledTimes(1);
      expect(ctx.drawImage).toHaveBeenLastCalledWith(
        ci.img, ci.x, ci.y, ci.width, ci.height
      );
    });
  });
});


