/*
 * Test suite for the Message class.
 */

const Message = require('shared/Message.js');

describe('Message', () => {
  let emitter, reporter;

  beforeEach(() => {
    emitter = { emit: jest.fn() };
    reporter = { report: jest.fn() };
    reporter.report.mockReturnValue(42);
  });

  describe('constructor(type, reporter)', () => {
    test('Throws exception if type is invalid', () => {
      expect(() => new Message()).toThrow();
      expect(() => new Message('disconnect')).toThrow();
    });

    test('Constructs correct type of object', () => {
      let msg;
      expect(() => {
        msg = new Message(Message.CLICK, reporter);
      }).not.toThrow();
      expect(msg).toBeInstanceOf(Message);
      expect(msg.type).toBe(Message.CLICK);
      expect(msg.reporter).toEqual(reporter);
    });
  });

  describe('emitWith(emitter)', () => {
    test('Throws exception if invalid emitter provided', () => {
      const msg = new Message(Message.CLICK, reporter);
      expect(() => msg.emitWith()).toThrow();
      expect(() => msg.emitWith({})).toThrow();
    });

    test('Emits the message using the provided emitter', () => {
      const msg = new Message(Message.CLICK, reporter);
      expect(() => msg.emitWith(emitter)).not.toThrow();
      expect(reporter.report).toHaveBeenCalledTimes(1);
      expect(reporter.report).toHaveBeenLastCalledWith();
      expect(emitter.emit).toHaveBeenCalledTimes(1);
      expect(emitter.emit).toHaveBeenLastCalledWith(Message.CLICK, 42);
    });
  });
});
