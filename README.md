# Contents

* [Basic Usage](#basic-usage)
* [Server API](#server-api)
* [Handlers](#handlers)

## Basic Usage
```JavaScript
const Wams = require('../src/server');
const ws = new Wams();
// When handlers are attached and beginning items are spawned:
ws.listen(port);
```
## Server API

* [listen(\[port\[, host\]\])](#listenport-host)
* [on(event, handler)](#onevent-handler)
* [removeItem(item)](#removeitemitem)
* [spawnItem(values)](#spawnitemvalues)
* [update(object)](#updateobject)

### listen(\[port\[, host\]\])
Starts the internal server on the given port and hostname and reports the
address on which it is listening.
- __DEFAULTS:__
  * __port:__ 9000
  * __host:__ your local, non-loopback IPv4 address
 
### on(event, handler)
Registers the given handler for the given event. See Handlers below for more
information.

### removeItem(item)
Removes the given item from the workspace.

### spawnItem(values)
Spawns a new item using the given data and immediately informs all clients of
the new item. `itemdata` is an object which you fill with some or all (or none)
of the following properties:

Property | Default Value | Description
---------|---------------|------------
x|0|The position of the left side of the item.
y|0|The position of the top side of the item.
width|128|The width of the item.
height|128|The height of the item.
type|'view/background'|For use by end-user for distinguishing items.
imgsrc|''|Define the image source of the item.
blueprint|null|The Sequence blueprint for custom canvas rendering.

Note that while you can assign both and imgsrc and a blueprint to an item, if an
imgsrc is defined for the item, the blueprint will be ignored when the item is
drawn.

Blueprints are special objects capable of storing, packing, unpacking, and
executing sequences of canvas instructions. WAMS uses blueprints instead of
plain sequences for the end user API so that, if you wish, you can use special
tags instead of normal arguments in the sequence, allowing WAMS to update the
values in the item automatically. Note that only values that are in the above
properties table will be updated automatically, and that you must use the same
name as in the above table.

For more information about Blueprints and Sequences, see 
[canvas-sequencer](https://www.npmjs.com/package/canvas-sequencer).

### update(object)
Updates the object with the given data, then announces the changes to all
clients. `object` can be either an item or a view.

## Handlers
Each of these handlers can be attached using the name listed below as the event
name when calling `ws.on(event, handler)`. The first argument passed to any
handler will be an object describing the view who initiated the event.

* [click](#click)
* [drag](#drag)
* [layout](#layout)
* [scale](#scale)
* [rotate](#rotate)

### click
This handler will be called whenever a user clicks in their view. 
* Arguments:
  * __view:__ The view which initiated the event.
  * __x:__ The x coordinate at which the user clicked.
  * __y:__ The y coordinate at which the user clicked.

### drag
This handler will be called whenever the user drags somewhere in their view.
* Arguments:
  * __view:__ The view which initiated the event.
  * __x:__ The x coordinate at which the user clicked.
  * __y:__ The y coordinate at which the user clicked.
  * __dx:__ The distance between the current drag and the last drag along the x
    axis.
  * __dx:__ The distance between the current drag and the last drag along the y
    axis.
 
### layout
This handler will only be called once per view, when they initially connect.
* Arguments:
  * __view:__ The view which initiated the event.
  * __position:__ A non-zero integer identifying the 'position' of the view.
    If someone disconnects, their identifier will be reused.

### scale
This handler will be called when a view zooms in or out.
* Arguments:
  * __view:__ The view which initiated the event.
  * __scale:__ The new zoom scale of the view. 1 is normal. 2 means 200% zoom.
    0.5 means 50% zoom.

### rotate
This handler will be called when a user tries to rotate the view.
Currently only implemented for touch devices, via two-finger rotate.
* Arguments:
  * __view:__ The view which initiated the event.
  * __radians:__ The amount of the rotation, in radians.

