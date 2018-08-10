# TODO

- [ ] Update canvas to work more like this for drawings: 
      <https://simonsarris.com/making-html5-canvas-useful/>
- [ ] Stretch goal is to incorporate a canvas library: 
      <http://danielsternlicht.com/playground/html5-canvas-libraries-comparison-table/>
- [ ] Implement subcanvases.
- [ ] Allow subcanvas to be drawn on top: 
      <https://stackoverflow.com/questions/3008635/html5-canvas-element-multiple-layers>
- [ ] Switch to HTTPS
- [ ] Regulate 'effective' width and height of viewers (calculate automatically)
- [ ] Fix refinement of mouse coordinates when rotated.
      May require simultaneous fixing of how the draw sequence is performed.
      I suspect that with a bit of trig, those switch statements on the rotation
      can be eliminated and replaced with a single universal calculation.
- [ ] Allow scaling of viewers to use any viable corner as an anchor.
- [ ] Look into making the request handler more modular.
- [ ] Improve the end-user API by making it so that users do not have to
      manually inform the wams app of any updates that have been made to the
      items or viewers.
- [ ] Implement a BlueprintCanvasSequence class that uses string tags in the
      arguments of its atoms. It should have a `build()` method which, when
      called with a `values` or likewise named object, will generate an
      up-to-date sequence with the tags replaced with the values from the
      passed-in object.
- [ ] Use this blueprint sequence class
- [ ] Figure out a way of testing the client-side code without having to adjust
      the code before and after by commenting out the `require()` statements.
- [ ] Remove `hasOwnProperty()` checks before cloning IDs, as this is now 
      redundant.

