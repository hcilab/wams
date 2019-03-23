# Design

This document details the design of the WAMS project, beginning with the lowest
level classes and code, up to the high level end-user API.

## Contents

* [Dependencies](#dependencies)
* [Build Tools](#build-tools)
* [Testing](#testing)
* [Shared Sources](#shared-sources)
* [Client Sources](#client-sources)
* [Server Sources](#server-sources)
* [Gesture Recognition](#gesture-recognition)
* [Connection Establishment](#connection-establishment)

## Dependencies

This project has four dependencies:

1. [canvas-sequencer](https://www.npmjs.com/package/canvas-sequencer)

    This package allows end users to define custom rendering sequences for the
    canvas. These sequences can be transmitted over the network and executed on
    the client without having to use the `eval()` function and all its incumbent
    issues. The downside to this approach is that the sequences must be
    declarative- there is no way to retrieve the return value from a call to a
    canvas context method or conditionally execute parts of the sequence.

2. [westures](https://mvanderkamp.github.io/westures/)
  
    This package is a gesture library that provides a normalization of
    interaction across browsers and devices, and makes the following kinds of
    gestures possible:

    - __Tap__
    - __Pan__
    - __Pinch__
    - __Rotate__
    - __Swipe__

    As well as providing tracking abilities (i.e. simple updates of input state
    at every change) and gesture customization options, including the ability to
    plug in entire custom gestures. I made use of this ability to package
    together the Pan, Pinch, and Rotate gestures into a single Transform
    gesture, so that all three updates can be transmitted over the network
    simultaneously, reducing the volume of traffic and eliminating jitter in the
    render which was caused by the updates to these three gestures being split
    across render frames.

3. [express](https://www.npmjs.com/package/express)

    The `express` package provides a simple way of establishing routes for the
    node.js server. The `express` router used by a WAMS app can be exposed to
    the end user, allowing them to define custom routes. Using a popular library
    for this feature enhances the ease of use for end users.

4. [socket.io](https://www.npmjs.com/package/socket.io)

    The `socket.io` package is used on both client and server side behind the
    scenes to maintain an open, real-time connection between the server and
    client. Each client is on its own socket connection, but all clients share a
    namespace.

    Therefore messages are emitted as follows:
    
    * __To a single client:__ on its socket.
    * __To everyone except a single client:__ on its socket's broadcast channel.
    * __To everyone:__ on the namespace.

## Build Tools

The build tools are mostly listed under `devDependencies` in `package.json`. The
key exception is `make`, which is used for running tasks.

The tools used and their rationale are as follows:

1. [arkit](https://arkit.js.org/)

    The `arkit` package builds dependency graphs out of JavaScript source code.
    These graphs are not full UML, but rather simply show which files are
    connected via explicit `require()` statements. Although somewhat limited,
    this is still very useful, and helps a great deal in terms of keeping the
    code organized.

2. [browserify](http://browserify.org/)

    The `browserify` package bundles JavaScript code together for delivery to
    clients. Why Browserify, instead of something like webpack or parcel?  Well,
    because I've found it easy to use. It might not produce the most optimal
    code, and it doesn't have much in the way of super fancy features built in,
    but I don't need any of that, and the basic functionality just simply works,
    and works well.

3. [eslint](https://eslint.org/)

    `eslint` is akin to an early-warning system. It parses the code and checks
    for style and formatting errors, so that these can be fixed before trying to
    run the code. It works very well and is fully customizable in terms of which
    of its style and format rules to apply. It can also fix some simple style
    errors on its own.

4. [jest](https://jestjs.io/)

    `jest` is a testing framework for JavaScript. The tests are all written to
    be run by `jest`, although I will caution that currently the tests are also
    utterly, hopelessly broken. Too much refactoring, too quickly.

5. [jsdoc](http://usejsdoc.org/)

    `jsdoc` generates documentation from internal comments, akin to javadocs.

6. [tui-jsdoc-template](https://www.npmjs.com/package/tui-jsdoc-template)

    This package is a template for the HTML pages produced by `jsdoc`. I tried
    out a number of templates after being unsatisfied with the default output,
    and I found this one to be the best combination of style and functionality
    of the ones I tried.

7. [make](https://www.gnu.org/software/make/manual/make.html)

    `make` is wonderfully flexible, so here I use it as a simple task runner, at
    which it is quite adept. It also interfaces nicely with `vim`, even if the
    JavaScript build tools don't. Simply running `make` from the main directory
    of the project will run eslint, browserify, and jsdoc on the code, keeping
    everything up to date at once. As I use `vim` for editing, the `make`
    command will also update the tags.

8. [exuberant-ctags](http://ctags.sourceforge.net/)

    This package should be available from standard Linux repositories with the
    common package managers (e.g. `apt`). Parses source code and generates a map
    of important names in the code (for example, functions and classes) to their
    definition location. Works excellently with `vim` and can really make
    navigating the source code a lot easier.

9. [ctags-patterns-for-javascript](
https://github.com/romainl/ctags-patterns-for-javascript)

    This packag` provides the necessary plugins to enable 'exuberant-ctags' for
    JavaScript.

To build the client side code:

```bash
make

# Or:

make bundle
```

The bundle will end up in `dist/wams-client.js`.

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

All the "reporters" provided by this module share a common interface, as they
are all generated by the same class factory.

Specifically, each reporter exposes two methods for getting and setting a set of
core properties: `assign(data)` and `report()`. Each is guaranteed to only
affect the core properties that were passed to the factory.

The motivation for this design was to and provide some semblance of confidence
about the data that will be passed between the client and server. With the core
properties defined in a shared module, the chance of data being sent back and
forth in a format that one end or the other does not recognize is greaty
reduced. This was taken even further with the [Message](#message) class, which
uses this reporter interface for the data it transmits. 

Importantly, the set of Reporters includes the common `Item` and `View`
definitions that both client and server extend. Think of these common reporter
definitions as pipes that both client and server must push their data through if
they wish to share it.

### Message

The Message class takes the notion of reporters one step further by centralizing
the method of data transmission between the client and server.

It does this by explicitly requiring that any data objects it receives for
transmission be reporters (or at least, they must have a `report` function
available at some location in their prototype chain... Insert complaints about
JavaScript here).

Messages can be transmitted by any object with an `emit` function.

## Client Sources

* [ShadowView](#shadowview)
* [ClientItem](#clientitem)
* [ClientView](#clientview)
* [Interactor](#interactor)
* [ClientController](#clientcontroller)

### ShadowView

The ShadowView class is a simply extension of the View class that provides a
`draw(context)` method. It is used for rendering the outlines of other views
onto the canvas, along with a triangle marker indicating the orientation of the
view. (The triangle appears in what is the view's top left corner).

Care must be taken with the drawing routines to ensure that the outlines
accurately reflect what is visible to the view they represent.

### ClientItem

The ClientItem class is an extension of the Item class that provides a
`draw(context)` method for rendering the item to the canvas. It is aware of and
able to make use of the `CanvasBlueprint` class from the `canvas-sequencer`
package for rendering custom sequences to the canvas.

To ensure that the blueprints, sequences, and images are kept up to date, the
`ClientItem` class wraps extra functionality around the base `assign(data)`
method.

### ClientView

The ClientView class maintains the client-side model of the system, keeping
track of the items and other views, as well as its own status. It is also
responsible for holding onto the canvas context and running the principle
`draw()` sequence. 

These two responsibilities are bundled together because rendering requires
knowledge of the model. Note, however, that the ClientView is not actually in
charge of issuing changes to the model, but is rather the endpoint of such
commands. It is the ClientController which issues these commands as per the
messages it receieves from the server.

One thing that may appear odd is the `handle(message, ...args)` function. Why
not just call the methods directly, you might ask. This wrapper makes it
possible to guarantee that changes to the model will always be immediately
reflected in the render.

The `handle(message, ...args)` wrapper is necessary because I decided to reduce
the footprint of the WAMS application by foregoing a `draw()` loop in favour of
only drawing the canvas when changes to the model are made. This significantly
reduces the workload when the model is idle, as the page merely needs to
maintain the `socket.io` connection to the server.

### Interactor

The Interactor class provides a layer of abstraction between the controller and
the interaction / gesture library being used. This should make it relatively
easy, in the long run, to swap out interaction libraries if need be.

When a user interacts with the application in a way that is supported, the
Interactor tells the ClientController the necessary details so the
ClientController can forward those details to the server.

### ClientController

The ClientController maintains the `socket.io` connection to the server, and
informs the ClientView of changes to the model. It also forwards messages to the
server that it receieves from the Interactor about user interaction.

## Server Sources

* [ServerItem](#serveritem)
* [ServerView](#serverview)
* [ListenerFactory](#listenerfactory)
* [WorkSpace](#workspace)
* [Connection](#connection)
* [Router](#router)
* [Server](#server)
* [Wams](#wams)

### ServerItem

The ServerItem maintains the model of an item. It can be moved anywhere, and
provides a `containsPoint(x,y)` method for determining if a point is located
within its coordinates. It extends the shared Item class.

### ServerView

The ServerView maintains the model of a view. It can be moved, scaled, and
rotated. It also provides a routine for transforming a set of pointer data
from its user into the corresponding coordinates and data for the general model.

Also provided is a selection of positional getters for the bottom, top, left,
and right of the view.

### ListenerFactory

The ListenerFactory is not a class, but an object exposing a `build` routine for
the WorkSpace to use when registering event handlers. The handlers built by this
factory prepare and unpack data before calling the endpoint handler registered
by the user of the API.

### WorkSpace

The WorkSpace is the central maintainer of the model. It keeps track of views
and items, and registers and calls the endpoint event handlers.

### Connection

A Connection maintains a `socket.io` connection with a client. It keeps track of
the ServerView corresponding to that client, and informs the WorkSpace model of
messages it receives from its client. 

### Router

The Router provides a layer of abstraction between the server and the
request handling library and its configuration.

### Server

The Server is responsible for establishing the server and gatekeeping incoming
connections. Currently it also handles message distribution when it is necessary
to send messages to the namespace. 

### Wams

This module defines the API endpoint. In practice, this means it is a thin
wrapper around the Server class which exposes only that functionality of the
Server which should be available to the end user.

## Gesture Recognition

The process for gesture recognition, starting at the point when the gesture
library issues a gesture event, to the point when the user-supplied handler is
called, is as follows:

1. Gesture recognized by gesture library.
2. Handler supplied to gesture library by Interactor is called.
3. This handler, defined in ClientController, packs the data received from the
   gesture library into the appropriate gesture Reporter (e.g. RotateReporter),
   then packs the Reporter into a Message and emits the Message to the server.  
4. On the server side, a Connection receives the Message and calls its
   appropriate message handler, which usually means forwarding the Message to
   its WorkSpace.
5. The WorkSpace calls its appropriate message handler, which will either be a
   NOP if the user has not registered a listener, or will be a Listener built by
   the ListenerFactory for the WorkSpace when the user registered a listener by
   calling 'on()'.
6. The Listener unpacks the forwarded gesture data. During this phase, hit
   detection is performed, if necessary, so as to locate the item that was
   interacted with.
7. The Listener calls the user-supplied function with the appropriate arguments.
   The first argument is _always_ the view from which the gesture originated.

## Connection Establishment

When a user visits the IP address and port where the app is hosted, the
following sequence of events occurs:

1. HTML and client JavaScript code are delivered.
2. When the page is loaded, a ClientController is instantiated.
3. The ClientController generates a ClientView, registers gesture listeners via
   an Interactor, resizes the CanvasElement to fill the available window, then
   attempts to establish a socket connection with the server.
4. The Server receives the 'connect' request. If the client limit has been
   reached, it rejects the connection. The user is informed of this rejection,
   and all functionality stops. Otherwise, it accepts the connection.
5. When the connection is accepted, a Connection is instantiated and slotted
   into the collection of active connections.
6. The Connection asks the WorkSpace to spawn a view for it, then issues a "full
   state report" to the client, detailing the current state of the model so that
   the client can render the model. (Message type is INITIALIZE).
7. The ClientController informs the ClientView of this data, then emits a LAYOUT
   message to the server, detailing the state of the view (essentially, its
   size).
8. The Connection receives this message, and records the state of the view in
   the model.
9. If a WAMS layout handler has been registered with the server, it is called
   for the new view. 
10. The view is updated with the new parameters from the layout, and all the
    other views are now informed of the view, adding it as a "shadow".
    - Note that layout handlers must not schedule a view update. Doing so would
      cause an error as the other views haven't added the corresponding shadow
      yet.
11. The connection is established, and normal operation proceeds.

