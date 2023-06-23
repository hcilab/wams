const WAMS = require('..');
const app = new WAMS.Application({
  color: '#dad1e3',
  title: 'Webpage Sharing | WAMS',
});
const { html } = WAMS.predefined.items;

const OVERLAP = 100;

const styles = {
  bar: `
        background-color: green;
        min-height: 50px;
        width: 100%;
    `,
  wrapper: `
        display: flex;
        flex-direction: column;
        padding: .5rem;
    `,
  frameWrapper: `
        box-shadow: 0 2px 5px rgba(0, 0, 0, .2);
        overflow-y: hidden;
    `,
};

let mainScreen = {};

// function that returns input html wrapped with a bar
function bottomBarred(html) {
  return `
        <div style="${styles.wrapper}">
            <div style="${styles.frameWrapper}">
                ${html}
            </div>
            <div style="${styles.bar}"></div>
        </div>
    `;
}

function spawnIframe(event, url) {
  const iframe = app.spawn(
    html(bottomBarred(`<iframe width="560" height="315" src="${url}" frameborder="0"></iframe>`), 560, 365, {
      x: event.x,
      y: event.y,
      width: 560,
      height: 365,
    })
  );
  iframe.on('drag', handleIframeDrag);
  iframe.on('click', (e) => app.removeItem(e.target));
}

function setLayout(view) {
  if (view.index > 0) {
    view.moveTo(99999 * view.index);
  }
}

function handleConnect({ view }) {
  if (view.index === 0) {
    mainScreen = view;
  }

  setLayout(view);

  view.on('click', (ev) => spawnIframe(ev, 'http://www.example.com'));
}

app.on('connect', handleConnect);
app.listen(9000);

function handleIframeDrag(event) {
  if (event.view.index !== 0 && event.target.y <= 0) {
    event.target.moveTo(mainScreen.x, mainScreen.bottomLeft.y - OVERLAP);
  }
  WAMS.predefined.actions.drag(event);
}
