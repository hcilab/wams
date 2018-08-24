/*
 * Test suite for the class.
 *
 * Author: Michael van der Kamp
 * Date: July/August 2018
 */

'use strict';

const ClientItem = require('../../src/client/ClientItem.js');
const { CanvasBlueprint, CanvasSequencer } = require('canvas-sequencer');

describe('ClientItem', () => {
  let item; 
  beforeEach(() => item = {
    x: 42, 
    y: 43, 
    width: 800, 
    height: 97,
    type: 'booyah', 
    imgsrc: 'img/scream.png', 
    id: 3
  });

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

    test('Clones an immutable ID onto the item', () => {
      const ci = new ClientItem(item);
      expect(ci).toHaveImmutableProperty('id');
      expect(ci.id).toBe(3);
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

    test('Creates a blueprint if one is provided', () => {
      const bp = new CanvasBlueprint();
      bp.fillStyle = 'red';
      bp.fillRect(0,0,100,200);
      item.blueprint = bp.toJSON();

      let ci;
      expect(() => ci = new ClientItem(item)).not.toThrow();
      expect(ci.blueprint).toBeInstanceOf(CanvasBlueprint);
    });

    test('Does not create a blueprint if none provided', () => {
      const ci = new ClientItem(item);
      expect(ci.blueprint).toBeFalsy();
    });

    test('Builds the sequence if a blueprint was provided', () => {
      const bp = new CanvasBlueprint();
      bp.fillStyle = 'red';
      bp.fillRect(0,0,100,200);
      item.blueprint = bp.toJSON();

      const ci = new ClientItem(item);
      expect(ci.sequence).toBeInstanceOf(CanvasSequencer);
    });

    test('Does not build a sequence if no blueprint provided', () => {
      const ci = new ClientItem(item);
      expect(ci.sequence).toBeFalsy();
    });
  });

  describe('draw(context)', () => {
    let ctx;
    beforeEach(() => ctx = new CanvasRenderingContext2D());

    test('Throws an exception if no context provided', () => {
      const ci = new ClientItem(item);
      expect(() => ci.draw()).toThrow();
    });

    test('If a sequence is available, renders the sequence', () => {
      const bp = new CanvasBlueprint();
      bp.fillStyle = 'red';
      bp.fillRect(0,0,100,200);
      item.blueprint = bp.toJSON();
      const ci = new ClientItem(item);
      expect(() => ci.draw(ctx)).not.toThrow();
      expect(ctx.fillStyle).toBe('red');
      expect(ctx.fillRect).toHaveBeenCalled();
      expect(ctx.fillRect).toHaveBeenLastCalledWith(0,0,100,200);
      expect(ctx.drawImage).not.toHaveBeenCalled();
    });

    test('If no sequence, but an image is provided, draws an image', () => {
      const ci = new ClientItem(item);
      ci.img.loaded = true;
      expect(() => ci.draw(ctx)).not.toThrow();
      expect(ctx.drawImage).toHaveBeenCalledTimes(1);
      expect(ctx.drawImage).toHaveBeenLastCalledWith(
        ci.img, ci.x, ci.y, ci.width, ci.height
      );
    });

    test('If no sequence or image is available, draws a blank rect', () => {
      const ci = new ClientItem(item);
      expect(() => ci.draw(ctx)).not.toThrow();
      expect(ctx.fillRect).toHaveBeenCalled();
      expect(ctx.fillRect).toHaveBeenLastCalledWith(
        ci.x, ci.y, ci.width, ci.height
      );
    });

  });
});


