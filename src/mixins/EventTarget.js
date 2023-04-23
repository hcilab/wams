'use strict';


const EventTarget = (superclass) => class EventTarget extends superclass {
  constructor(...args) {
    super(...args);

    /**
     * Event listeners. Maps string events names to arrays of functions.
     * Functions will be called with two arguments: the event object, and the
     * view object.
     *
     * Handlers can also be connected directly as "onX" properties of the
     * object, however only one handler can be connected per event type in this
     * manner.
     *
     * @type {object}
     */
    this.listeners = {};
  }

  /**
   * Call any listeners and the callback if it exists for the given event.
   *
   * @param {string} event name of the event.
   * @param {object} payload argument to pass to the event handler.
   */
  handleEvent(event, payload) {
    console.debug(`handleEvent: "${event}"`);
    const callback_name = `on${event}`;
    if (this[callback_name]) this[callback_name](payload);
    if (this.listeners[event]) this.listeners[event].forEach((listener) => listener(payload));
  }

  /**
   * Add a listener for the given event.
   *
   * @param {string} event name of the event.
   * @param {function} listener function to call when the event is dispatched.
   */
  addEventListener(event, listener) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(listener);
  }

  /**
   * Remove a listener for the given event.
   *
   * @param {string} event name of the event.
   * @param {function} listener function to call when the event is dispatched.
   * @returns {boolean} true if the listener was removed, false if it was not
   */
  removeEventListener(event, listener) {
    if (!this.listeners[event]) return false;
    const index = this.listeners[event].indexOf(listener);
    if (index === -1) return false;
    this.listeners[event].splice(index, 1);
    return true;
  }
}

module.exports = EventTarget
