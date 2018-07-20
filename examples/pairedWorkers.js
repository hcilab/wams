/*
 * This is the simplest example, simply showing how an arbitrary number of
 *  users can interact with a shared set of items.
 */

'use strict';

const WAMS = require('../src/server');

const workspace = new WAMS.WorkSpace(
  9003,
  {
    debug: false,
    BGcolor: '#aaaaaa',
    bounds: {
      x: 1000,
      y: 1000,
    },
    clientLimit: 10,
  }
);

workspace.addItem(new WAMS.Item(
  200,
  200,
  200,
  200,
  'Draggable',
  {
    imgsrc: 'monaLisa.png'
  }
));

workspace.addItem(new WAMS.Item(
  400,
  400,
  200,
  200,
  'Draggable',
  {
    imgsrc: 'scream.png'
  }
));

const handleDrag = function(target, client, x, y, dx, dy) {
  if (target.type === 'Draggable') {
    target.moveBy(-dx, -dy);
  }
}

const handleLayout = function(workspace, client) {
  const views = workspace.views;
  const num_views = views.length;

  if (views.length > 0) {
    const prev_view = views[num_views - 1];
    client.moveTo(
      prev_view.right() - 30,
      prev_view.top()
    ); 
  }
}

workspace.attachDragHandler(handleDrag);
workspace.attachLayoutHandler(handleLayout);

workspace.listen();

