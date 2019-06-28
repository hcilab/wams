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
app.spawnItem(square(200, 200, 100, 'green'));
app.listen(8080);
```

It creates a green square on the canvas with coordinates `{ x: 200, y: 200 }` and a length of `100` and starts the server on port `8080`. Now anyone can connect to the server and see the square.

## Getting started

Wams app is made of **items**. There is a number of predefined items like:

- `square`
- `rectangle`
- `polygon`
- `image`
- `html`

Most of the items are used on HTML **canvas**, which is the core part of Wams.   You have already seen `square` used in the Hello world example above. Now let's look at some other items.

> **TODO** How to create custom items?


### Images


```javascript
const { image } = Wams.predefined.items;

app.spawnImage(image('/images/monaLisa.jpg', {
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

app.spawnElement(html('<h1>Hello world!</h1>', 200, 100, {
  x: 300, y: 100,
}));
```

The code above will spawn a wrapped `h1` element with width of `200` and height of `100`, positioned at `{ x: 300, y: 100 }`.

### Adding interactivity
Let's get back to our Hello world example with a green square. Just a static square is not that interesting, though. Let's make it **draggable**:
```javascript
...
app.spawnItem(square(200, 200, 100, 'green', {
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

You can add `ondrag`, `onclick ` and `onrotate` event handlers to all Wams items.

> **TODO** write about `moveBy` and `moveTo`

> **Important** An item has to have its coordinates, width and height defined to be interactive

### Connections

Wams handles all the hard parts of managing connections with clients under the hood, and provides you with helpful methods to react on connection-related events:

- `onlayout`
- `ondisconnect`

Both methods accept a callback function, where you can act on the event. The callback function is supplied with these arguments:

- `view` – server view object, that provides operations for the server to locate, move, and rescale views
- `position` – the index of the connected device
- `device` – the connected device state
- `group` – server view group, used for multi-device gestures

Setting a callback for `onlayout` event is often used to change the scale, rotation or position of a device. You can also set up `onclick`, `ondrag`, `onrotate` and `onscale` handlers for different clients' views. Furthemore, you can `moveBy` and `moveTo` views same way as items.

By setting different layouts for different clients, you can build complex layouts. Wams has predefined layouts that you can use, such as `table` and `row`.

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
```
