/*
 * Test suite for the class.
 *
 * Author: Michael van der Kamp
 * Date: July/August 2018
 */

'use strict';

const ClientItem = require('client/ClientItem.js');
const { CanvasSequence } = require('canvas-sequencer');

describe('ClientItem', () => {
  let item, sequence;
  beforeEach(() => {
    item = {
      x: 42,
      y: 43,
      width: 800,
      height: 97,
      type: 'booyah',
      id: 3,
    };

    sequence = new CanvasSequence();
    sequence.fillStyle = 'red';
    sequence.fillRect(0, 0, 100, 200);
    sequence = sequence.toJSON();
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
      Object.keys(item).forEach((k) => {
        expect(ci[k]).toBe(item[k]);
      });
    });

    test('Clones an immutable ID onto the item', () => {
      const ci = new ClientItem(item);
      expect(ci).toHaveImmutableProperty('id');
      expect(ci.id).toBe(3);
    });

    test('Creates a render sequence if one is provided', () => {
      item.sequence = sequence;

      let ci;
      expect(() => (ci = new ClientItem(item))).not.toThrow();
      expect(ci.render).toBeInstanceOf(CanvasSequence);
    });

    test('Does not create a render sequence if none provided', () => {
      const ci = new ClientItem(item);
      expect(ci.render).toBeNull();
    });
  });

  describe('Methods', () => {
    let ci;
    beforeAll(() => {
      ci = new ClientItem(item);
    });

    describe('setRender(sequence)', () => {
      test('Builds an executable render out of a JSON sequence', () => {
        expect(ci.render).toBeNull();
        expect(() => ci.setRender(sequence)).not.toThrow();
        expect(ci.render).toBeInstanceOf(CanvasSequence);
      });
    });

    describe('draw(context)', () => {
      let ctx;
      beforeEach(() => (ctx = new CanvasRenderingContext2D()));

      test('Does nothing if no render sequence provided', () => {
        ci.render = null;
        expect(() => ci.draw()).not.toThrow();
        expect(ctx.save).not.toHaveBeenCalled();
      });

      test('Throws an exception if renderable but no context provided', () => {
        expect(() => ci.draw()).not.toThrow();
      });

      test('If a sequence is available, renders the sequence', () => {
        ci.setRender(sequence);
        expect(() => ci.draw(ctx)).not.toThrow();
        expect(ctx.fillStyle).toBe('red');
        expect(ctx.fillRect).toHaveBeenCalled();
        expect(ctx.fillRect).toHaveBeenLastCalledWith(0, 0, 100, 200);
        expect(ctx.drawImage).not.toHaveBeenCalled();
      });
    });
  });
});
