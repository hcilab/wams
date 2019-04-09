/*
 * Global setup function for use by Jest.
 */

expect.extend({
  toHaveImmutableProperty(received, argument) {
    const descs = Object.getOwnPropertyDescriptor(received, argument);
    const pass = Boolean(descs && !(descs.configurable || descs.writable));
    const not = pass ? 'not ' : '';
    return {
      message: () => {
        const pre = `expected ${received} ${not} to have immutable property `;
        const fix = `'${argument}'`;
        return pre + fix;
      },
      pass:    pass,
    };
  },
});

if (typeof global.CanvasRenderingContext2D !== 'function') {
  const props = [
    'drawImage',
    'beginPath',
    'fill',
    'stroke',
    'clip',
    'isPointInPath',
    'isPointInStroke',
    'createLinearGradient',
    'createRadialGradient',
    'createPattern',
    'createImageData',
    'getImageData',
    'putImageData',
    'setLineDash',
    'getLineDash',
    'closePath',
    'moveTo',
    'lineTo',
    'quadraticCurveTo',
    'bezierCurveTo',
    'arcTo',
    'rect',
    'arc',
    'ellipse',
    'clearRect',
    'fillRect',
    'strokeRect',
    'save',
    'restore',
    'fillText',
    'strokeText',
    'measureText',
    'scale',
    'rotate',
    'translate',
    'transform',
    'setTransform',
    'resetTransform',
    'drawFocusIfNeeded',
    'canvas',
    'mozCurrentTransform',
    'mozCurrentTransformInverse',
    'mozTextStyle',
    'mozImageSmoothingEnabled',
    'globalAlpha',
    'globalCompositeOperation',
    'strokeStyle',
    'fillStyle',
    'filter',
    'imageSmoothingEnabled',
    'lineWidth',
    'lineCap',
    'lineJoin',
    'miterLimit',
    'lineDashOffset',
    'shadowOffsetX',
    'shadowOffsetY',
    'shadowBlur',
    'shadowColor',
    'font',
    'textAlign',
    'textBaseline',
  ];
  class CanvasRenderingContext2D {
    constructor() {
      props.forEach(p => {
        this[p] = jest.fn();
      });
    }
  }

  global.CanvasRenderingContext2D = CanvasRenderingContext2D;
}

global.getPrototypeChainOf = function getPrototypeChainOf(object) {
  const chain = [];
  let proto = object;
  while ((proto = Object.getPrototypeOf(proto)) != null) {
    chain.push(proto);
  }
  return chain;
}

global.getPrototypeChainNamesOf = function getPrototypeChainNamesOf(object) {
  return getPrototypeChainOf(object).map(p => p.constructor.name);
}

