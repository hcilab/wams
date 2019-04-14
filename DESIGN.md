# Design

This document details the design of the WAMS project. It covers fundamental
architectural design decisions, the purpose of each of the modules, and brief
discusses each of the classes. For more in-depth information about any
particular class, method, or chunk of code, see the [documentation](
https://mvanderkamp.github.io/wams/).

## Contents

* [Runtime Dependencies](#runtime-dependencies)
* [Build Tools](#build-tools)
* [Testing](#testing)
* [Some Core Concepts](#some-core-concepts)
* [Module Overview](#module-overview)
* [Modules](#modules)
    - [Shared](#shared)
    - [Client](#client)
    - [Server](#server)
    - [Mixins](#mixins)
    - [Gestures](#gestures)
    - [Predefined](#predefined)
* [Gesture Recognition](#gesture-recognition)
* [Connection Establishment](#connection-establishment)

## Runtime Dependencies

This project has four runtime dependencies, as listed under the "dependencies"
tag in `package.json`:

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
    - __Swivel__

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
    
    * __To a single client:__ on the client's socket.
    * __To everyone except a single client:__ on the client's socket's broadcast
      channel.
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
    code organized. All the architecture graphs present in this design document
    were generated using `arkit`.

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
    be run using the command `npx jest`. (`npx` is a command included when
    `node.js` is installed. It runs scripts and/or binaries from project
    dependencies in the `node_modules` package).

5. [jsdoc](http://usejsdoc.org/)

    `jsdoc` generates documentation from internal comments, akin to javadocs.

6. [tui-jsdoc-template](https://www.npmjs.com/package/tui-jsdoc-template)

    This package is a template for the HTML pages produced by `jsdoc`. 

7. [make](https://www.gnu.org/software/make/manual/make.html)

    `make` is wonderfully flexible, so here it is used as a simple task runner,
    at which it is quite adept. It also interfaces nicely with `vim`, even if
    the JavaScript build tools don't. Simply running `make` from the main
    directory of the project will run eslint, browserify, and jsdoc on the code,
    keeping everything up to date at once. See the Makefile to see the targets.

8. [exuberant-ctags](http://ctags.sourceforge.net/)

    This package should be available from standard Linux repositories with the
    common package managers (e.g. `apt`). Parses source code and generates a map
    of important names in the code (for example, functions and classes) to their
    definition location. Works excellently with `vim` and can really make
    navigating the source code a lot easier.

9. [ctags-patterns-for-javascript](
https://github.com/romainl/ctags-patterns-for-javascript)

    This package provides the necessary plugins to enable 'exuberant-ctags' for
    JavaScript.

## Testing

Testing is done with the `Jest` framework for `npm`. The test suites can be
found in `tests/`.

To run all the tests:

```shell
npx test
```

To test, for example, only the client-side code:

```shell
npx test client
```

To test, for example, only the WorkSpace class from the server-side code:

```shell
npx test WorkSpace
```

Extra configuration can be found and placed in the `jest` field of
`package.json`. The tests are incomplete, owing to the rapid pace of development
and refactors since January.

## Some Core Concepts

* [Message / Reporter Protocol](#message--reporter-protocol)
* [Unique Identification](#unique-identification)
* [Model-View-Controller](#model-view-controller)
* [Mixin Pattern](#mixin-pattern)

### Message / Reporter protocol

One of the early challenges encountered was to ensure that only the correct
data is transferred over the network, and that when a message is received over
the socket, it would have the expected data. The Message / Reporter protocol was
developed to solve this issue, providing a funnel through which to pass all
data.

The first step was to ensure that only the correct data gets transmitted. This
is where the `ReporterFactory` comes in. By calling this factory with an object
consisting of key-value pairs describing a set of core properties and their
default values, the factory will return a class which extends the `Reporter`
class. An instance object of this class has a method, `report()`, which returns
an object consisting _only_ of the core properties and their current values.
This ensures that even though arbitrary additional properties may exist on the
object (either through further class extensions or direct additions by a user)
only the core properties will be sent if whatever routine sends the data calls
this `report()` method.

Also available on all `Reporter` classes is an `assign(data)` method. All
properties immediately on the data object will be assigned to the `Reporter`
instance, allowing arbitrary data to be stored. A deeper search is done for the
core properties of the `Reporter` instance, checking the entire prototype chain
of the `data` object. (For information on the prototype chain, see Kyle
Simpson's book series, [You Don't Know JavaScript](
https://github.com/getify/You-Dont-Know-JS)).

The second step was to create a `Message` class with a static list of acceptable
message types. A `Message` is constructed with one of these message types and an
instance of a `Reporter`. It can then emit a `report()` of the instance.

If this protocol is follow strictly then only the critical pieces of data will
get transmitted, and they will be associated with the expected `Message` type
when they get there. This requires discipline- it is obviously still possible to
directly `emit` messages over socket connections. Of course, programmer
discipline is also required to make sure that the `Message` type selected is
appropriate for the occasion and associated `Reporter` instance, though it may
be possible to enforce this restriction if this proves difficult.

There is a work-around for cases where lots of different types of little pieces
of data need to be transmitted. See the `DataReporter` class in the
documentation.

### Unique Identification

In a large system like this, where it is important to keep track of and uniquely
identify lots of different kinds of objects correctly on both the client and the
server, it is very useful to centralize the identification technique. This is
where the `IdStamper` class comes in. It provides a common structure by which
unique IDs can be assigned and copied.

Note that uniqueness is generally on a per-class level. There is a mixin,
`Identifiable`, which uses an `IdStamper` to provide unique IDs to any class
which mixes it in. See the `IdStamper` class in the documentation for more
information.

### Model-View-Controller

Both the client and the server implement their own version of the MVC pattern,
ultimately operating together as a larger MVC pattern.

#### Client MVC

The client side version is the most straightforward, and looks a lot like simple
classical MVC. The catch of course is that the 'ClientController' sends user
events to the server, and only interacts with the model or view when it receives
instructions from the server. The other catch is that, as the only thing objects
in the model need to do is draw themselves, they each implement a `draw()`
method for the `ClientView` to use.

#### Server MVC 

The server side is more complicated. The most obvious reason for this is that,
being an API, the users of the API need to be able to attach their own
controller code. The one big simplification is that there's no view, as nothing
needs to be rendered.

The approach taken is to split the model in two. One of these is the
`WorkSpace`, which holds all the actual objects in the model that will need to
be rendered. Specifically, these are the objects which are explicitly spawned
into the model by the programmer. 

The other is the `ServerViewGroup`, which holds the server's representations of
the client's views (that is, what the clients can see). The programmer does not
have control over spawning and removing the views, they are spawned when a user
connects and removed when a user disconnects.

The `ServerController` instances are spawned and maintained by the
`Switchboard`, and these controllers maintain a link to their associated
`ServerView` and its physical `Device`.

One other wrinkle is that, in order to support multi-device gestures, the
`ServerViewGroup` has a single `GestureController` which is responsible only for
maintaining the state of active pointers and calculating whether gestures have
occurred. Storing the gesture controller in the view group opens up the
possibility of creating multiple groups of devices, with each group capable of
recognizing its own multi-device gestures.

#### Client and Server MVC Together

Taken together, the client and the server form a larger MVC pattern, with the
client representing the view and part of the controller, and the server
representing the other part of the controller as well as the model.

### Mixin Pattern

The complexity of the code, particularly on the server, would be significantly
higher were it not for the mixin pattern. The short and simple version for those
more accustomed to software engineering with Java is that a mixin is an
interface whose methods are already implemented.

More precisely, a mixin "mixes" functionality into an already existing class to
form a new subclass. This allows the programmer to bundle related pieces of
functionality together into a mixin, and then attach those bundles to classes as
they see fit.

This pattern fits neatly on top of the `Message` / `Reporter` protocol. This
protocol requires that `Views` and `Items` and their related classes needed be
distinct, yet functionally these two distinct types of classes ultimately need
to perform a lot of similar actions. Mixins solves this problem beautifully,
making the whole system more succinct and easier to maintain in the process.

A more in-depth discussion of mixins and the inspiration for the specific
implementation approach used can be found [here](
http://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/).

## Module Overview

![Graph of all modules except shared](
https://github.com/mvanderkamp/wams/blob/master/graphs/full.svg?sanitize=true)

Note that this graph (and all that follow) merely show explicit file
associations via a `require()` statement (similar to an `import` or `#include`).
Also note that the above graph does not show the `shared` module, as it provides
base classes and routines that are used throughout the code and would simply
clutter the graph without revealing any structure.

All graphs were generated using `arkit`, as discussed in the [build tools](
#build-tools) section above.

## Modules

* [Shared](#shared)
* [Client](#client)
* [Server](#server)
* [Mixins](#mixins)
* [Predefined](#predefined)
* [Gestures](#gestures)

## Shared

![Graph of shared module](
https://github.com/mvanderkamp/wams/blob/master/graphs/shared.svg?sanitize=true)

To coordinate activity between the client and server, a shared set of resources
are exposed by
[shared.js](https://mvanderkamp.github.io/wams/module-shared.html).

* [utilities](#utilities)
* [IdStamper](#idstamper)
* [ReporterFactory](#reporterfactory)
* [Reporters](#reporters)
* [Message](#message)
* [Point2D](#point2d)
* [Polygon2D](#polygon2d)
* [Rectangle](#rectangle)

### utilities

Exported by the
[utilities](https://mvanderkamp.github.io/wams/module-shared.utilities.html)
module are a few quality-of-life functions intended to be used in throughout the
codebase. They are there to make writing other code easier, and to reduce
repetition.

### IdStamper

The [IdStamper](https://mvanderkamp.github.io/wams/module-shared.IdStamper.html)
class controls ID generation. The class has access to a private generator
function for IDs and exposes a pair of methods for stamping new IDs onto objects
and cloning previously existing Ids onto objects.

### ReporterFactory

The [ReporterFactory](https://mvanderkamp.github.io/wams/module-shared.html)
takes a dictionary of default values and returns a `Reporter` class definition.
Runtime definition of classes is possible due to the nature of JavaScript,
wherein classes are really just functions that can be "constructed" using the
keyword `new`. Therefore as functions can be treated like variables, so too can
classes.

### Reporters

All the "reporters" provided by this module share a common interface, as they
are all generated by the same class factory.

Specifically, each reporter exposes two methods for getting and setting a set of
core properties: `assign(data)` and `report()`. 

As discussed in the [core concepts](#some-core-concepts) section above, the
motivation for this design was to provide some semblance of confidence about the
data that will be passed between the client and server. With the core properties
defined in a shared module, the chance of data being sent back and forth in a
format that one end or the other does not recognize is greaty reduced. This was
taken even further with the [Message](#message) class, which uses this reporter
interface for the data it transmits. 

Crucially, the set of Reporters includes the common `Item` and `View`
definitions that both client and server extend. Think of these common reporter
definitions as pipes that both client and server must push their data through if
they wish to share it.

### Message

The Message class takes the notion of reporters one step further by centralizing
the method of data transmission between the client and server. It does this by
explicitly requiring that any data objects it receives for transmission be
reporters. Messages can be transmitted by any object with an `emit` function.

### Point2D

JavaScript lacks a standard library, and no third party standalone module stood
out. This class therefore provides the necessary two-dimensional point
operations.

### Polygon2D

This class defines a two dimensional polygon class, capable of hit detection.
Complex polygons are supported by the hit detection routine as well as simple
polygons. A discussion of the algorithm used can be found [here](
http://geomalgorithms.com/a03-_inclusion.html).

### Rectangle

This class provides a two dimensional rectangle class with support for hit
detection.

## Client

![Graph of client module](
https://github.com/mvanderkamp/wams/blob/master/graphs/client.svg?sanitize=true)

* [ClientController](#clientcontroller)
* [ClientModel](#clientmodel)
* [ClientView](#clientview)
* [ShadowView](#shadowview)
* [ClientItem](#clientitem)
* [ClientImage](#clientimage)
* [ClientElement](#clientelement)
* [Interactor](#interactor)
* [Transform](#transform)

### ClientController

The ClientController is the bridge between client and server. To do this, it
maintains the `socket.io` connection to the server. User interaction is
forwarded to the server, while model updates from the server are forwarded to
the model.

### ClientModel 

The client model is a full copy of the server model, but with only the data
necessary to render each object.

### ClientView

The ClientView class is responsible for holding onto the canvas context and
running the principle `draw()` sequence. It also aligns the canvas context to
reflect the transformed state of the client's view within the workspace.

### ShadowView

The ShadowView class is a simple extension of the View class that is used for
rendering the outlines of other views onto the canvas, along with a triangle
marker indicating the orientation of the view. The triangle appears in what is
the view's top left corner.

### ClientItem

The ClientItem class is an extension of the Item class that is aware of and able
to make use of the `CanvasSequence` class from the `canvas-sequencer` package
for rendering custom sequences to the canvas. It is therefore intended for
immediate mode renderable items that don't require additional data beyond the
render sequence.

### ClientImage

The ClientImage class enables loading and rendering of images.

### ClientElement

The ClientElement class enables the use of HTMLElements as workspace objects. It
generates the elements and attaches the provided attributes. Transformations are
handled by CSS methods instead of canvas context transforms, as the elements are
independent of the canvas.

### Interactor

The Interactor class provides a layer of abstraction between the controller and
the interaction / gesture library being used. This should make it relatively
easy, in the long run, to swap out interaction libraries if need be.

When a user interacts with the application in a way that is supported, the
Interactor tells the ClientController the necessary details so the
ClientController can forward those details to the server.

### Transform

The Transform class bundles together the Pan, Pinch, and Rotate gestures so that
all three updates will occur simultaneously, reducing jitter.

## Server

![Graph of server module](
https://github.com/mvanderkamp/wams/blob/master/graphs/server.svg?sanitize=true)

* [ServerController](#servercontroller)
* [GestureController](#gesturecontroller)
* [SwitchBoard](#switchboard)
* [WorkSpace](#workspace)
* [ServerViewGroup](#serverviewgroup)
* [ServerView](#serverview)
* [Device](#device)
* [ServerItem](#serveritem)
* [ServerImage](#serverimage)
* [ServerElement](#serverelement)
* [MessageHandler](#messagehandler)
* [Router](#router)
* [Application](#application)

### ServerController

The ServerController class acts as a bridge between a client and the server. To
do this it maintains a `socket.io` connection with a client. It keeps track of
the ServerView corresponding to that client, as well as the ServerViewGroup to
which it belongs, and its physical Device.

User interaction events are forwarded either directly to the MessageHandler or
to the view group's GestureController, depending on whether server-side or the
traditional client-side gestures are in use. 

Outgoing messages will be handled directly by the view or by items, via their
'publish' mechanism. This mechanism ensures that updates will be sent to clients
directly, without any special care required on the part of the programmer (save
that they use the transformation methods provided, instead of modifying
properties directly).

### GestureController

The GestureController class is in charge of processing server-side gestures for
the purpose of enabling multi-device gestures. It accomplishes this by
interfacing with the `gestures` module.

### SwitchBoard

The SwitchBoard controls connection establishment, as well as disconnection. It
hooks up all the necessary components when a client connects to a WAMS app.

### WorkSpace

The WorkSpace is the model for all items that are programmatically added or
removed. That is, for ServerItems, ServerImages, and ServerElements.

### ServerViewGroup

The ServerViewGroup class is the model for ServerViews. It has an associated
GestureController to enable server-side gestures. Transformations applied to a
group are applied to each view in the group.

### ServerView

The ServerView represents a client's logical view within the workspace. 

### Device

This class represents a client's physical device. It is used for transforming
input point coordinates when server-side gestures are in use.

### ServerItem

The ServerItem maintains the model of an Item. It allows for transformations and
hit detection. Transformations are published automatically to the clients. 

### ServerImage

Similar to the ServerItem class, but with methods and properties specific to
images.

### ServerElement

Similar to the ServerItem class, but with methods and properties specific to
HTML elements.

### MessageHandler

The MessageHandler is the interface between the WAMS system and the programmer.
All recognized user interactions ultimately end up being transmitted to the
MessageHandler, which will call the appropriate listener, if the programmer has
attached one.

### Router

The Router provides a layer of abstraction between the server and the request
handling library and its configuration.

### Application

The Application is the API endpoint of the WAMS system.

## Mixins

![Graph of mixins module](
https://github.com/mvanderkamp/wams/blob/master/graphs/mixins.svg?sanitize=true)

* [Hittable](#hittable)
* [Identifiable](#identifiable)
* [Interactable](#interactable)
* [Lockable](#lockable)
* [Locker](#locker)
* [Publishable](#publishable)
* [Transformable2D](#transformable2d)

### Hittable

### Identifiable

### Interactable

### Lockable

### Locker

### Publishable

### Transformable2D

## Gestures

![Graph of gestures module](
https://github.com/mvanderkamp/wams/blob/master/graphs/gestures.svg?sanitize=true)

* [Binding](#binding)
* [Input](#input)
* [PHASE](#phase)
* [PointerData](#PointerData)
* [Region](#Region)
* [State](#State)

### Binding

### Input

### PHASE

### PointerData

### Region

### State

## Predefined

![Graph of predefined module](
https://github.com/mvanderkamp/wams/blob/master/graphs/predefined.svg?sanitize=true)

* [items](#predefined-items)
* [layouts](#predefined-layouts)
* [utilities](#predefined-utilities)

### Predefined items

### Predefined layouts

### Predefined utilities

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

