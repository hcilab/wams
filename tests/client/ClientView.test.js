/**
 * @jest-environment jsdom
 */

'use strict';

const { View } = require('shared.js');
const ClientView = require('client/ClientView.js');
const ClientModel = require('client/ClientModel.js');

describe('ClientView', () => {
  let context;
  beforeAll(() => {
    context = new CanvasRenderingContext2D();
  });

  describe('constructor(values)', () => {
    test('Creates correct type of object', () => {
      expect(new ClientView(context)).toBeInstanceOf(ClientView);
    });

    test('Uses View defaults', () => {
      expect(new ClientView(context)).toMatchObject(View.DEFAULTS);
    });
  });

  describe('Methods', () => {
    let cv, model;
    beforeAll(() => {
      cv = new ClientView(context);
      model = new ClientModel();
      cv.model = model;
    });

    describe('draw(context)', () => {
      beforeAll(() => {
        cv.width = 500;
        cv.height = 500;
        cv.effectiveWidth = 500;
        cv.effectiveHeight = 500;

        model.addShadow({ x: 80, y: 90, id: 44 });
        model.addShadow({ x: 22, y: 5, id: 900 });
        model.addItem({ x: 555, y: 253, id: 50 });
        model.addItem({ x: 1, y: 2, id: 89 });

        model.items.forEach((i) => (i.draw = jest.fn()));
        model.shadows.forEach((s) => (s.draw = jest.fn()));

        cv.draw();
      });

      test('Aligns the context', () => {
        expect(context.scale).toHaveBeenCalled();
        expect(context.rotate).toHaveBeenCalled();
        expect(context.translate).toHaveBeenCalled();
      });

      test('Draws all of the items', () => {
        model.items.forEach((i) => {
          expect(i.draw).toHaveBeenCalledTimes(1);
        });
      });

      test('Draws all of the shadows', () => {
        if (cv.config.showShadows) {
          model.shadows.forEach((s) => {
            expect(s.draw).toHaveBeenCalledTimes(1);
          });
        } else return undefined;
      });
    });

    describe('resizeToFillWindow()', () => {
      test('Adjusts size of client view to the window size', () => {
        expect(cv.width).not.toBe(window.innerWidth);
        expect(cv.height).not.toBe(window.innerHeight);
        cv.resizeToFillWindow();
        expect(cv.width).toBe(window.innerWidth);
        expect(cv.height).toBe(window.innerHeight);
      });
    });
  });
});
