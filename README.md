# WAMS: Workspaces Across Multiple Surfaces

[![dependencies Status](
https://david-dm.org/nick-baliesnyi/wams/status.svg)](
https://david-dm.org/nick-baliesnyi/wams)
[![devDependencies Status](
https://david-dm.org/nick-baliesnyi/wams/dev-status.svg)](
https://david-dm.org/nick-baliesnyi/wams?type=dev)
[![Maintainability](https://api.codeclimate.com/v1/badges/025f89d6de0c6677d142/maintainability)](https://codeclimate.com/github/nick-baliesnyi/wams/maintainability)

## Contents

* [Installation](#installation)
* [Examples](#examples)
* [Walkthrough](#walkthrough)
  * [Hello world](#hello-world)
  * [Multi-screen Hello world](#multi-screen-hello-world)
  * [Set up your application](#set-up-your-application)
  * [General Configuration](#general-configuration-of-your-app)
  * [Basics](#basics)
  * [Polygons](#polygons)
  * [Images](#images)
  * [HTML](#html)
  * [Interactivity](#interactivity)
  * [Static resources](#static-resources)
  * [Connections](#connections)
  * [Advanced](#advanced)
    * [Custom items](#custom-items)
    * [Custom events](#custom-events)
    * [Interaction rights](#interaction-rights)
    * [Grouped items](#grouped-items)

## Installation

You will need to install [node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm). 
Once they are installed, go to your app folder, where you want to install `wams` and run the following commands:

```bash
git clone https://github.com/nick-baliesnyi/wams.git
cd wams
npm install
```

## Getting started

The easiest way to get started is to follow the [Walkthrough](#walkthrough) tutorial below. More advanced users might want to check the [code documentation](https://nick-baliesnyi.github.io/wams/) and the [examples](#examples). For a taste on how WAMS works, check the [live demo section](#live-demo).

## Examples

To try out the examples, go to `examples/` and run as follows:

```bash
node examples/[EXAMPLE_FILENAME]

## For example:

node examples/polygons.js
```

## Live Demo
The [live demo](https://wams-player-demo.herokuapp.com/) is an example of a video-player with a distributed user interface. First, the player controls are displayed on the screen with the video. Go to the url with a second device or browser, and as a second view is connected, the controls are automatically moved to that view. 

To check out the code of the live demo, see `examples/video-player.js`

## Walkthrough

This walkthrough is a friendly guide on how to use most WAMS features. For more details, see [code documentation](https://nick-baliesnyi.github.io/wams/).

> **Note** The examples on this page use ES2015 (ES6) JavaScript syntax like `const` variables and object desctructuring. If you are not familiar with ES2015 features, you can [read](https://webapplog.com/es6/) about them first.


### Set up your application

1. In the app folder, [install](#installation) WAMS, if you haven't already
2. Create an **app.js** file
3. In this file, include WAMS and initialize the application
```javascript

const WAMS = require('./wams');
const app = new WAMS.Application();
app.listen(3500); // this starts the app on port 3500, you can use any port
```

Now, you can run your first WAMS application by executing:
```bash
node app.js
```

And you can connect to the app using the address in the output.

### Hello world

Let's now make your first WAMS app do something. Add the following code just before the last line:
```javascript
const { square } = WAMS.predefined.items;
// ES2015 object destructuring
// same as `const square = WAMS.predefined.items.square;`
app.spawn(square(200, 200, 100, 'green'));
```

This code creates a green square on the canvas with coordinates `{ x: 200, y: 200 }` and a side of `100`.

### Multi-screen Hello world
Here is a simple example to show how several screens work with WAMS.

This example will:
- spawn a draggable square
- position connected screens in a line.

Put this code to your **app.js** file:
```javascript
const WAMS = require('./wams');
const app = new WAMS.Application();

const { square } = WAMS.predefined.items;
const { line } = WAMS.predefined.layouts;

app.spawn(square(200, 200, 100, 'green', {
  allowDrag: true,
}));

const linelayout = line(300); // 300px overlap betweens views
function handleConnect(view, device) {
  view.onclick = spawnSquare;
  linelayout(view, device);
}

app.onconnect(handleConnect);
app.listen(3500);
```

_Don't worry if the code doesn't make sense to you yet. The walkthrough will explain all the features used in it._

The square can now be moved around and seen by multiple screens with less than 20 lines of code 🎉

> To try a more complex multi-screen gestures example (gestures that span multiple screens), check out `examples/shared-polygons.js` 


### General Configuration of your app

The application can be configured through some options.

Below is the full list of possible options with example values.

```javascript
const app = new WAMS.Application({
  color:                  'white',          // background color of the app's canvas
  clientLimit:            2,                // maximum number of devices that can connect to the app
  clientScripts:          ['script.js'],    // javascript scripts (relative paths or URLs) to include by the browser
  stylesheets:            ['styles.css'],   // css styles to include by the browser
  shadows:                true,             // show shadows of other devices
  staticDir:              path.join(__dirname, 'static'), // path to directory for static files, will be accessible at app's root
  status:                 true,             // show information on current view, useful for debugging
  title:                  'Awesome App',    // page title  
  useMultiScreenGestures: true,             // enable multi-screen gestures
});
```

You can substitute `const app = new Wams.Application();` in your code with the code above to play with different options. 

### Basics

A WAMS app is made of **items**. There are several predefined items (see in the [code documentation](https://nick-baliesnyi.github.io/wams/module-predefined.items.html)): 

- `rectangle`
- `square`
- `polygon`
- `image`
- `html`

Most of the items (except `html`) are used on HTML **canvas**, which is the core of WAMS (i.e., in WAMS everything is drawn on HTML canvas, although for the most part, you do not need to know about this). 

You have already seen `square` used in the Hello world example above. Now let's look at some other items.

### Polygons

```javascript
// application setup omitted here
// and in following examples

const { polygon } = WAMS.predefined.items;

const points = [
  { x: 0, y: 0 },
  { x: 50, y: 0 },
  { x: 25, y: 50 },
];

app.spawn(polygon(points, 'green', {
  x: 500, y: 100,
}));
```

Polygons are built using an array of relative points. For a random set of points, you can use `randomPoints` method from `Wams.predefined.utilities` (see in [code documentation](https://nick-baliesnyi.github.io/wams/module-predefined.utilities.html#.randomPoints)). 

For example:
```javascript
const { randomPoints } = WAMS.predefined.utilities;
const { polygon } = WAMS.predefined.items;

const points = randomPoints(4);

app.spawn(polygon(points, 'green', {
  x: 500, y: 100,
}));
```



### Images

To use images, you first need to set up a path to the [static directory](#static-resources).

```javascript
const app = WAMS.Application({
  staticDir: path.join(__dirname, './images') 
})

const { image } = WAMS.predefined.items;
app.spawn(image('monaLisa.jpg', {
  width: 200, height: 350,
  x: 300, y: 300,
}));
```

Make sure to include __width__ and __height__.

> **Example** To see a great example of using images, check out `examples/card-table.js`

### HTML
If you need more control over styling than a canvas provides, or you would like to use `iframe`, `audio`, `video` or other browser elements, WAMS also supports spawning **HTML** items.

```javascript
const { html } = WAMS.predefined.items;

app.spawn(html('<h1>Hello world!</h1>', 200, 100, {
  x: 300, y: 100,
}));
```

The code above will spawn a wrapped `h1` element with width of `200` and height of `100`, positioned at `{ x: 300, y: 100 }`.

### Scale and Rotation

You can set initial scale and rotation of an item:

```javascript
app.spawn(polygon(points, 'green', {
  x: 500, y: 100,
  scale: 2,
  rotation: Math.PI,
}));
```

> **Note** Rotation is done around the top left corner and is defined in radians (Pi = 180 deg)


### Interactivity

> **Note** An item must have its coordinates, width and height defined to be interactive

Let's get back to our Hello world example with a green square. Just a static square is not that interesting, though. Let's make it **draggable**:
```javascript
...
app.spawn(square(200, 200, 100, 'green', {
  allowDrag: true,
}));
...
``` 
This looks much better. Now let's remove the square when you **click** on it. _To remove an item, use WAMS' `removeItem` method._

```js
...
  allowDrag: true,
  onclick: handleClick,
}));

function handleClick(event) {
  app.removeItem(event.target)
}
...
```


Another cool interactive feature is **rotation**. To rotate an item, first add the `allowRotate` property and then grab the item with your mouse and hold **Control** key. 
```js
...
  allowDrag: true,
  onclick: handleClick,
  allowRotate: true,
}));
...
```

You can also listen to **swipe** events on items (hold the item, quickly move it and release). To do that, add the `onswipe` handler. 
```js
...
  onswipe: handleSwipe,
}));

function handleSwipe(event) {
  console.log(`Swipe registered!`);
  console.log(`Velocity: ${event.velocity}`);
  console.log(`Direction: ${event.direction}`);
  console.log(`X, Y: ${event.x}, ${event.y}`);
}
...
```

To move an item, you can use `moveBy` and `moveTo` item methods:

```js
app.spawn(image('images/monaLisa.jpg', {
  width: 200, height: 300,
  onclick: handleClick,
}))

function handleClick(event) {
  event.target.moveBy(100, -50);
}
```

Both methods accept `x` and `y` numbers that represent a vector (for `moveBy`) or the final position (for `moveTo`).

_You can add event handlers to all WAMS items._

### Static resources

Often times, you want to use images, run custom code in the browser, or add CSS stylesheets. 

To do that, first **set up a path to the static directory:**
```javascript
const path = require('path');

const app = new WAMS.Application({
  staticDir: path.join(__dirname, './assets'),
});
```

This makes files under the specified path available at the root URL of the application. For example, if you have the same configuration as above, and there is an `image.png` file in the `assets` folder, it will be available at `http(s)://<app-url>/image.png`

- To run code in the browsers that use your app, create a **.js** file in your app _static directory_ and include it in the application config:

```javascript
const app = new WAMS.Application({
  clientScripts: ['js/awesome-script.js'],
  staticDir: path.join(__dirname, 'assets'),
});
```
The scripts will be automatically loaded by the browsers.

- To add CSS stylesheets:

```javascript
const app = new WAMS.Application({
  stylesheets: ['css/amazing-styles.css'],
  staticDir: path.join(__dirname, 'assets'),
});
```
The stylesheets will be automatically loaded by the browsers.



### Connections

WAMS manages all connections under the hood, and provides helpful methods to react on **connection-related events**:

- `onconnect` – called each time a view connects to a WAMS application
- `ondisconnect` – called when a view disconnects

Both methods accept a callback function, where you can act on the event. The callback function gets these arguments:

- `view` – current device's view object. Stores view's information and allows to locate, move, rescale the view
- `device` – physical position of current device
- `group` – server view group, used for multi-device gestures

Setting an `onconnect` callback  is often used to change the scale, rotation or position of a device. You can also set `onclick`, `allowDrag`, `allowRotate` and `allowScale` properties for different views. Same as with items, you can `moveBy` and `moveTo` views.

Combining view event handlers and methods, you can build complex layouts based on view's index. WAMS has predefined layouts that you can use, such as `table` and `row`. Here's how you can use them:

```js
const { table } = WAMS.predefined.layouts;

const overlap = 200; // 200px overlap between views
const setTableLayout = table(overlap); 

function handleLayout(view) {
  setTableLayout(view);
}

app.onconnect(handleLayout);
```



## Advanced

When building more complex applications, sometimes you might want to have more flexibility than predefined items and behaviors provide. 

The following sections show how to go beyond that.

### Custom items

To spawn a custom item, use `CanvasSequence`. It allows to create a custom sequence of canvas actions and you can use most of the HTML Canvas methods as if you are writing regular canvas code.

The following sequence draws a smiling face item:

```js
function smileFace(x, y) {
    const sequence = new WAMS.CanvasSequence();

    sequence.beginPath();
    sequence.arc(75, 75, 50, 0, Math.PI * 2, true); // Outer circle
    sequence.moveTo(110, 75);
    sequence.arc(75, 75, 35, 0, Math.PI, false);  // Mouth (clockwise)
    sequence.moveTo(65, 65);
    sequence.arc(60, 65, 5, 0, Math.PI * 2, true);  // Left eye
    sequence.moveTo(95, 65);
    sequence.arc(90, 65, 5, 0, Math.PI * 2, true);  // Right eye
    sequence.stroke();
    
    return { sequence }
}


app.spawn(smileFace(900, 300));
```

You can add interactivity to a custom item the same way as with predefined items. However, you first need to add a _hitbox_ to the item:

```javascript
function customItem(x, y, width, height) {
  const hitbox = new WAMS.Rectangle(width, height, x, y);
  const allowDrag = true;

  const sequence = new WAMS.CanvasSequence();
  sequence.fillStyle = 'green';
  sequence.fillRect(x, y, width, height);

  return { hitbox, sequence, allowDrag, }
}
```

A hitbox can be made from `WAMS.Rectangle` or `WAMS.Polygon2D`.

`WAMS.Polygon2D` accepts an array of points – vertices of the resulting polygon.

### Custom events

Sometimes, you would like to tell devices to execute client-side code at a specific time. Or you would like to communicate some client-side event to the server. To allow that, WAMS provides **custom events**.

##### From Client to Server

Let's say we would like to send a message from the client to the server. WAMS methods are exposed to the client via the global `WAMS` object.


To **dispatch a server event**, use `WAMS.dispatch()` method:

```javascript
// client.js

WAMS.dispatch('my-message', { foo: 'bar' });
```

This dispatches a custom event to the server called `my-message` and sends a payload object.

To **listen to this event on the server**, use `app.on()` method:

```javascript
// app.js

app.on('my-message', handleMyMessage);

function handleMyMessage(data) {
  console.log(data.foo); // logs 'bar' to the server terminal
}
```

##### From Server to Client

To **dispatch a client event** from the server, use `app.dispatch()` method.

```javascript
// app.js

app.dispatch('my-other-message', { bar: 'foo' });
```

To **listen to this event on the client**, use `WAMS.on()` method:

```javascript
// client.js

WAMS.on('my-other-message', handleMyOtherMessage);

function handleMyOtherMessage(data) {
  console.log(data.bar); // logs 'foo' to the browser console
}
```

*Under the hood*, client-side events are implemented with the DOM's [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent). If you want to trigger a WAMS client event _on the client_, you can dispatch a custom event on the document element.

### Interaction rights

To give different views different rights for interacting with items, use `view.index` to differentiate between connected devices.

> A view is assigned the lowest free `index`, starting with 0. When a view with lower index disconnects, other connected views' indices stay the same.

For example, let's say we are making a card game and would like to only allow a card owner to flip it.

To do that, first we'll add an index to the card item to show who its owner is.

```javascript
// during creation
let card = app.spawn(image(url, {
  /* ... */
  owner: 1,
}))

// or later
card.owner = 1;
```

The `owner` property does not have a special meaning. You can use any property of any type.

Now, we will only flip the card if the event comes from the card owner:


```javascript
function flipCard(event) {
  if (event.view.index !== event.target.owner) return; 

  const card = event.target;
  const imgsrc = card.isFaceUp ? card_back_path : card.face;
  card.setImage(imgsrc);
  card.isFaceUp = !card.isFaceUp;
}
```



### Grouped items

Sometimes you would like to spawn several items and then move or drag them together. To do that easily, you can use the `createGroup` method (see in the [code documentation](https://nick-baliesnyi.github.io/wams/module-server.Application.html#createGroup)):

```javascript
const items = [];

items.push(app.spawn(html('<h1>hello world</h1>', 300, 100, {
  x: 300,
  y: 300,
})));

items.push(app.spawn(square(100, 100, 200, 'yellow')));

items.push(app.spawn(square(150, 150, 200, 'blue')));

const group = app.createGroup({
  items,
  allowDrag: true,
});

group.moveTo(500, 300);
```
