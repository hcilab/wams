# Design

This document details the design of the WAMS project, beginning with the lowest
level classes and code, up to the high level end-user API.

## Contents

* [Installation](#installation)
* [Packages](#packages)
* [Build Tools](#build-tools)
* [Testing](#testing)
* [Shared Sources](#shared-sources)
* [Client Sources](#client-sources)
* [Server Sources](#server-sources)

## Installation

This project is built for [node.js](https://nodejs.org/en/) and
[npm](https://www.npmjs.com/). To install and run the project, you will need to
install the latest stable version of both tools.

With that done, clone the repo and install:

```shell
git clone 'https://github.com/mvanderkamp/wams'
cd wams
npm install
```

## Packages

This project has two user-facing dependencies:

1. [canvas-sequencer](https://www.npmjs.com/package/canvas-sequencer)

  This package allows end users to define custom rendering sequences for the
  canvas.

2. [zingtouch](https://github.com/zingchart/zingtouch)
  
  This package is a gesture library that provides a normalization of interaction
  across browsers and devices, and makes the following kinds of gestures
  possible:
    - Tap
    - Pan
    - Swipe
    - Pinch
    - Rotate
  I am working with the maintainers on developing and improving this library,
  and may end up forking my own version if I find the maintainers too cumbersome
  to deal with.

## Build Tools

Currently, I am using Browsify to build the client side code. Why Browsify?
Well, because I've found it easy to use. It might not produce the most optimal
code, and it doesn't have much in the way of super fancy features built in, but
I don't need any of that, and the basic functionality just simply works, and
works well.

To build the client side code:

```shell
npm run build
```

The bundle will end up in `dist/wams-client.js`. An important design principle
in this project is that end users should never need to touch the client side
code.

No server side tools are currently in use.

## Testing

Testing is done with the `Jest` framework for `npm`. The test suites can be
found in `tests/`.

To run all the tests:

```shell
npm test
```

To test, for example, only the client-side code:

```shell
npm test client
```

To test, for example, only the WorkSpace class from the server-side code:

```shell
npm test WorkSpace
```

Extra configuration can be found and placed in the `jest` field of
`package.json`. 

## Shared Sources

## Client Sources

## Server Sources




