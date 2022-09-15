# TODO

- [ ] Update canvas to work more like this for drawings:
      <https://simonsarris.com/making-html5-canvas-useful/>
- [ ] Stretch goal is to incorporate a canvas library:
      <http://danielsternlicht.com/playground/html5-canvas-libraries-comparison-table/>
- [ ] Implement subcanvases.
- [ ] Allow subcanvas to be drawn on top:
      <https://stackoverflow.com/questions/3008635/html5-canvas-element-multiple-layers>
- [ ] Switch to HTTPS
- [ ] Write a distributed video player example.
- [ ] Allow ordering of items on z-axis. (i.e. their position in the item queue)

---

# COMPLETED

_As of: Mon Mar 11 21:20:26 CST 2019_

- [x] Make multi-device gesture state recoverable.
  - [x] Wipe inputs from dropped connections.
  - [x] Refresh all gesture states on drop.
  - [x] Respond appropriately to window 'blur' events.
  - [x] Respond appropriately to cancelled pointers.
- [x] Provide installation instructions, simplify installation.

_As of: Tue Mar 5 16:55:46 CST 2019_

- [x] Improve the end-user API by making it so that users do not have to
      manually inform the wams app of any updates that have been made to the items
      or views.
- [x] Can the API endpoint be done better? Are there some even better
      abstractions available that will make this code even easier to reason about?
  - [x] Isolate Items in WorkSpace
  - [x] Extract MessageHandler
  - [x] Split Views from WorkSpace, associate only with Connections.
  - [x] Allow items and views to self-publish.
  - [x] Allow items and views to schedule updates automatically when they are
        updated.
- [x] Implement multi-device gestures.
  - [x] Implement server-side gesture library.
- [x] Write an entry-point 'index.js' file and add to package.json
- [x] Write installation instructions into README.md

_As of: Wed Feb 20 12:54:28 CST 2019_

- [x] Look into making the request handler more modular.
- [x] Update API doc.
  - [x] Refactor internal comments throughout codebase into jsdoc style, so
        that API documentation can be auto-generated into a convenient format.

_As of: Sun Jan 20 15:56:39 CST 2019_

- [x] Lock client to a max 60fps render rate, to prevent jitter when multiple
      updates arrive in rapid succession.
- [x] Lock server to a max 60fps update broadcast rate, to ensure multiple
      updates to a single object that occur in rapid succession can be lumped
      together into a single broadcast.
- [x] Lock rotation and scale interactions to a single item.
- [x] Generalize item locking procedure such that a single item is locked from
      the start of the first touch to the end of the last touch.
- [x] Allow client's view to be locked onto, just like items (but only their
      view- not someone else's).
- [x] Allow pan, scale, and rotate gestures to occur simultaneously.
  - [x] Generalize pan gestures to many touches, not just one.
- [x] Use multiplicative scaling throughout the gesture process, instead of
      additive or some combination. This should make scaling much more precise and
      ensure a more natural feel across all touch devices.
- [x] Regulate 'effective' width and height of views (calculate automatically)
- [x] Add option for users to define whether an item is interactable, and then
      only allow interaction with objects marked as interactable.

_As of: Sun Jan 6 20:41:55 CST 2019_

- [x] Implement item rotation.
  - [x] Allow a 'rotate' interaction with objects.
  - [x] Implement a server-side 2d point class for polygon points.
  - [x] Implement a server-side Polygon class with hit detection.
  - [x] Switch to using the Polygon class for hit detection. (Includes adding
        API details for defining the Polygon for an Item).
  - [x] Update examples and predefined endpoint functions.
- [x] Implement a 'Swivel' gesture for desktop rotates.

_As of: Fri Nov 23 13:54:50 CST 2018_

- [x] Lock drags to a single object (instead of always operating on the first
      object it finds that's currently under the cursor).
- [x] Reorganize code, such that each 'class module' is located inside its own
      file. This will help considerably if the code continues to expand, and will
      also help with more fine-grained testing.
- [x] Write design doc (properly).
- [x] Implement 'rotate' for desktop users.
- [x] Separate the Server from the API endpoint.

_As of: Fri Aug 17 09:35:12 CST 2018_

- [x] Fix refinement of mouse coordinates when rotated. May require
      simultaneous fixing of how the draw sequence is performed. I suspect that
      with a bit of trig, those switch statements on the rotation can be eliminated
      and replaced with a single universal calculation.
- [x] Implement a BlueprintCanvasSequence class that uses string tags in the
      arguments of its atoms. It should have a `build()` method which, when called
      with a `values` or likewise named object, will generate an up-to-date sequence
      with the tags replaced with the values from the passed-in object.
- [x] Use this blueprint sequence class for items:
  - [x] Expose it on the WamsServer class as `Sequence`.
  - [x] Set updates that affect x, y, width, or height values of items to
        build a new version of the sequence that will be used for actual
        rendering.
- [x] Figure out a way of testing the client-side code without having to adjust
      the code before and after by commenting out the `require()` statements.
- [x] Remove `hasOwnProperty()` checks before cloning Ids, as this is now
      redundant.
- [x] Fix the client `draw()` sequence.
- [x] Fix scaling for desktop users. (Allow slow & fast scaling)
- [x] Fix bugs that occur when users join approximately simultaneously.
  - [x] Examine possibility of using mutexes around updates. What kind of API
        for this sort of purpose does node.js provide?
  - [x] Node.js is single-threaded, so mutexes are probably unnecessary except
        under very specific circumstances. Therefore, the bug is more likely to
        have something to do with the way users are registered, and the way
        layouts are handled. Look at adjusting the way connections are tracked
        such that they fill the first available 'user' slot, and then layouts get
        passed this slot number. This assignment should happen immediately on
        connection establishment. This would also fix the bug wherein if an early
        user leaves, their layout callback might not get retriggered (because
        layout currently uses the number of users, not a user identifier of some
        sort). Therefore worth doing regardless of whether it fixes this
        particular bug.
- [x] Clean up how the canvas context gets passed around between view and
      controller on the client side. Basically examine and revise `setup()` and
      `layout()`
- [x] Extract an `Interactions` class from the client controller. ZingTouch is
      working quite well, but it looks like it might not be the most well maintained
      of libraries. By abstracting the interactions out like this, it should become
      easier to swap out ZingTouch with another library, should this prove
      necessary. It may even make it easier to implement new forms of interactions,
      which would be a bonus!
- [x] Generally clean up the interactions.
- [x] Swap the render order around so that the object that will be dragged is
      the one that appears on top on the canvas. (same for clicked...)

# Nixed

_As of: Mon Mar 4 09:52:37 CST 2019_

- [ ] ~~Switch away from `socket.io`.~~
  - [ ] ~~Is there a channel multiplexor for the web standard `WebSockets`?
        Does `node.js` implement the `WebSocket` standard?~~
  - [ ] ~~Is there a performance cost to using `socket.io`, and is there a
        benefit to this cost in terms of usability across a wider range of
        devices?~~

_As of: Sun Jan 20 15:56:39 CST 2019_

- [ ] ~~Allow scaling of views to use any viable corner as an anchor.~~

_As of: Fri Nov 23 13:54:50 CST 2018_

- [ ] ~~Look into using device orientation for rotation instead of touchscreen
      inputs.~~
