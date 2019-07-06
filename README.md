# WAMS: Workspaces Across Multiple Surfaces

[![dependencies Status](
https://david-dm.org/mvanderkamp/wams/status.svg)](
https://david-dm.org/mvanderkamp/wams)
[![devDependencies Status](
https://david-dm.org/mvanderkamp/wams/dev-status.svg)](
https://david-dm.org/mvanderkamp/wams?type=dev)
[![Maintainability](
https://api.codeclimate.com/v1/badges/d751ac91ef2c243f5758/maintainability)](
https://codeclimate.com/github/mvanderkamp/WAMS-API/maintainability)

## Contents

* [Installation](#installation)
* [Basic Usage](#basic-usage)
* [Start building](#start-building)

## Installation

You will need to install [node.js](https://nodejs.org/en/). This should also
install `npm`. Once they are installed, go to where you want to install `wams`
and run the following commands:

```bash
git clone https://github.com/nick-baliesnyi/wams.git
cd wams
npm install
```

## Basic Usage

See the examples in `examples/`, and check the
[docs](https://mvanderkamp.github.io/wams/). The entry-point of a `wams` app is
the `Application` class.

To try out the examples (except the no-op "scaffold" example), run as follows:

```bash
node examples/[EXAMPLE_FILENAME]

## For example:

node examples/polygons.js
```

The `shared-polygons.js` example demonstrates multi-device gestures.

## Hello, world
The smallest Wams example looks something like this:
```javascript
const Wams = require('..');
const app = new Wams.Application();
const { square } = Wams.predefined.items;
app.spawn(square(200, 200, 100, 'green'));
app.listen(8080);
```

It creates a green square on the canvas with coordinates `{ x: 200, y: 200 }` and a length of `100` and starts the server on port `8080`. Now anyone can connect to the server and see the square.

> **Note** The examples on this page use ES2016 (ES6) JavaScript syntax like `const` variables and object desctructuring. If you are not familiar with ES2015 features, you can [read](https://webapplog.com/es6/) about them first.


## Getting started

A Wams app is made of **items**. There is a number of predefined items like:

- `square`
- `rectangle`
- `polygon`
- `image`
- `html`

Most of the items are used on HTML **canvas**, which is the core part of Wams.   You have already seen `square` used in the Hello world example above. Now let's look at some other items.

### Images

```javascript
const { image } = Wams.predefined.items;

app.spawn(image('/images/monaLisa.jpg', {
  width: 200, height: 350,
  x: 300, y: 300,
}))
```

To spawn a Wams image, dont't forget to include _width_ and _height_.

> **Tip** To see a great example of using images, check out `examples/card-table.js`

### HTML
If you need more control over styling than canvas gives, or you would like to use `iframe`, `audio`, `video` or other browser elements apart from canvas, Wams also supports spawning **HTML** items.

```javascript
const { html } = Wams.predefined.items;

app.spawn(html('<h1>Hello world!</h1>', 200, 100, {
  x: 300, y: 100,
}));
```

The code above will spawn a wrapped `h1` element with width of `200` and height of `100`, positioned at `{ x: 300, y: 100 }`.

### Adding interactivity

> **Note** An item must have its coordinates, width and height defined to be interactive

Let's get back to our Hello world example with a green square. Just a static square is not that interesting, though. Let's make it **draggable**:
```javascript
...
app.spawn(square(200, 200, 100, 'green', {
  ondrag: Wams.predefined.drag,
}));
...
```
This looks much better. Now let's remove the square when you **click** on it. _To remove an item, use Wams' `removeItem` method._

```js
...
  ondrag: Wams.predefined.drag,
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
  ondrag: Wams.predefined.drag,
  onclick: handleClick,
  onrotate: Wams.predefined.rotate,
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

_You can add event handlers to all Wams items._



### Connections

Wams manages connections with clients under the hood, and provides helpful methods to react on connection-related events:

- `onconnect` – called each time a client connects to Wams server
- `ondisconnect` – called when client disconnects

Both methods accept a callback function, where you can act on the event. The callback function gets these arguments:

- `view` – current device object that contains the view's state and allows to locate, move, and rescale the view 
- `position` – index of current device
- `device` – physical position of current device
- `group` – server view group, used for multi-device gestures

Setting an `onconnect` callback  is often used to change the scale, rotation or position of a device. You can also set up `onclick`, `ondrag`, `onrotate` and `onscale` handlers for different clients' views. Same as with items, you can `moveBy` and `moveTo` views.

Combining view event handlers and methods, you can build complex layouts based on client's position index. Wams has predefined layouts that you can use, such as `table` and `row`. Here's how you can use them:

```js
const setTableLayout = Wams.predefined.layouts.table(200);
function handleLayout(view, position) {
  if (position === 0) {
    // User 0 is the "table". Allow them to move around and scale.
    view.ondrag = Wams.predefined.drag;
    view.onscale = Wams.predefined.scale;
  }
  setTableLayout(view, position);
}

app.onconnect(handleLayout);
```

## Advanced

When building more complex applications, sometimes you might want to have more flexibility and power than predefined items and behaviors provide. 

The following topics show how to go beyond that.

### Custom item

To spawn a custom item, use `CanvasSequence`. It allows to create a custom sequence of canvas actions on the server and safely execute it on the client. That means you can use most of the HTML Canvas methods as if you were writing regular browser code.

The following sequence draws a smiling face item:

```js
const smile = new Wams.CanvasSequence();

smile.beginPath();
smile.arc(75, 75, 50, 0, Math.PI * 2, true); // Outer circle
smile.moveTo(110, 75);
smile.arc(75, 75, 35, 0, Math.PI, false);  // Mouth (clockwise)
smile.moveTo(65, 65);
smile.arc(60, 65, 5, 0, Math.PI * 2, true);  // Left eye
smile.moveTo(95, 65);
smile.arc(90, 65, 5, 0, Math.PI * 2, true);  // Right eye
smile.stroke();

app.spawn({
  x: 900,
  y: 300,
  sequence: smile,
});
```

### Custom events

Sometimes, you would like to tell devices to execute client-side code at a specific time. Or you would like to communicate some client-side event to the server. To allow that, Wams provides **custom events**.

_First of all_, let's think of how we've been writing a Wams app up to this point. All of the app's code is in a single file, that acts as a server and defines the app behavior. But as you move to more complex apps, _sometimes you need to have logic on the client side, too._

It means that we want to be able to write client side code and execute it when we want, on client or server events. But how do we write client code with Wams?

1. Go to **dist** directory. This is where Wams' client-side code is located.
2. Create a folder and name it **app**
3. In the **app** folder, create a **.js** file (e.g. **main.js**). 
Add `alert('Hello, World!')` to it.
4. Go to **dist/index.html** and add the reference to your JS script.
```html
...
  <script src="app/main.js"></script>
</body>
...
````
5. Refresh the browser page and see your alert – you now have a place to write your client code! 🎊

#### From Client to Server

_Now_, let's say we would like to send a message from the client to the server. To use Wams methods on the client, first wrap your code in an `onWamsReady` function.

```javascript
function onWamsReady() { /* your code here */ }
```


Now, to **dispatch a server event**, use `Wams.dispatch()` method:

```javascript
// my-client-code.js

function onWamsReady() {
  Wams.dispatch('my-message', { foo: 'bar' });
}
```

This dispatches a custom event to the server called `my-message` and sends a payload object.

To **listen to this event on the server**, use `app.on()` method:

```javascript
// my-server-code.js

app.on('my-message', handleMyMessage);

function handleMyMessage(data) {
  console.log(data.foo); // logs 'bar' to the server terminal
}
```

#### From Server to Client

To **dispatch a client event** from the server, use `app.dispatch()` method.

```javascript
// my-server-code.js

app.dispatch('my-other-message', { bar: 'foo' });
```

To **listen to this event on the client**, use `Wams.on()` method:

```javascript
// my-client-code.js

function onWamsReady() {
  Wams.on('my-other-message', handleMyOtherMessage);
}

function handleMyOtherMessage(data) {
  console.log(data.bar); // logs 'foo' to the browser console
}
```

### Grouped items

Sometimes you need to spawn several items and then move or drag them together. To do that easily, you can use the `spawnGroup` method:

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
