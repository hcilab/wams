/*
 * This is an advanced example showing a collaborative drawing application.
 * Several users can connect to an infinite space, they can move around the space
 * and draw on it with different colors and line widths.
 */

const WAMS = require('..');
const path = require('path');
const { actions, items } = WAMS.predefined;
const { CanvasSequence } = require('canvas-sequencer');

const COLOR_MAP = {
  red: '#D12C1F',
  orange: '#EF9135',
  yellow: '#FBEE4F',
  green: '#377F34',
  blue: '#1E4CF5',
  grey: '#808080',
  black: '#000',
};

const WIDTH_MAP = {
  thin: 10,
  medium: 20,
  thick: 40,
};

class DrawingApp {
  constructor() {
    this.app = new WAMS.Application({
      applySmoothing: false,
      color: 'white',
      clientScripts: ['https://kit.fontawesome.com/3cc3d78fde.js', 'drawing-app.js'],
      stylesheets: ['./drawing-app.css'],
      title: 'Collaborative Drawing',
    });
    this.app.addStaticDirectory(path.join(__dirname, 'client'));

    this.initialColor = 'red';
    this.viewPencilColors = {};
    this.viewPencilWidths = {};
    this.boundDraw = this.draw.bind(this);
  }

  setColor({ color, view }) {
    this.viewPencilColors[view] = COLOR_MAP[color];
  }

  setWidth({ width, view }) {
    this.viewPencilWidths[view] = WIDTH_MAP[width];
  }

  initListeners() {
    this.app.on('init', ({ view }) => {
      const color = this.initialColor;
      this.setColor({ color, view });
      view.dispatch('render-controls', { color, colorMap: COLOR_MAP, widthMap: WIDTH_MAP });
    });

    this.app.on('set-control', this.updateControlType.bind(this));
    this.app.on('set-color', this.setColor.bind(this));
    this.app.on('set-width', this.setWidth.bind(this));
    this.app.on('connect', this.handleConnect.bind(this));
  }

  draw(event) {
    const color = this.viewPencilColors[event.view] || 'black';
    const width = this.viewPencilWidths[event.view] || 20;
    const fromX = event.x - event.dx;
    const fromY = event.y - event.dy;
    const toX = event.x;
    const toY = event.y;
    this.app.workspace.spawnItem(
      items.line(
        toX - fromX, // X length of line
        toY - fromY, // Y length of line
        width,
        color,
        { x: fromX, y: fromY }
      )
    );
  }

  updateControlType({ type, view }) {
    this.controlType = type;
    view.removeAllListeners('drag');
    if (type === 'pan') {
      view.on('drag', actions.drag);
      view.on('pinch', actions.pinch);
      view.off('drag', this.boundDraw);
    } else {
      view.off('drag', actions.drag);
      view.off('pinch', actions.pinch);
      view.on('drag', this.boundDraw);
    }
  }

  handleConnect({ view }) {
    view.on('drag', actions.drag);
    view.on('pinch', actions.pinch);
  }
}

// eslint-disable-next-line
const app = new DrawingApp();
app.initListeners();
app.app.listen(9000);
