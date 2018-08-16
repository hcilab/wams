# TODO

- [ ] Update canvas to work more like this for drawings: 
      <https://simonsarris.com/making-html5-canvas-useful/>
- [ ] Stretch goal is to incorporate a canvas library: 
      <http://danielsternlicht.com/playground/html5-canvas-libraries-comparison-table/>
- [ ] Implement subcanvases.
- [ ] Allow subcanvas to be drawn on top: 
      <https://stackoverflow.com/questions/3008635/html5-canvas-element-multiple-layers>
- [ ] Switch to HTTPS
- [ ] Regulate 'effective' width and height of views (calculate automatically)
- [X] Fix refinement of mouse coordinates when rotated.
      May require simultaneous fixing of how the draw sequence is performed.
      I suspect that with a bit of trig, those switch statements on the rotation
      can be eliminated and replaced with a single universal calculation.
- [ ] Allow scaling of views to use any viable corner as an anchor.
- [ ] Look into making the request handler more modular.
- [ ] Improve the end-user API by making it so that users do not have to
      manually inform the wams app of any updates that have been made to the
      items or views.
- [X] Implement a BlueprintCanvasSequence class that uses string tags in the
      arguments of its atoms. It should have a `build()` method which, when
      called with a `values` or likewise named object, will generate an
      up-to-date sequence with the tags replaced with the values from the
      passed-in object.
- [X] Use this blueprint sequence class for items:
  + [X] Expose it on the WamsServer class as `Sequence`.
  + [X] Set updates that affect x, y, width, or height values of items to build
        a new version of the sequence that will be used for actual rendering.
- [X] Figure out a way of testing the client-side code without having to adjust
      the code before and after by commenting out the `require()` statements.
- [X] Remove `hasOwnProperty()` checks before cloning Ids, as this is now 
      redundant.
- [X] Fix the client `draw()` sequence.
- [X] Fix scaling for desktop users. (Allow slow & fast scaling)
- [ ] Fix bugs that occur when users join approximately simultaneously.
  + [ ] Examine possibility of using mutexes around updates. What kind of API
        for this sort of purpose does node.js provide?
  + [X] Node.js is single-threaded, so mutexes are probably unnecessary except
        under very specific circumstances. Therefore, the bug is more likely to
        have something to do with the way users are registered, and the way
        layouts are handled. Look at adjusting the way connections are tracked
        such that they fill the first available 'user' slot, and then layouts
        get passed this slot number. This assignment should happen immediately
        on connection establishment.
        This would also fix the bug wherein if an early user leaves, their
        layout callback might not get retriggered (because layout currently uses
        the number of users, not a user identifier of some sort). Therefore
        worth doing regardless of whether it fixes this particular bug.
- [X] Clean up how the canvas context gets passed around between view and
      controller on the client side. Basically examine and revise `setup()` and
      `layout()`
- [X] Extract an `Interactions` class from the client controller. ZingTouch is 
      working quite well, but it looks like it might not be the most well
      maintained of libraries. By abstracting the interactions out like this, it
      should become easier to swap out ZingTouch with another library, should
      this prove necessary. It may even make it easier to implement new forms of
      interactions, which would be a bonus!
- [ ] In the same vein, maybe look at doing the same for socket connections and
      request handlers.
- [X] Generally clean up the interactions.
- [ ] Write a distributed video player example.
- [ ] Lock drags to a single object (instead of always operating on the first
      object it finds that's currently under the cursor).
- [X] Swap the render order around so that the object that will be dragged is
      the one that appears on top on the canvas. (same for clicked...)
- [ ] Look into using device orientation for rotation instead of touchscreen
      inputs.
- [ ] Reorganize code, such that each 'class module' is located inside its own
      file. This will help considerably if the code continues to expand, and
      will also help with more fine-grained testing.

