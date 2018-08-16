# WAMS: Workspaces Across Multiple Surfaces

This readme will get updated as I work with the latest developments. For now, I've mostly cleaned up and tested the server side code, so here is a rough API guide for the server side, which is as much for my own use as anything else.

# Server Classes

## ServerItem
(a.k.a. 'Item' in the exports from server.js)

* #### new ServerItem(values)
  - **values:** _\[Object\]_ Default properties:
    + **x:** 0
    + **y:** 0
    + **width:** 128
    + **height:** 128
    + **type:** 'view/background'
    + **imgsrc:** ''
    + **drawCustom:** ''
    + **drawStart:** ''

* #### .containsPoint(x,y)
* #### .moveTo(x,y)
* #### .moveBy(dx,dy)

## ServerView

* #### new ServerView(bounds, values)
  - **bounds** _\[Object\]_ Must have properties:
    + **x:** >= 100
    + **y:** >= 100
  - **values** _\[Object\]_ Default properties:
    + **x:** 0
    + **y:** 0
    + **width:** 1600
    + **height:** 900
    + **type:** 'view/background'
    + **scale:** 1
    + **rotation:** 0
* #### .bottom
* #### .left
* #### .right
* #### .top
* #### .center
* #### .canBeScaledTo(width, height)
* #### .canMoveToX(x)
* #### .canMoveToY(y)
* #### .moveTo(x,y)
* #### .moveBy(dx,dy)
* #### .rescale(scale)
    
## ListenerFactory

## WorkSpace

## Connection

## RequestHandler

## WamsServer
