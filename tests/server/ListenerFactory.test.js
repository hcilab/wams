/* 
 * Test suite for ListenerFactory object.
 *
 * Author: Michael van der Kamp
 * Date: July/August 2018
 */

'use strict';

const ListenerFactory = require('../../src/server/ListenerFactory.js');
const WorkSpace = require('../../src/server/WorkSpace.js');

describe('ListenerFactory Object', () => {
  const ws = new WorkSpace();
  test('Throws exception if used with "new" operator', () => {
    expect(() => new ListenerFactory()).toThrow();
  });

  describe('.build(type, listener, workspace)', () => {
    test('Throws exception if no arguments provided', () => {
      expect(() => ListenerFactory.build()).toThrow();
    });

    test('Throws exception if invalid event type supplied', () => {
      expect(() => ListenerFactory.build('resize')).toThrow();
    });

    describe.each([['click'],['drag'],['layout'],['scale']])('%s', (s) => {
      test('Will throw if listener is invalid', () => {
        expect(
          () => fn = ListenerFactory.build(s, 5, ws)
        ).toThrow();
      });

      test('Returns a function', () => {
        expect(
          ListenerFactory.build(s, jest.fn(), ws)
        ).toBeInstanceOf(Function);
      });

      test('Calls the listener', () => {
        const handler = jest.fn();
        const listener = ListenerFactory.build(s, handler, ws);
        const vs = ws.spawnView();
        expect(() => listener(vs,1,2,3,4)).not.toThrow();
        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler.mock.calls[0][0]).toBe(vs);
      });
    });
  });
});


