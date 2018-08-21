/*
 * Global setup function for use by Jest.
 */

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
