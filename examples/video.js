/**
 * This examples shows how you can spawn videos in iframes as wams items.
 **/

const WAMS = require('..');
const app = new WAMS.Application({
  color: '#dad1e3',
  title: 'Videos | WAMS',
});

const WIDTH = 560;
const HEIGHT = 365;
const X = 400;

// function that returns input html wrapped with a top bar
const topbarred = (html) =>
  `<div>
    <div 
      width="560" 
      height="50"
      style="background-color:green; height:50px; border: solid black;"
    ></div>
    ${html}
  </div>`;

const iframe = (src) =>
  `<iframe 
    width="560" 
    height="315" 
    src="${src}" 
    frameborder="0" 
    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
    allowfullscreen
  ></iframe>`;

const moonTouchdownVideo = app.spawn(
  WAMS.predefined.items.html(topbarred(iframe('https://www.youtube.com/embed/RONIax0_1ec')), 560, 50, {
    x: X,
    y: 50,
    width: WIDTH,
    height: HEIGHT,
    type: 'item/element',
    lockZ: true,
  })
);
moonTouchdownVideo.on('pinch', WAMS.predefined.actions.pinch);
moonTouchdownVideo.on('rotate', WAMS.predefined.actions.rotate);
moonTouchdownVideo.on('drag', WAMS.predefined.actions.drag);

const falconHeavyVideo = app.spawn(
  WAMS.predefined.items.html(topbarred(iframe('https://www.youtube.com/embed/l5I8jaMsHYk')), 560, 50, {
    x: X,
    y: 465,
    width: WIDTH,
    height: HEIGHT,
    type: 'item/element',
    lockZ: true,
  })
);
falconHeavyVideo.on('pinch', WAMS.predefined.actions.pinch);
falconHeavyVideo.on('rotate', WAMS.predefined.actions.rotate);
falconHeavyVideo.on('drag', WAMS.predefined.actions.drag);

function handleConnect({ view }) {
  // allowing the whole view to
  // be moved around, rotated and scaled
  view.on('pinch', WAMS.predefined.actions.pinch);
  view.on('rotate', WAMS.predefined.actions.rotate);
  view.on('drag', WAMS.predefined.actions.drag);
}

app.on('connect', handleConnect);
app.listen(9000);
