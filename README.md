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

