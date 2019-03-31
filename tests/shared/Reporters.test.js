/*
 * Test suite for Reporters for the WAMS application.
 *
 * Author: Michael van der Kamp
 * Date: July / August 2018
 */

'use strict';

const Reporters = require('shared/Reporters.js');
const {
  Item,
  View,
  MouseReporter,
  ScaleReporter,
  RotateReporter,
  FullStateReporter,
} = Reporters;

describe('Reporters', () => {
  describe.each(Object.keys(Reporters))('%s', name => {
    const Reporter = Reporters[name];
    let instance;
    let property;

    test('Is correctly built as a Reporter', () => {
      expect(Reporter.prototype).toHaveProperty('report');
      expect(Reporter.prototype.report).toBeInstanceOf(Function);
      expect(Reporter.prototype).toHaveProperty('assign');
      expect(Reporter.prototype.assign).toBeInstanceOf(Function);
    });

    test('Can be instantiated', () => {
      expect(() => instance = new Reporter()).not.toThrow();
      expect(instance).toBeInstanceOf(Reporter);
    });

    test('assign() works', () => {
      property = Object.keys(instance).find(k => {
        return typeof instance[k] !== 'function';
      });
      expect(() => instance.assign({ [property]: 42, bogus: 11 })).not.toThrow();
      expect(instance[property]).toBe(42);
      expect(instance.bogus).toBeUndefined();
    });

    test('report() works', () => {
      let report;
      expect(() => report = instance.report()).not.toThrow();
      expect(report[property]).toBe(42);
      expect(report.bogus).toBeUndefined();
    });
  });
});

