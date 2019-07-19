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
  * [Set up your application](#set-up-your-application)
  * [Configuration](#configuration)
  * [Basics](#basics)
  * [Polygons](#polygons)
  * [Images](#images)
  * [HTML](#html)
  * [Interactivity](#interactivity)
  * [Client code and assets](#client-code-and-assets)
  * [Connections](#connections)  
  * [Advanced](#advanced)
    * [Custom items](#custom-items)
    * [Custom events](#custom-events)
    * [Interaction rights](#interaction-rights)
    * [Grouped items](#grouped-items)

## Installation

You will need to install [node.js](https://nodejs.org/en/). This should also
install `npm`. Once they are installed, go to your app folder, where you want to install `wams`
and run the following commands:

```bash
git clone https://github.com/nick-baliesnyi/wams.git
cd wams
npm install
```

## Getting started

The easiest way to get started is to follow the [Walkthrough tutorial](#walkthrough) below. More advanced users might want to check the [code documentation](https://nick-baliesnyi.github.io/wams/) and the [examples](#examples). For a taste on how WAMS works, check the [live demo section](#live-demo).

## Examples

Go to  `examples/` to see the examples. The entry-point of a `wams` app is the `Application` class.

To try out the examples (except the no-op "scaffold" example), run as follows:

```bash
node examples/[EXAMPLE_FILENAME]

## For example:

node examples/polygons.js
```

The `shared-polygons.js` example demonstrates multi-device gestures (gestures that span multiple screens).

## Live Demo
The [live demo](https://wams-player-demo.herokuapp.com/) is an example of a video-player with a distributed user interface. First, the player controls are displayed on the screen with the video. When a second view is connected, the controls are automatically moved to that view. 

To check out the code of the live demo, see `examples/video-player.js`

## Walkthrough

This walkthrough is a friendly guide on how to use most WAMS features. For detailed code documentation, see [code documentation](https://nick-baliesnyi.github.io/wams/).

> **Note** The examples on this page use ES2015 (ES6) JavaScript syntax like `const` variables and object desctructuring. If you are not familiar with ES2015 features, you can [read](https://webapplog.com/es6/) about them first.

### Hello world
Before you try, here is how a simple WAMS example would look like:
```javascript
const WAMS = require('./wams');
const app = new WAMS.Application();
const { square } = WAMS.predefined.items;
app.spawn(square(200, 200, 100, 'green'));
app.listen(8080);
```

It creates a green square on the canvas with coordinates `{ x: 200, y: 200 }` and a length of `100` and starts the server on port `8080`. Now anyone can connect to the server and see the square.

### Set up your application

1. In the app folder, [install](#installation) WAMS
2. Create **app.js**
2. In the app.js file, include WAMS and initialize the application
```javascript
// app.js
const WAMS = require('./wams');
const app = new WAMS.Application();
app.listen(8080);
```

Now, you can write your WAMS code in this file.

### Genertal Configuration of Your App

The application can be configured through some options.

Below is the full list of possible options with example values.

```javascript
const app = new WAMS.Application({
  color:             'some-color',     // background color of the app's canvas
  clientLimit:       2,                // maximum number of devices that can connect to the server
  clientScripts:     ['script.js'],    // javascript scripts (relative paths or URLs) to include by the browser
  stylesheets:       ['styles.css'],   // css styles to include by the browser
  shadows:           true,             // show shadows of other devices
  staticDir:         path.join(__dirname, 'static'), // path to directory for static files, will be accessible at app's root
  status:            true,             // show information on current view, useful for debugging
  title:             'Awesome App',    // page title  
  useServerGestures: true,             // used for simultaneous interaction with single item from several devices
});
```

### Basics

A WAMS app is made of **items**. There is a number of predefined items (see them in the [docs](https://nick-baliesnyi.github.io/wams/module-predefined.items.html)): 

- `square`
- `rectangle`
- `polygon`
- `image`
- `html`

Most of the items are used on HTML **canvas**, which is the core part of WAMS.   You have already seen `square` used in the Hello world example above. Now let's look at some other items.

### Polygons

```javascript
// app.js

const points = [
  { x: 0, y: 0 },
  { x: 50, y: 0 },
  { x: 25, y: 50 },
];

app.spawn(polygon(points, 'green', {
  x: 500, y: 100,
}));
```

Polygons are built using an array of relative points. For a random set of points, you can use `randomPoints(<number>)` from `WAMS.predefined.utilities`.

### Images

To use images, you first need to set up a path to the [static directory](#static-files).

```javascript
// app.js

const app = WAMS.Application({
  staticDir: path.join(__dirname, './images') 
})

const { image } = WAMS.predefined.items;
// ES2015 syntax, same as
// const image = WAMS.predefined.items.image;

app.spawn(image('monaLisa.jpg', {
  width: 200, height: 350,
  x: 300, y: 300,
}));
```

To spawn a WAMS image, dont't forget to include _width_ and _height_.

> **Example** To see a great example of using images, check out `examples/card-table.js`

### HTML
If you need more control over styling than canvas gives, or you would like to use `iframe`, `audio`, `video` or other browser elements apart from canvas, WAMS also supports spawning **HTML** items.

```javascript
// app.js
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

> **Note** Rotation is defined in radians (Pi = 180 deg)


### Interactivity

> **Note** An item must have its coordinates, width and height defined to be interactive

Let's get back to our Hello world example with a green square. Just a static square is not that interesting, though. Let's make it **draggable**:
```javascript
...
app.spawn(square(200, 200, 100, 'green', {
  ondrag: WAMS.predefined.drag,
}));
...
```
This looks much better. Now let's remove the square when you **click** on it. _To remove an item, use WAMS' `removeItem` method._

```js
...
  ondrag: WAMS.predefined.drag,
  onclick: handleClick,
}));

function handleClick(event) {
  app.removeItem(event.target)
}
...
```


Another cool interactive feature is **rotation**. To rotate an item, first add the `onrotate` handler and then grab the item with your mouse and hold **Control** key. 
```js
...
  ondrag: WAMS.predefined.drag,
  onclick: handleClick,
  onrotate: WAMS.predefined.rotate,
}));
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
  staticDir:     path.join(__dirname, './assets'),
});
```

This makes files under the specified path available at the root URL of the application. For example, if you have the same configuration as above, and there is an `image.png` file in the `assets` folder, it will be available at `http(s)://<app-url>/image.png`

- To run code in the browsers that connect to your app, create a **.js** file in your app _static directory_ and include it in the application config:

```javascript
const app = new WAMS.Application({
  clientScripts: ['awesome-script.js'],
  staticDir:     path.join(__dirname, 'assets'),
});
```

- To add CSS stylesheets:

```javascript
const app = new WAMS.Application({
  stylesheets: ['amazing-styles.css'],
  staticDir:   path.join(__dirname, 'assets'),
});
```


### Connections

WAMS manages connections with clients under the hood, and provides helpful methods to react on **connection-related events**:

- `onconnect` – called each time a client connects to WAMS server
- `ondisconnect` – called when client disconnects

Both methods accept a callback function, where you can act on the event. The callback function gets these arguments:

- `view` – current device's view object. Stores view's information and allows to locate, move, rescale the view
- `device` – physical position of current device
- `group` – server view group, used for multi-device gestures

Setting an `onconnect` callback  is often used to change the scale, rotation or position of a device. You can also set up `onclick`, `ondrag`, `onrotate` and `onscale` handlers for different clients' views. Same as with items, you can `moveBy` and `moveTo` views.

Combining view event handlers and methods, you can build complex layouts based on client's index. WAMS has predefined layouts that you can use, such as `table` and `row`. Here's how you can use them:

```js
const setTableLayout = WAMS.predefined.layouts.table(200);
function handleLayout(view) {
  setTableLayout(view);
}

app.onconnect(handleLayout);
```



## Advanced

When building more complex applications, sometimes you might want to have more flexibility and power than predefined items and behaviors provide. 

The following topics show how to go beyond that.

### Custom items

To spawn a custom item, use `CanvasSequence`. It allows to create a custom sequence of canvas actions on the server and safely execute it on the client. That means you can use most of the HTML Canvas methods as if you were writing regular browser code.

The following sequence draws a smiling face item:

```js
function smile(x, y) {
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


app.spawn(smile(900, 300));
```

To add interactivity to a custom item, you can use the same handlers as with predefined items (`ondrag`, `onlick` etc). However, you first need to add a _hitbox_ to the item:

```javascript
function customItem(x, y, width, height) {
  const hitbox = new WAMS.Rectangle(width, height, x, y);
  const ondrag = WAMS.predefined.drag;

  const sequence = new WAMS.CanvasSequence();
  sequence.fillStyle = 'green';
  sequence.fillRect(x, y, width, height);

  return { hitbox, sequence, ondrag, }
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

To give different clients different rights for interacting with items, use `view.index` to differentiate between connected devices.

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

> **NOTE** `owner` number property does not have special meaning. You can use any property of any type.

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

Sometimes you need to spawn several items and then move or drag them together. To do that easily, you can use the `createGroup` method:

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
  ondrag: true,
});

group.moveTo(500, 300);
```
