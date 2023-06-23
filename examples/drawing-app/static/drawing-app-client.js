/* global WAMS */

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

    panButton.addEventListener('click', chooseControlType);
    drawButton.addEventListener('click', chooseControlType);

    colorButton.addEventListener('click', (event) => {
      colorPicker.classList.toggle('show');
      widthPicker.classList.remove('show');
    });

    widthButton.addEventListener('click', (event) => {
      widthPicker.classList.toggle('show');
      colorPicker.classList.remove('show');
    });

    colorElements.forEach((element) => {
      element.addEventListener('click', (event) => {
        const color = event.target.dataset.color;
        colorPicker.classList.remove('show');
        colorButton.classList = '';
        colorButton.classList.add(color);
        WAMS.dispatch('set-color', { color });
      });
    });

    widthElements.forEach((element) => {
      element.addEventListener('click', (event) => {
        const width = event.target.dataset.widthname;
        widthPicker.classList.remove('show');
        WAMS.dispatch('set-width', { width });
      });
    });
  }
}

// eslint-disable-next-line
let app = null;
document.addEventListener('wams-ready', () => {
  app = new DrawingApp();
});
