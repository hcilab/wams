# Per-device
```mermaid
sequenceDiagram:
    participant cg as ClientGestureLibrary
    participant ci as Interactor
    participant cc as ClientController
    participant sc as ServerController
    participant mh as MessageHandler
    participant sv as ServerView
    participant svg as ServerViewGroup
    participant item

    cg --> ci : recognize gesture
    ci --> cc : call handler received from controller
    cc --> sc : emit message with gesture data
    sc --> mh : handle the gesture
    mh --> sv : transform x,y from view coordinates to workspace coordinates
    sv --> mh : (x, y) point
    mh --> item : emit gesture event

    note over sc, item: item is selected using the Track gesture,<br>first point down finds an item to lock, or the view
```

# Multi-device:
```mermaid
sequenceDiagram:
    participant cc as ClientController
    participant sc as ServerController
    participant dv as Device
    participant gc as GestureController
    participant sg as ServerGestureLibrary
    participant mh as MessageHandler
    participant sv as ServerView
    participant svg as ServerViewGroup
    participant item

    cc --> sc : emit pointer event
    sc --> dv : transform x,y from view coordinates to device coordinates
    dv --> sc : (x, y) point
    sc --> gc : process pointer event
    gc --> sg : process pointer event
    sg --> mh : recognize gesture
    mh --> svg : transform x,y point from device coordinates to workspace coordinates

    svg --> mh : (x, y) point
    mh --> item : emit gesture event

    note over sc, item: item is selected using the Track gesture,<br>first point down finds an item to lock, or the view
```

This double transformation is actually correct. The device transformation moves the pointer event to where the device is located physically relative to other devices, that is: where in the server view group the event takes place. Further transforming from where in the view group the event takes place to where in the workspace it takes place is therefore logical. However, if we are to use this same process for single-device gestures we need to provide a unique ServerViewGroup for each ServerView when in single-device mode.
