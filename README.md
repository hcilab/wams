# End User API

* [Basic Usage](#basic_usage)
* [Server API](#server_api)
* [Handlers](#handlers)

## <a id="basic_usage"></a>Basic usage. [\[top\]](#contents)
```JavaScript
const WAMS = require('../src/server');
const ws = new WAMS.WamsServer();
// When handlers are attached and beginning items are spawned:
ws.listen(port);
```
## <a id="server_api"></a>Server API [\[top\]](#contents)

* [listen(\[port\[, host\]\])](#server_listen)
* [on(event, handler)](#server_on)
* [removeItem(item)](#server_removeItem)
* [spawnItem(itemdata)](#server_spawnItem)
* [update(object, data)](#server_update)

### <a id="server_listen"></a>listen(\[port\[, host\]\]) [\[server api\]](#server_api)
Starts the internal server on the given port and hostname and reports the address on which it is listening.
- __DEFAULTS:__
  * __port:__ 9000
  * __host:__ your local, non-loopback IPv4 address
 
### <a id="server_on"></a>on(event, handler) [\[server api\]](#server_api)
Registers the given handler for the given event. See Handlers below for more information.

### <a id="server_removeItem"></a>removeItem(item) [\[server api\]](#server_api)
Removes the given item from the workspace.

### <a id="server_spawnItem"></a>spawnItem(itemdata) [\[server api\]](#server_api)
Spawns a new item using the given data and immediately informs all clients of the new item. `itemdata` is an object which you fill with some or all (or none) of the following properties:

Property | Default Value | Description
---------|---------------|------------
x|0|The position of the left side of the item.
y|0|The position of the top side of the item.
width|128|The width of the item.
height|128|The height of the item.
type|'view/background'|For use by end-user for distinguishing items.
imgsrc|''|Define the image source of the item.

Items with no `imgsrc` defined will currently be present in the system, but not drawn.

### <a id="server_update"></a>update(object, data) [\[server api\]](#server_api)
Updates the object with the given data, then announces the changes to all clients. `object` can be either an item or a viewer.

## <a id="handlers"></a>Handlers [\[top\]](#contents)
Each of these handlers can be attached using the name listed below as the event name when calling `ws.on(event, handler)`. The first argument passed to any handler will be an object describing the viewer who initiated the event.

* [click](#handlers_click)
* [drag](#handlers_drag)
* [layout](#handlers_layout)
* [scale](#handlers_scale)

### <a id="handlers_click"></a>click [\[handlers\]](#handlers)
This handler will be called whenever a user clicks in their view. 
* Arguments:
  * __x:__ The x coordinate at which the user clicked.
  * __y:__ The y coordinate at which the user clicked.

### <a id="handlers_drag"></a>drag [\[handlers\]](#handlers)
This handler will be called whenever the user drags somewhere in their view.
* Arguments:
  * __x:__ The x coordinate at which the user clicked.
  * __y:__ The y coordinate at which the user clicked.
  * __dx:__ The distance between the current drag and the last drag along the x axis.
  * __dx:__ The distance between the current drag and the last drag along the y axis.
 
### <a id="handlers_layout"></a>layout [\[handlers\]](#handlers)
This handler will only be called once per viewer, when they initially connect.
* Arguments:
  * __numViewers:__ The number of viewers active at the time of layout.

### <a id="handlers_scale"></a>scale [\[handlers\]](#handlers)
This handler will be called when a viewer zooms in or out.
* Arguments:
  * __scale:__ The new zoom scale of the viewer. 1 is normal. 2 means 200% zoom. 0.5 means 50% zoom.

