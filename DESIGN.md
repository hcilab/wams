# Design

This document details the design of the WAMS project. It covers fundamental
architectural design decisions, the purpose of each of the modules, and briefly
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
* [Connection Establishment](#connection-establishment)
* [References](#references)

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

    This package was written and published as part of this project.

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

    This package was written and published as part of this project. Note that it
    is a fork of [ZingTouch](https://github.com/zingchart/zingtouch). ZingTouch
    and other existing gesture recognition libraries for JavaScript were found
    to be insufficient for the demands of this project, hence the creation of
    this package.

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

Testing is done with the `jest` framework. The test suites can be found in
`tests/`.

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
* [Smooth and Responsive Interaction](#smooth-and-responsive-interaction)

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

### Smooth and Responsive Interaction

In order to ensure a smooth and responsive experience for the user, several
issues must be taken into consideration.

1. Network traffic:
    - The overall amount of traffic over the network must be kept to a minimum.
    - The size of packets sent over the network must also be kept down.
    - The Message / Reporter protocol handles most of this work, by stripping
      out all but the core properties of any object transmitted.
    - Care must still be taken to ensure that these core properties really are
      only those that are needed at every update, or at least are small enough
      to be negligible. Therefore properties such as attribute lists for HTML
      elements, which could contain huge strings representing entire webpages,
      should only be sent occasionally as a special event, and not included in
      the core properties.
    - Additionally, the only data sent during an update should be the data
      pertaining to the specific object that has been updated. This is as
      opposed to sending a full state packet representing all objects in the
      model.
2. Consistency with server:
    - The approach taken to maintain consistency with the server is for every
      update to consist of state packets, rather than sending transformation
      commands. The client therefore simply copies the new state information for
      each updated object.
3. Bundling transformations:
    - The three core transformations are translation, scale, and rotation. Each
      of these is likely to happen every time that a user moves any of the
      active pointers. If the updates for each are not bundled together into the
      next state packet, the user will experience a discomforting jitter effect.
      Solving this issue requires careful attention on both the client and the
      server.
    - For the client side, the updates from the gestures corresponding to all
      three transformations need to be bundled together into a single event
      before being sent to the server. This way, the server can perform all the
      necessary transformations before publishing any new state packets that
      arise.
    - For the server side, the question becomes when to publish updates for
      model objects. Programmers should be allowed to update model objects
      whenever they like (i.e. not necessarily in response to a user event), but
      still have confidence that their changes will be published. In either this
      case or the case of responding to user gestures, if transformations are
      split across publications the jitter issue will surface.

      To solve this issue, the Publishable mixin is used for all model objects.
      It uses the node.js `setImmediate()` callback timer to schedule a single
      publication to occur once all code arising from the current event in the
      event loop has executed. Therefore all transformations responding to a
      user gesture or some other programmer defined event will get bundled
      together into a single update.
    - For server-side gestures, another issue along these lines arises. With
      user input events being sent to the server from each device at rates of up
      to 60 updates per second, it only takes a few devices for the update rate
      to regularly balloon into the hundreds. Therefore user input updates are
      bundled together. This is done by simply updating the input state in
      response to user input events, then only evaluating gestures at a rate of
      up to 60 times per second by using a callback interval that checks whether
      input updates have occurred since the last evaluation.
4. Gesture smoothing:
    - A subtle issue with modern touch interfaces is that contact points, and
      fingers in particular, typically aren't points but rather areas that are
      resolved down to points. These points tend to shift around relative to the
      area while a user is interacting with the surface, as the area itself
      fluctuates in shape and size. This can be due to slight adjustments in the
      distribution of pressure onto the contact surface, or else because humans
      are in constant motion, especially on the miniature scales measured by
      touch surfaces.
      
      Although not immediately obvious, this effect can cause gestures to behave
      in a jumpy way, characterized by alternating relatively large and small
      updates, or else updates in alternating directions. This is perceived by
      the user as jitter or else as a less than smooth interaction experience.
    - The solution applied by this project is to use a cascading average for the
      update values. Note that the implementation exists inside the `westures`
      gesture recognition library that was written as a part of this project.

      This cascading average is defined, generally, by replacing each update
      with the average of the update and the cascade. The cascade is likewise
      updated to this average. The result is a practical application of [Zeno's
      Dichotomy,
      ](https://en.wikipedia.org/wiki/Zeno's_paradoxes#Dichotomy_paradox) as
      half of the remaining value is theoretically applied at each subsequent
      update until the user ends the gesture. Practically, this means that the
      emitted values have some inertia and thus are significantly less prone to
      the jumpiness that is otherwise observed. Also each update is only
      effectively included in perhaps a dozen or so subsequent updates before
      the finite precision of floating point numbers wipes out any remaining
      value from the update.

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

All the
[reporters](https://mvanderkamp.github.io/wams/module-shared.Reporter.html)
provided by this module share a common interface, as they are all generated by
the same class factory.

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

The [ Message ](https://mvanderkamp.github.io/wams/module-shared.Message.html)
class takes the notion of reporters one step further by centralizing the method
of data transmission between the client and server. It does this by explicitly
requiring that any data objects it receives for transmission be reporters.
Messages can be transmitted by any object with an `emit` function.

### Point2D

JavaScript lacks a standard library, and no third party standalone module stood
out. Therefore the
[Point2D](https://mvanderkamp.github.io/wams/module-shared.Point2D.html) class
therefore provides the necessary two-dimensional point operations.

### Polygon2D

The [Polygon2D](https://mvanderkamp.github.io/wams/module-shared.Polygon2D.html)
class defines a two dimensional polygon class, capable of hit detection.
Complex polygons are supported by the hit detection routine as well as simple
polygons. A discussion of the algorithm used can be found [here](
http://geomalgorithms.com/a03-_inclusion.html).

### Rectangle

The [Rectangle](https://mvanderkamp.github.io/wams/module-shared.Rectangle.html)
class provides a two dimensional rectangle class with support for hit detection.

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

The [ ClientController
](https://mvanderkamp.github.io/wams/module-client.ClientController.html) is the
bridge between client and server. To do this, it maintains the `socket.io`
connection to the server. User interaction is forwarded to the server, while
model updates from the server are forwarded to the model.

### ClientModel 

The [ ClientModel
](https://mvanderkamp.github.io/wams/module-client.ClientModel.html) is a full
copy of the server model, but with only the data necessary to render each
object.

### ClientView

The [ ClientView
](https://mvanderkamp.github.io/wams/module-client.ClientView.html) class is
responsible for holding onto the canvas context and running the principle
`draw()` sequence. It also aligns the canvas context to reflect the transformed
state of the client's view within the workspace.

### ShadowView

The [ ShadowView
](https://mvanderkamp.github.io/wams/module-client.ShadowView.html) class is a
simple extension of the View class that is used for rendering the outlines of
other views onto the canvas, along with a triangle marker indicating the
orientation of the view. The triangle appears in what is the view's top left
corner.

### ClientItem

The [ ClientItem
](https://mvanderkamp.github.io/wams/module-client.ClientItem.html) class is an
extension of the Item class that is aware of and able to make use of the
`CanvasSequence` class from the `canvas-sequencer` package for rendering custom
sequences to the canvas. It is therefore intended for immediate mode renderable
items that don't require additional data beyond the render sequence.

### ClientImage

The [ ClientImage
](https://mvanderkamp.github.io/wams/module-client.ClientImage.html) class
enables loading and rendering of images.

### ClientElement

The [ ClientElement
](https://mvanderkamp.github.io/wams/module-client.ClientElement.html) class
enables the use of HTMLElements as workspace objects. It generates the elements
and attaches the provided attributes. Transformations are handled by CSS methods
instead of canvas context transforms, as the elements are independent of the
canvas.

### Interactor

The [ Interactor
](https://mvanderkamp.github.io/wams/module-client.Interactor.html) class
provides a layer of abstraction between the controller and the interaction /
gesture library being used. This should make it relatively easy, in the long
run, to swap out interaction libraries if need be.

When a user interacts with the application in a way that is supported, the
Interactor tells the ClientController the necessary details so the
ClientController can forward those details to the server.

### Transform

The [ Transform
](https://mvanderkamp.github.io/wams/module-client.Transform.html) class bundles
together the Pan, Pinch, and Rotate gestures so that all three updates will
occur simultaneously, reducing jitter.

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

The [ ServerController
](https://mvanderkamp.github.io/wams/module-server.ServerController.html) class
acts as a bridge between a client and the server. To do this it maintains a
`socket.io` connection with a client. It keeps track of the ServerView
corresponding to that client, as well as the ServerViewGroup to which it
belongs, and its physical Device.

User interaction events are forwarded either directly to the MessageHandler or
to the view group's GestureController, depending on whether server-side or the
traditional client-side gestures are in use. 

Outgoing messages will be handled directly by the view or by items, via their
'publish' mechanism. This mechanism ensures that updates will be sent to clients
directly, without any special care required on the part of the programmer (save
that they use the transformation methods provided, instead of modifying
properties directly).

### GestureController

The [ GestureController
](https://mvanderkamp.github.io/wams/module-server.GestureController.html) class
is in charge of processing server-side gestures for the purpose of enabling
multi-device gestures. It accomplishes this by interfacing with the `gestures`
module.

### SwitchBoard

The [ SwitchBoard
](https://mvanderkamp.github.io/wams/module-server.Switchboard.html) controls
connection establishment, as well as disconnection. It hooks up all the
necessary components when a client connects to a WAMS app.

### WorkSpace

The [ WorkSpace
](https://mvanderkamp.github.io/wams/module-server.WorkSpace.html) is the model
for all items that are programmatically added or removed. That is, for
    ServerItems, ServerImages, and ServerElements.

### ServerViewGroup

The [ ServerViewGroup
](https://mvanderkamp.github.io/wams/module-server.ServerViewGroup.html) class
is the model for ServerViews. It has an associated GestureController to enable
server-side gestures. Transformations applied to a group are applied to each
view in the group.

Mixins used by this class: Locker, Lockable, Transformable2D.

### ServerView

The [ ServerView
](https://mvanderkamp.github.io/wams/module-server.ServerView.html) represents a
client's logical view within the workspace. 

Mixins used by this class: Locker, Interactable.

### Device

The [ Device ](https://mvanderkamp.github.io/wams/module-server.Device.html)
class represents a client's physical device. It is used for transforming input
point coordinates when server-side gestures are in use.

Mixins used by this class: Transformable2D.

### ServerItem

The [ ServerItem
](https://mvanderkamp.github.io/wams/module-server.ServerItem.html) maintains
the model of an Item. It allows for transformations and hit detection.
Transformations are published automatically to the clients. 

Mixins used by this class: Identifiable, Hittable.

### ServerImage

The [ ServerImage
](https://mvanderkamp.github.io/wams/module-server.ServerImage.html) is similar
to the ServerItem class, but with methods and properties specific to images.

Mixins used by this class: Identifiable, Hittable.

### ServerElement

The [ ServerElement
](https://mvanderkamp.github.io/wams/module-server.ServerElement.html) class is
similar to the ServerItem class, but with methods and properties specific to
HTML elements.

Mixins used by this class: Identifiable, Hittable.

### MessageHandler

The [ MessageHandler
](https://mvanderkamp.github.io/wams/module-server.MessageHandler.html) is the
interface between the WAMS system and the programmer.  All recognized user
interactions ultimately end up being transmitted to the MessageHandler, which
will call the appropriate listener, if the programmer has attached one.

### Router

The [ Router ](https://mvanderkamp.github.io/wams/module-server.html) provides a
layer of abstraction between the server and the request handling library and its
configuration.

### Application

The [ Application
](https://mvanderkamp.github.io/wams/module-server.Application.html) is the API
endpoint of the WAMS system.

## Mixins

![Graph of mixins module](
https://github.com/mvanderkamp/wams/blob/master/graphs/mixins.svg?sanitize=true)

* [Lockable](#lockable)
* [Locker](#locker)
* [Publishable](#publishable)
* [Transformable2D](#transformable2d)
* [Interactable](#interactable)
* [Hittable](#hittable)
* [Identifiable](#identifiable)

### Lockable

The [ Lockable ](https://mvanderkamp.github.io/wams/module-mixins.Lockable.html)
mixin allows a class to enable itself to be locked and unlocked, with the
default being unlocked.

### Locker

The [ Locker ](https://mvanderkamp.github.io/wams/module-mixins.Locker.html)
mixin allows a class to obtain and release a lock on an item.

### Publishable

The [ Publishable
](https://mvanderkamp.github.io/wams/module-mixins.Publishable.html) mixin
provides a basis for types that can be published. It ensures that publications
will not be sent until all transformations relating to an event have been
applied.

### Transformable2D

The [ Transformable2D
](https://mvanderkamp.github.io/wams/module-mixins.Transformable2D.html) mixin
provides 2D transformation operations for classes with 'x', 'y', 'scale' and
'rotation' properties.

### Interactable

The [ Interactable
](https://mvanderkamp.github.io/wams/module-mixins.Interactable.html) mixin
combines the Transformable2D, Lockable, and Publishable mixins to produce an
object that can be interacted with by a WAMS application.

### Hittable

The [ Hittable ](https://mvanderkamp.github.io/wams/module-mixins.Hittable.html)
mixin extends the Interactable mixin by allow hit detection.

### Identifiable

The [ Identifiable
](https://mvanderkamp.github.io/wams/module-mixins.Identifiable.html) mixin
labels each instantiated object with a unique, immutable ID. All classes that
use this mixin will share the same pool of IDs.

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

A [ Binding ](https://mvanderkamp.github.io/wams/module-gestures.Binding.html)
associates a gesture with a handler function that will be called when the
gesture is recognized.

### Input

An [ Input ](https://mvanderkamp.github.io/wams/module-gestures.Input.html)
tracks a single input and contains information about the current and initial
events. Also tracks the client from whom the input originates.

### PHASE

The [ PHASE ](https://mvanderkamp.github.io/wams/module-gestures.html) object
normalizes inputs events to the phases start, move, end, or cancel.

### PointerData

The [ PointerData
](https://mvanderkamp.github.io/wams/module-gestures.PointerData.html) class
provides low-level storage of pointer data based on incoming data from an
interaction event. Specifically, it stores the (x,y) coordinates of the pointer,
the time of interaction, and the phase.

### Region

The [ Region ](https://mvanderkamp.github.io/wams/module-gestures.Region.html)
class is the entry point into the gestures module. It maintains the list of
active gestures and acts as a supervisor for all gesture processes. 

### State

The [ State ](https://mvanderkamp.github.io/wams/module-gestures.State.html)
class maintains the list of input points.

## Predefined

![Graph of predefined module](
https://github.com/mvanderkamp/wams/blob/master/graphs/predefined.svg?sanitize=true)

* [items](#predefined-items)
* [layouts](#predefined-layouts)
* [utilities](#predefined-utilities)

### Predefined items

The [ items ](https://mvanderkamp.github.io/wams/module-predefined.items.html)
namespace is a collection of factories for predefined item types.

### Predefined layouts

The [ layouts
](https://mvanderkamp.github.io/wams/module-predefined.layouts.html) namespace
is a collection of factories for predefined layout handlers.

### Predefined utilities

The [ utilities
](https://mvanderkamp.github.io/wams/module-predefined.utilities.html) namespace
is an assortment  of predefined helper functions.

## Connection Establishment

When a user visits the IP address and port where the app is hosted, the
following sequence of events occurs:

1. HTML and client JavaScript code are delivered.
2. When the page is loaded, the client's ClientModel, ClientView, and
   ClientController are instantiated and hooked up.
3. The ClientController resizes the canvas to fill the client's browser window. 
4. The ClientController registers `socket.io` message listeners and other
   assorted non-gesture-related listeners for maintaining the system.
5. The ClientController initiates the render loop.
6. The ClientController attempts to establish a socket connection with the
   server.
7. The Switchboard receives the 'connect' request. If the client limit has been
   reached, it rejects the connection. The user is informed of this rejection,
   and all functionality stops. Otherwise, it accepts the connection.
8. When the connection is accepted, a ServerController is instantiated and
   slotted into the collection of active connections.
9. The ServerController asks the ServerViewGroup to spawn a view for it, and
   spawns a Device to store the representation of the client's physical device.
10. The ServerController attaches `socket.io` message listeners and issues a
    "full state report" to the client, detailing the current state of the model
    so that the client can render the model, as well as options specified by the
    programmer such as whether to use client or server-side gestures.
11. The ClientController informs the ClientModel of this data and registers user
    event listeners, either in the form of an Interactor for client-side
    gestures or by directly forwarding input events for server-side gestures. 
12. The ClientController emits a layout message to the server, detailing the
    size of the view.
13. The ServerController receives this message, and records the size of the view
    in the model.
14. If a layout handler has been registered for the application, it is called
    for the new view. 
15. The view is updated with the new parameters from the layout, and all the
    other views are now informed of the view, adding it as a "shadow".
16. The connection is now fully established, and normal operation proceeds.

## References

Listed here are references to all external sources, be they code, books,
algorithms, tutorials, or other articles.

1. [canvas-sequencer](https://www.npmjs.com/package/canvas-sequencer)
2. [westures](https://mvanderkamp.github.io/westures/)
3. [zingtouch](https://github.com/zingchart/zingtouch)
4. [express](https://www.npmjs.com/package/express)
5. [socket.io](https://www.npmjs.com/package/socket.io)
5. [arkit](https://arkit.js.org/)
6. [browserify](http://browserify.org/)
7. [eslint](https://eslint.org/)
8. [jest](https://jestjs.io/)
9. [jsdoc](http://usejsdoc.org/)
10. [tui-jsdoc-template](https://www.npmjs.com/package/tui-jsdoc-template)
11. [make](https://www.gnu.org/software/make/manual/make.html)
12. [exuberant-ctags](http://ctags.sourceforge.net/)
13. [ctags-patterns-for-javascript](
   https://github.com/romainl/ctags-patterns-for-javascript)
14. [You Don't Know JavaScript]( https://github.com/getify/You-Dont-Know-JS)
15. [Mixins](
    http://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/)
16. [Zeno's Dichotomy
    ](https://en.wikipedia.org/wiki/Zeno's_paradoxes#Dichotomy_paradox)
17. [Polygonal Hit Detection](http://geomalgorithms.com/a03-_inclusion.html)
