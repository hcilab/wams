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

To coordinate activity between the client and server, I provide a shared set of
resources that are exposed by `shared.js`.

* [utilities](#utilities)
* [IdStamper](#idstamper)
* [Reporters](#reporters)
* [Message](#message)

### utilities

Exported by this module are a number of quality-of-life functions intended to be
used in disparate places throughout the codebase. They are there to make writing
other code easier, and to reduce repetition.

### IdStamper

This class controls ID generation so that I don't have to think about it ever
again. The class has access to a private generator function for IDs and exposes
a pair of methods for stamping new IDs onto objects and cloning previously
existing Ids onto objects:

1. stampNewId(object):

  * object:   The object to stamp with an id.

  All IDs produced by this method are guaranteed to be unique, on a per-stamper
  basis. (Two uniquely constructed stampers can and will generate identical Ids).

2. cloneId(object, id):

  * object:   Will receive a cloned id.
  * id:       The id to clone onto the object.

Example:

```javascript
const stamper = new IdStamper();
const obj = {};
stamper.stampNewId(obj);
console.log(obj.id);  // Logs an integer unique to Ids stamped by stamper
obj.id = 2;           // Assignment has no effect.
delete obj.id;        // Is false and has no effect. 
                      //  (throws an error in strict mode).

const danger = {};
stamper.cloneId(danger, obj.id); // Will work. 'danger' & 'obj' are
                                 // now both using the same ID.
```

### Reporters

### Message

## Client Sources

## Server Sources




