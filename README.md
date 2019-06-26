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

## Installation

You will need to install [node.js](https://nodejs.org/en/). This should also
install `npm`. Once they are installed, go to where you want to install `wams`
and run the following commands:

```bash
git clone https://github.com/mvanderkamp/wams
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


### Hello World
The smallest Wams example looks something like this:
```javascript
const Wams = require('..');
const app = new Wams.Application();
app.spawnItem(Wams.predefined.items.square(200, 200, 100, 'green'));
app.listen(8080);
```

It creates a green square with coordinates `{x: 200, y: 200}` and a length of `100` and starts the server on port `8080`. Now anyone can connect to the server and see the square.

### Adding interactivity
Just a static square is not that interesting. Let's make it draggable:
```javascript
...
app.spawnItem(Wams.predefined.items.square(200, 200, 100, 'green', {
  ondrag: Wams.predefined.drag,
}));
...
```
This looks much better. Now let's spawn another square at a random location when you click at one of the squares.

```javascript
...
app.spawnItem(Wams.predefined.items.square(200, 200, 100, 'green', {
  ondrag: Wams.predefined.drag,
  onclick: multiplySquare,
}));

function multiplySquare(event) {
  const { x, y } = event;
  const xOffset = randomOffset(); 
  const yOffset = randomOffset();
  app.spawnItem(Wams.predefined.items.square(x + xOffset, y + yOffset, 100, 'blue', {
    ondrag: Wams.predefined.drag,
    onclick: multiplySquare,
  }))
}
...
```
