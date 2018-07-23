/*
 * Author: Michael van der Kamp
 * Date: July, 2018
 * 
 * This file provides a basic implementation of a canvas sequencer library. The
 * purpose of this library is to provide a class which can store and distribute
 * sequences of canvas context instructions. Currently it is configured to only
 * work with a CanvasRenderingContext2D instance, but these capabilities could
 * be expanded to work on other contexts.
 */

'use strict';

const CanvasAtom = (function defineCanvasAtom() {
  const locals = Object.freeze({
    METHOD: 'method',
    PROPERTY: 'property',
  });

  class CanvasAtom {
    constructor(type, value, ...args) {
      this.type = type;
      this.value = value;
      this.args = args;
    }

    execute(context) {
      switch(this.type) {
        case locals.METHOD:
          context[this.value](...this.args);
          break;
        case locals.PROPERTY:
          context[this.value] = this.args[0];
          break;
      }
    }
  }

  Object.entries(locals).forEach( ([p,v]) => {
    Object.defineProperty( CanvasAtom, p, {
      value: v,
      configurable: false,
      enumerable: true,
      writable: false,
    });
  });

  return CanvasAtom;
})();

const CanvasSequencer = (function defineCanvasSequencer() {
  const locals = Object.freeze({
    METHODS: [
      'arc',
      'arcTo',
      'beginPath',
      'bezierCurveTo',
      'clearRect',
      'clip',
      'closePath',
      'createImageData',
      'createLinearGradient',
      'createPattern',
      'createRadialGradient',
      'drawFocusIfNeeded',
      'drawImage',
      'ellipse',
      'fill',
      'fillRect',
      'fillText',
      'getImageData',
      'getLineDash',
      'isPointInPath',
      'isPointInStroke',
      'lineTo',
      'measureText',
      'moveTo',
      'putImageData',
      'quadraticCurveTo',
      'rect',
      'resetTransform',
      'restore',
      'rotate',
      'save',
      'scale',
      'setLineDash',
      'setTransform',
      'stroke',
      'strokeRect',
      'strokeText',
      'transform',
      'translate',
    ],

    PROPERTIES: [
      'fillStyle',
      'filter',
      'font',
      'globalAlpha',
      'globalCompositeOperation',
      'imageSmoothingEnabled',
      'lineCap',
      'lineDashOffset',
      'lineJoin',
      'lineWidth',
      'miterLimit',
      'mozCurrentTransform',
      'mozCurrentTransformInverse',
      'mozImageSmoothingEnabled',
      'mozTextStyle',
      'shadowBlur',
      'shadowColor',
      'shadowOffsetX',
      'shadowOffsetY',
      'strokeStyle',
      'textAlign',
      'textBaseline',
    ],
  });
  
  const symbols = Object.freeze({
    sequence: Symbol(),
    push_seq: Symbol(),
  });

  class CanvasSequencer {
    constructor() {
      this[symbols.sequence] = [];
    }

    [symbols.push_seq](...args) {
      this[symbols.sequence].push(new CanvasAtom(...args));
    }

    execute(context) {
      this[symbols.sequence].forEach( a => a.execute(context) );
    }
  }

  locals.METHODS.forEach( m => {
    Object.defineProperty( CanvasSequencer.prototype, m, {
      value: function pushMethodCall(...args) {
        this[symbols.push_seq](CanvasAtom.METHOD, m, ...args);
      }, 
      writable: false,
      enumerable: true,
      configurable: false,
    });
  });

  locals.PROPERTIES.forEach( p => {
    Object.defineProperty( CanvasSequencer.prototype, p, {
      get() { throw `Invalid canvas sequencer interaction, cannot get ${p}.` },
      set(v) { this[symbols.push_seq](CanvasAtom.PROPERTY, p, v) },
      enumerable: true,
      configurable: false,
    });
  });

  return CanvasSequencer;
})();

if (typeof exports !== 'undefined') {
  exports.CanvasSequencer = CanvasSequencer;
  exports.CanvasAtom = CanvasAtom;
}

