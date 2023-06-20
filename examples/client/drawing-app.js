/* global WAMS */
const root = document.createElement('div');
root.id = 'root';
document.querySelector('body').appendChild(root);

class DrawingApp {
  constructor() {
    this.colors = {};
    this.widths = {};
    this.states = ['pan', 'draw'];

    this.init();
  }

  init() {
    WAMS.dispatch('init');
    WAMS.on('render-controls', ({ detail }) => {
      const { color, listOfColors, listOfWidths } = detail;
      this.colors = listOfColors;
      this.widths = listOfWidths;
      this.renderControls(color);
    });
  }

  renderControls(colorName) {
    root.innerHTML = CONTROLS(colorName, this.colors, this.widths);
    this.initControlsListeners();
  }

  initControlsListeners() {
    const buttons = document.querySelectorAll('button');
    const panBtn = document.querySelector('#pan');
    const drawBtn = document.querySelector('#draw');
    const colorBtn = document.querySelector('#color');
    const widthBtn = document.querySelector('#width');
    const widthPicker = document.querySelector('#width-picker');
    const colorPicker = document.querySelector('#color-picker');
    const colors = document.querySelectorAll('#color-picker > *');
    const widths = document.querySelectorAll('#width-picker > *');

    function chooseControlType(event) {
      const button = event.target.closest('button');
      buttons.forEach((el) => {
        el.classList.remove('active');
      });
      button.classList.add('active');

      const type = button.dataset.type;
      WAMS.dispatch('set-control', { type });
    }

    addClickListener(panBtn, (event) => {
      chooseControlType(event);
    });

    addClickListener(drawBtn, (event) => {
      chooseControlType(event);
    });

    addClickListener(colorBtn, (event) => {
      colorPicker.classList.toggle('show');
      widthPicker.classList.remove('show');
    });

    addClickListener(widthBtn, (event) => {
      widthPicker.classList.toggle('show');
      colorPicker.classList.remove('show');
    });

    colors.forEach((el) => {
      addClickListener(el, (event) => {
        const color = event.target.dataset.color;
        colorPicker.classList.remove('show');
        colorBtn.classList = '';
        colorBtn.classList.add(color);
        WAMS.dispatch('set-color', { color });
      });
    });

    widths.forEach((el) => {
      addClickListener(el, (event) => {
        const width = event.target.dataset.widthname;
        widthPicker.classList.remove('show');
        WAMS.dispatch('set-width', { width });
      });
    });
  }
}

const CONTROLS = (color, colors, widths) => `
<div id="controls">
    <ul class="control-buttons">
        <button id="pan" class="active" data-type="pan">
            <i class="far fa-hand-paper"></i>
        </button>
        <button id="draw" data-type="draw">
            <i class="fas fa-pencil-alt"></i>
        </button>
        <button id="color" class="${color}" data-type="color">
            <i class="fas fa-circle"></i>
        </button>
        <button id="width" class="${color}" data-type="color">
            <div class="line line-thin"></div>
            <div class="line line-medium"></div>
            <div class="line line-thick"></div>
        </button>
        <div id="color-picker">
            ${Object.keys(colors)
              .map(
                (colorName) => `
                <i class="fas fa-circle ${colorName}" data-color="${colorName}"></i>
            `
              )
              .join('')}
        </div>
        <div id="width-picker">
            ${Object.keys(widths)
              .map(
                (widthName) => `
                <i class="fas fa-circle ${widthName}" data-widthName="${widthName}" data-widthValue="${widths[widthName]}" ></i>
            `
              )
              .join('')}
        </div>
    </ul>
</div>
`;

/**
 * Helper function to attach a click and touch events to an element.
 *
 * Natively, browsers on touch devices emulate click events, but
 * WAMS intercepts this emulation, hence the need for separate listeners.
 *
 * @param {HTMLElement} element
 * @param {function} callback
 */
function addClickListener(element, callback) {
  element.addEventListener('click', callback);
}

// eslint-disable-next-line
const app = new DrawingApp();
