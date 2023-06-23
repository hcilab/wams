/* global WAMS */
const root = document.createElement('div');
root.id = 'root';
document.querySelector('body').appendChild(root);

class DrawingApp {
  constructor() {
    this.initControlsListeners();
  }

  initControlsListeners() {
    const buttons = document.querySelectorAll('.control-buttons > button.tool');
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
let app = null;
document.addEventListener('wams-ready', () => {
  app = new DrawingApp();
});
