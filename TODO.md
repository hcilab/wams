# TODO

- [ ] Update canvas to work more like this for drawings:
  <https://simonsarris.com/making-html5-canvas-useful/>
- [ ] Stretch goal is to incorporate a canvas library:
  <http://danielsternlicht.com/playground/html5-canvas-libraries-comparison-table/>
- [ ] Implement subcanvases.
- [ ] Allow subcanvas to be drawn on top:
  <https://stackoverflow.com/questions/3008635/html5-canvas-element-multiple-layers>
- [ ] Switch to HTTPS
- [ ] ~~Switch away from `socket.io`.~~ 
    + [ ] ~~Is there a channel multiplexor for the web standard `WebSockets`?
      Does `node.js` implement the `WebSocket` standard?~~
    + [ ] ~~Is there a performance cost to using `socket.io`, and is there a
      benefit to this cost in terms of usability across a wider range of
      devices?~~
- [ ] Improve the end-user API by making it so that users do not have to
  manually inform the wams app of any updates that have been made to the items
  or views.
- [ ] Write a distributed video player example.
- [ ] Allow ordering of items on z-axis. (i.e. their position in the item queue)
- [ ] Can the API endpoint be done better? Are there some even better
  abstractions available that will make this code even easier to reason about?
    + [X] Isolate Items in WorkSpace
    + [X] Extract MessageHandler
    + [X] Split Views from WorkSpace, associate only with Connections.
    + [X] Allow items and views to self-publish.
    + [ ] Allow items and views to schedule updates automatically when they are
      updated.
- [X] Implement multi-device gestures.
    + [X] Implement server-side gesture library.
- [ ] Make multi-device gesture state recoverable.
    + [ ] Wipe inputs from dropped connections.
    + [ ] Refresh all gesture states on drop.
    + [ ] Respond appropriately to window 'blur' events.
- [ ] Provide installation instructions, simplify installation.
    + [X] Write an entry-point 'index.js' file and add to package.json
    + [X] Write installation instructions into README.md
    + [ ] Merge DESIGN.md into README.md

---

# COMPLETED

_As of: Wed Feb 20 12:54:28 CST 2019_

- [X] Look into making the request handler more modular.
- [X] Update API doc.
    + [X] Refactor internal comments throughout codebase into jsdoc style, so
      that API documentation can be auto-generated into a convenient format.

_As of: Sun Jan 20 15:56:39 CST 2019_

- [X] Lock client to a max 60fps render rate, to prevent jitter when multiple
  updates arrive in rapid succession.
- [X] Lock server to a max 60fps update broadcast rate, to ensure multiple
  updates to a single object that occur in rapid succession can be lumped
  together into a single broadcast.
- [X] Lock rotation and scale interactions to a single item.
- [X] Generalize item locking procedure such that a single item is locked from
  the start of the first touch to the end of the last touch.
- [X] Allow client's view to be locked onto, just like items (but only their
  view- not someone else's).
- [X] Allow pan, scale, and rotate gestures to occur simultaneously.
    + [X] Generalize pan gestures to many touches, not just one.
- [X] Use multiplicative scaling throughout the gesture process, instead of
  additive or some combination. This should make scaling much more precise and
  ensure a more natural feel across all touch devices.
- [X] Regulate 'effective' width and height of views (calculate automatically)
- [X] Add option for users to define whether an item is interactable, and then
  only allow interaction with objects marked as interactable.

_As of: Sun Jan  6 20:41:55 CST 2019_

- [X] Implement item rotation.
    + [X] Allow a 'rotate' interaction with objects.
    + [X] Implement a server-side 2d point class for polygon points.
    + [X] Implement a server-side Polygon class with hit detection.
    + [X] Switch to using the Polygon class for hit detection. (Includes adding
      API details for defining the Polygon for an Item).
    + [X] Update examples and predefined endpoint functions.
- [X] Implement a 'Swivel' gesture for desktop rotates.

_As of: Fri Nov 23 13:54:50 CST 2018_

- [X] Lock drags to a single object (instead of always operating on the first
  object it finds that's currently under the cursor).
- [X] Reorganize code, such that each 'class module' is located inside its own
  file. This will help considerably if the code continues to expand, and will
  also help with more fine-grained testing.
- [X] Write design doc (properly).
- [X] Implement 'rotate' for desktop users.
- [X] Separate the Server from the API endpoint.

_As of: Fri Aug 17 09:35:12 CST 2018_

- [X] Fix refinement of mouse coordinates when rotated.  May require
  simultaneous fixing of how the draw sequence is performed.  I suspect that
  with a bit of trig, those switch statements on the rotation can be eliminated
  and replaced with a single universal calculation.
- [X] Implement a BlueprintCanvasSequence class that uses string tags in the
  arguments of its atoms. It should have a `build()` method which, when called
  with a `values` or likewise named object, will generate an up-to-date sequence
  with the tags replaced with the values from the passed-in object.
- [X] Use this blueprint sequence class for items:
    + [X] Expose it on the WamsServer class as `Sequence`.
    + [X] Set updates that affect x, y, width, or height values of items to
      build a new version of the sequence that will be used for actual
      rendering.
- [X] Figure out a way of testing the client-side code without having to adjust
  the code before and after by commenting out the `require()` statements.
- [X] Remove `hasOwnProperty()` checks before cloning Ids, as this is now
  redundant.
- [X] Fix the client `draw()` sequence.
- [X] Fix scaling for desktop users. (Allow slow & fast scaling)
- [X] Fix bugs that occur when users join approximately simultaneously.
    + [X] Examine possibility of using mutexes around updates. What kind of API
      for this sort of purpose does node.js provide?
    + [X] Node.js is single-threaded, so mutexes are probably unnecessary except
      under very specific circumstances. Therefore, the bug is more likely to
      have something to do with the way users are registered, and the way
      layouts are handled. Look at adjusting the way connections are tracked
      such that they fill the first available 'user' slot, and then layouts get
      passed this slot number. This assignment should happen immediately on
      connection establishment.  This would also fix the bug wherein if an early
      user leaves, their layout callback might not get retriggered (because
      layout currently uses the number of users, not a user identifier of some
      sort). Therefore worth doing regardless of whether it fixes this
      particular bug.
- [X] Clean up how the canvas context gets passed around between view and
  controller on the client side. Basically examine and revise `setup()` and
  `layout()`
- [X] Extract an `Interactions` class from the client controller. ZingTouch is
  working quite well, but it looks like it might not be the most well maintained
  of libraries. By abstracting the interactions out like this, it should become
  easier to swap out ZingTouch with another library, should this prove
  necessary. It may even make it easier to implement new forms of interactions,
  which would be a bonus!
- [X] Generally clean up the interactions.
- [X] Swap the render order around so that the object that will be dragged is
  the one that appears on top on the canvas. (same for clicked...)

# Nixed

_As of: Sun Jan 20 15:56:39 CST 2019_

- [ ] ~~Allow scaling of views to use any viable corner as an anchor.~~

_As of: Fri Nov 23 13:54:50 CST 2018_

- [ ] ~~Look into using device orientation for rotation instead of touchscreen
      inputs.~~

