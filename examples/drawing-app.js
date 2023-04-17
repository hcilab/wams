/*
 * This is an advanced example showing a collaborative drawing application.
 * Several users can connect to an infinite space, they can move around the space
 * and draw on it with different colors and line widths.
 */

const WAMS = require('..');
const path = require('path');
const { actions } = WAMS.predefined;

const COLORS = {
  red: '#D12C1F',
  orange: '#EF9135',
  yellow: '#FBEE4F',
  green: '#377F34',
  blue: '#1E4CF5',
  grey: '#808080',
  black: '#000',
};

const WIDTHS = {
  thin: 10,
  medium: 20,
  thick: 40,
};

class DrawingApp {
  constructor() {
    this.app = new WAMS.Application({
      color: 'white',
      clientScripts: ['https://kit.fontawesome.com/3cc3d78fde.js', 'drawing-app.js'],
      stylesheets: ['./drawing-app.css'],
      title: 'Collaborative Drawing',
      staticDir: path.join(__dirname, './client'),
    });

    this.initialColor = 'red';

    this.initListeners();
  }

  setColor(color, view) {
    view.state.color = COLORS[color];
  }

  setWidth(width, view) {
    view.state.width = WIDTHS[width];
  }

  initListeners() {
    this.app.on('init', (data, view) => {
      const color = this.initialColor;
      this.setColor(color, view);
      view.dispatch('render-controls', { color, listOfColors: COLORS, listOfWidths: WIDTHS });
    });

    this.app.on('set-control', (type, view) => {
      this.updateControlType(type, view);
    });

    this.app.on('set-color', (color, view) => {
      this.setColor(color, view);
    });

    this.app.on('set-width', (width, view) => {
      this.setWidth(width, view);
    });

    this.app.onconnect(this.handleConnect.bind(this));
    this.app.listen(8080);
  }

  updateControlType(type, view) {
    this.controlType = type;
    view.ondrag = type === 'pan' ? actions.drag : actions.draw;
  }

  handleConnect(view) {
    view.ondrag = WAMS.predefined.actions.drag;
    view.onpinch = WAMS.predefined.actions.zoom;
  }
}

// eslint-disable-next-line
const app = new DrawingApp();
