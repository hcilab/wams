const canvas = document.querySelector('#main');
const WAMS = window.WAMS;

canvas.addEventListener('mousedown', (event) => {
  const eventDescription = { x: event.x, y: event.y };
  console.log(WAMS);
  WAMS.dispatch('mousedown', eventDescription);
});

canvas.addEventListener('click', (event) => {
  const eventDescription = { x: event.x, y: event.y };
  console.log(eventDescription);
  WAMS.dispatch('mouseup', eventDescription);
});
