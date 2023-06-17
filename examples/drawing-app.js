/*
 * This is an advanced example showing a collaborative drawing application.
 * Several users can connect to an infinite space, they can move around the space
 * and draw on it with different colors and line widths.
 */

const WAMS = require('..');
const path = require('path');
const { actions } = WAMS.predefined;
const { CanvasSequence } = require('canvas-sequencer');

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
    this.router = WAMS.predefined.routing.router();
    this.staticDir = path.join(__dirname, 'client');
    WAMS.predefined.routing.addStaticDirectory(this.router, this.staticDir);
    this.app = new WAMS.Application(
      {
        color: 'white',
        clientScripts: ['https://kit.fontawesome.com/3cc3d78fde.js', 'drawing-app.js'],
        stylesheets: ['./drawing-app.css'],
        title: 'Collaborative Drawing',
      },
      this.router
    );

    this.initialColor = 'red';

    this.initListeners();
  }

  setColor({ color, view }) {
    view.state.color = COLORS[color];
  }

  setWidth({ width, view }) {
    view.state.width = WIDTHS[width];
  }

  initListeners() {
    this.app.on('init', ({ view }) => {
      const color = this.initialColor;
      this.setColor({ color, view });
      view.dispatch('render-controls', { color, listOfColors: COLORS, listOfWidths: WIDTHS });
    });

    this.app.on('set-control', this.updateControlType.bind(this));
    this.app.on('set-color', this.setColor.bind(this));
    this.app.on('set-width', this.setWidth.bind(this));
    this.app.on('connect', this.handleConnect.bind(this));
    this.app.listen(9000);
  }

  draw(event) {
    const color = event.view.state.color || 'black';
    const width = event.view.state.width || 20;
    // const fromX = event.x - event.dx;
    // const fromY = event.y - event.dy;
    const toX = event.x;
    const toY = event.y;
    const line = new CanvasSequence();
    // line.beginPath()
    // line.moveTo(fromX, fromY);
    // line.lineTo(toX, toY);
    // line.strokeStyle = 'blue';
    // line.stroke();

    line.beginPath();
    line.fillStyle = color;
    line.ellipse(toX, toY, width / 2, width / 2, Math.PI / 2, 0, 2 * Math.PI);
    line.fill();
    this.app.workspace.spawnItem({ sequence: line });
  }

  updateControlType({ type, view }) {
    this.controlType = type;
    view.removeAllListeners('drag');
    view.on('drag', type === 'pan' ? actions.drag : this.draw.bind(this));
  }

  handleConnect({ view }) {
    view.on('drag', WAMS.predefined.actions.drag);
    view.on('pinch', WAMS.predefined.actions.pinch);
  }
}

// eslint-disable-next-line
const app = new DrawingApp();
