/* global WAMS */
const root = document.createElement('div');
root.id = 'root';
document.querySelector('body').appendChild(root);

class DrawingApp {
  constructor() {
    this.colorMap = {};
    this.widthMap = {};
    this.init();
  }

  init() {
    WAMS.on('render-controls', ({ detail }) => {
      const { color, colorMap, widthMap } = detail;
      this.colorMap = colorMap;
      this.widthMap = widthMap;
      this.renderControls(color);
    });
    WAMS.dispatch('init');
  }

  renderControls(colorName) {
    root.innerHTML = CONTROLS(colorName, this.colorMap, this.widthMap);
    this.initControlsListeners();
  }

  initControlsListeners() {
    const buttons = document.querySelectorAll('button');
    const panButton = document.querySelector('#pan');
    const drawButton = document.querySelector('#draw');
    const colorButton = document.querySelector('#color');
    const widthButton = document.querySelector('#width');
    const widthPicker = document.querySelector('#width-picker');
    const colorPicker = document.querySelector('#color-picker');
    const colorElements = document.querySelectorAll('#color-picker > *');
    const widthElements = document.querySelectorAll('#width-picker > *');

    function chooseControlType(event) {
      const button = event.target.closest('button');
      buttons.forEach((el) => {
        el.classList.remove('active');
      });
      button.classList.add('active');

      const type = button.dataset.type;
      WAMS.dispatch('set-control', { type });
    }

    addClickListener(panButton, chooseControlType);
    addClickListener(drawButton, chooseControlType);

    addClickListener(colorButton, (event) => {
      colorPicker.classList.toggle('show');
      widthPicker.classList.remove('show');
    });

    addClickListener(widthButton, (event) => {
      widthPicker.classList.toggle('show');
      colorPicker.classList.remove('show');
    });

    colorElements.forEach((element) => {
      addClickListener(element, (event) => {
        const color = event.target.dataset.color;
        colorPicker.classList.remove('show');
        colorButton.classList = '';
        colorButton.classList.add(color);
        WAMS.dispatch('set-color', { color });
      });
    });

    widthElements.forEach((element) => {
      addClickListener(element, (event) => {
        const width = event.target.dataset.widthname;
        widthPicker.classList.remove('show');
        WAMS.dispatch('set-width', { width });
      });
    });
  }
}

const CONTROLS = (color, colorMap, widthMap) => `
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
            ${Object.keys(colorMap)
              .map(
                (colorName) => `
                <i class="fas fa-circle ${colorName}" data-color="${colorName}"></i>
            `
              )
              .join('')}
        </div>
        <div id="width-picker">
            ${Object.keys(widthMap)
              .map(
                (widthName) => `
                <i class="fas fa-circle ${widthName}" data-widthName="${widthName}" data-widthValue="${widthMap[widthName]}" ></i>
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
