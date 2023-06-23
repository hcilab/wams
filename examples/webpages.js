/*
 * This is a simple example showing how users can interact with a shared set
 *  of items.
 */

'use strict';

const WAMS = require('..');
const app = new WAMS.Application({
  color: '#dad1e3',
  title: 'Webpages | WAMS',
});
const { html } = WAMS.predefined.items;

// function that returns input html wrapped with a top bar
function topbarred(html) {
  return `<div>
      <div
        width="560"
        height="50"
        style="background-color:green; height:50px; border: solid black;"
      ></div>
      ${html}
    </div>`;
}

const gamefaqs = app.spawn(
  html(
    topbarred('<iframe width="560" height="315" src="https://www.gamefaqs.com" frameborder="0"></iframe>'),
    560,
    50,
    {
      x: 400,
      y: 50,
      width: 560,
      height: 365,
      type: 'item/element',
      lockZ: true,
    }
  )
);
gamefaqs.on('pinch', WAMS.predefined.actions.pinch);
gamefaqs.on('rotate', WAMS.predefined.actions.rotate);
gamefaqs.on('drag', WAMS.predefined.actions.drag);

const xkcd = app.spawn(
  html(topbarred('<iframe width="560" height="315" src="https://www.xkcd.com" frameborder="0"></iframe>'), 560, 50, {
    x: 400,
    y: 465,
    width: 560,
    height: 365,
    type: 'item/element',
    lockZ: true,
  })
);
xkcd.on('pinch', WAMS.predefined.actions.pinch);
xkcd.on('rotate', WAMS.predefined.actions.rotate);
xkcd.on('drag', WAMS.predefined.actions.drag);

function handleConnect({ view }) {
  view.on('pinch', WAMS.predefined.actions.pinch);
  view.on('rotate', WAMS.predefined.actions.rotate);
  view.on('drag', WAMS.predefined.actions.drag);
}

app.on('connect', handleConnect);
app.listen(9000);
