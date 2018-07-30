# End User API

## Basic usage.
```JavaScript
const WAMS = require('../src/server');
const ws = new WAMS.WamsServer();
// When handlers are attached and beginning items are spawned:
ws.listen(port);
```
## Server API
### listen([port[, host]])
Starts the internal server on the given port and hostname and reports the address on which it is listening.
- __DEFAULTS:__
  * __port:__ 9000
  * __host:__ your local, non-loopback IPv4 address
 
### on(event, handler)
Registers the given handler for the given event. See Handlers below for more information.

### removeItem(item)
Removes the given item from the workspace.

### spawnItem(itemdata)
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
