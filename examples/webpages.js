/*
 * This is a simple example showing how users can interact with a shared set
 *  of items.
 */

'use strict';

const WAMS = require('..');
const app = new WAMS.Application();
const { html } = WAMS.predefined.items;

// function that returns input html wrapped with a top bar
function topbarred(html) {
  return `${
    '<div>' + '<div width="560" height="50" ' + 'style="background-color:green; height:50px;"></div>'
  }${html}</div>`;
}

app.spawn(
  html(
    topbarred('<iframe width="560" height="315" src="https://www.gamefaqs.com" frameborder="0"></iframe>'),
    560,
    50,
    {
      x: 400,
      y: 50,
      width: 560,
      height: 365,
      type: 'video',
      allowScale: true,
      allowRotate: true,
      ondrag: WAMS.predefined.actions.drag,
    }
  )
);

app.spawn(
  html(topbarred('<iframe width="560" height="315" src="https://www.xkcd.com" frameborder="0"></iframe>'), 560, 50, {
    x: 400,
    y: 465,
    width: 560,
    height: 365,
    type: 'video',
    allowScale: true,
    allowRotate: true,
    ondrag: WAMS.predefined.actions.drag,
  })
);

function handleConnect(view) {
  view.allowScale = true;
  view.allowRotate = true;
  view.ondrag = WAMS.predefined.actions.drag;
}

app.onconnect(handleConnect);
app.listen(9021);
