# WAMS: Workspaces Across Multiple Surfaces

This readme will get updated as I work with the latest developments. For now, I've mostly cleaned up and tested the server side code, so here is a rough API guide for the server side.

# Server Classes

## ServerItem
(a.k.a. 'Item' in the exports from server.js)

#### new ServerItem(values)
- **values:** _\[Object\]_ Default properties:
  + **x:** 0
  + **y:** 0
  + **width:** 128
  + **height:** 128
  + **type:** 'view/background'
  + **imgsrc:** ''
  + **drawCustom:** ''
  + **drawStart:** ''

#### containsPoint(x,y)
#### moveTo(x,y)
#### moveBy(dx,dy)
