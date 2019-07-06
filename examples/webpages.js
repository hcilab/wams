/*
 * This is a simple example showing how users can interact with a shared set
 *  of items.
 */

'use strict';

const Wams = require('..');
const app = new Wams.Application();

function topbarred(html) {
  return `${'<div>' +
    '<div width="560" height="50" ' +
    'style="background-color:green; height:50px;"></div>'}${
    html
  }</div>`;
}

app.spawnElement(Wams.predefined.items.wrappedElement(
  topbarred('<iframe width="560" height="315" src="https://www.gamefaqs.com" frameborder="0"></iframe>'),
  560,
  50,
  {
    x:        400,
    y:        50,
    width:    560,
    height:   365,
    type:     'video',
    onscale:  Wams.predefined.scale,
    onrotate: Wams.predefined.rotate,
    ondrag:   Wams.predefined.drag,
  }
));

app.spawnElement(Wams.predefined.items.wrappedElement(
  topbarred('<iframe width="560" height="315" src="https://www.xkcd.com" frameborder="0"></iframe>'),
  560,
  50,
  {
    x:        400,
    y:        465,
    width:    560,
    height:   365,
    type:     'video',
    onscale:  Wams.predefined.scale,
    onrotate: Wams.predefined.rotate,
    ondrag:   Wams.predefined.drag,
  }
));

function handleConnect(view) {
  view.onscale = Wams.predefined.scale;
  view.onrotate = Wams.predefined.rotate;
  view.ondrag = Wams.predefined.drag;
}

app.onconnect(handleConnect);
app.listen(9021);

