'use strict';
const WAMS = require('..');
const path = require('path');
// const { formatWithCursor } = require('prettier');
const app = new WAMS.Application({
    clientScripts: ['custom-events.js'],
});
app.addStaticDirectory(path.join(__dirname, './client'));
const { LineLayout } = WAMS.predefined.layouts;
const linelayout = new LineLayout(0);
const square = WAMS.predefined.items.square;
const rectangle = WAMS.predefined.items.rectangle;

// app globals
let appCreated = false;
const boxes = [];
const dxs = [];
const dys = [];

// viewmap globals
let wRight;
let wBottom;
const viewMap = [];

// radar globals
const radarScale = 0.25;
const radarRects = [];
let prevX;
let prevY;
let dX;
let dY;
const viewColors = ['#ff000088', '#00ff0088', '#0000ff88', '#ffff0088', '#00ffff88', '#ff00fff88'];
let wRect; // the workspace rectangle in the radar
let radarVisible = false;
let selected = null;
let trails = new Array();

// ------------------------------------------------------
// WAMS functions
// ------------------------------------------------------

function handleConnect({ view, device }) {
    view.on('click', startApp);
    linelayout.layout(view, device);
}

function startApp() {
    if (appCreated) return;
    appCreated = true;
    // determine the size of the workspace, using
    // max right and bottom values from all views
    wRight = 0;
    wBottom = 0;
    let view;
    for (view of app.viewspace.views) {
        if (view.x + view.width > wRight) {
            wRight = view.x + view.width;
        }
        if (view.y + view.height > wBottom) {
            wBottom = view.y + view.height;
        }
    }
    // create view map (tells us whether we are in a view or not)
    createViewMap();

    // create moving boxes for demo of the view map
    let box;
    let dx, dy;
    let x, y;
    let d = 50;
    for (let i = 0; i < 25; i++) {
        // create trail for each object
        trails[i] = new Array();
        for (let j = 0; j < 10; j++) {
            trails[i].push(
                app.spawn(
                    square(2, 'black', {
                        x: 0,
                        y: 0,
                    })
                )
            );
        }

        // create WAMS item
        box = app.spawn(
            square(d, 'orange', {
                x: 200,
                y: 200,
            })
        );
        boxes.push(box);
        // random initial location
        let foundStart = false;
        while (!foundStart) {
            x = Math.random() * wRight;
            y = Math.random() * wBottom;
            if (inView(x, y) && inView(x + d, y + d)) {
                foundStart = true;
            }
        }
        box.moveTo(x, y);
        // random movement direction and speed
        dx = Math.random() * 5 + 5;
        if (Math.random() < 0.5) {
            dx *= -1;
        }
        dxs[i] = dx;
        dy = Math.random() * 5 + 5;
        if (Math.random() < 0.5) {
            dy *= -1;
        }
        dys[i] = dy;
    }

    // animation loop to move boxes
    setInterval(moveItems, 50);

    // set up radar view (hidden initially, show by pressing 'r')
    createRadar();
    hideRadar();
}

//------------------------------------------------------
// Radar view
//------------------------------------------------------

function createRadar() {
    // create rectangle for the workspace
    wRect = app.spawn(
        rectangle(wRight * radarScale, wBottom * radarScale, 'gray', {
            x: 50,
            y: 50,
        })
    );
    radarRects.push(wRect);

    // create a rectangle in the radar for each view
    let vRect;
    let i;
    let subView;
    for (let i = 0; i < app.viewspace.views.length; i++) {
        subView = app.viewspace.views[i];
        vRect = app.spawn(
            rectangle(
                subView.width * radarScale,
                subView.height * radarScale,
                viewColors[subView.id % viewColors.length],
                {
                    x: wRect.x + subView.x * radarScale,
                    y: wRect.y + subView.y * radarScale,
                    referencedViewIndex: i,
                }
            )
        );
        vRect.on('drag', handleRadarDrag);
        radarRects.push(vRect);
    }
    radarVisible = true;
}

function handleRadarDrag(event) {
    let rect = event.target;
    // calculate drag amount
    dX = event.x - prevX;
    dY = event.y - prevY;
    prevX = event.x;
    prevY = event.y;
    rect.moveBy(dX, dY);
    // clamp to size of workspace rect
    if (rect.x < wRect.x) {
        rect.x = wRect.x;
    }
    if (rect.x + rect.hitbox.width > wRect.x + wRect.hitbox.width) {
        rect.x = wRect.x + wRect.hitbox.width - rect.hitbox.width;
    }
    if (rect.y < wRect.y) {
        rect.y = wRect.y;
    }
    if (rect.y + rect.hitbox.height > wRect.y + wRect.hitbox.height) {
        rect.y = wRect.y + wRect.hitbox.height - rect.hitbox.height;
    }
}

function hideRadar() {
    let rect;
    for (rect of radarRects) {
        rect.moveBy(-10000, -10000); // is there a better way to hide an object?
    }
    radarVisible = false;
}

function showRadar(view) {
    let subView;
    let rect;
    wRect.moveTo(view.x + 50, view.y + 50);
    for (let i = 1; i < radarRects.length; i++) {
        rect = radarRects[i];
        subView = app.viewspace.views[rect.referencedViewIndex];
        rect.moveTo(wRect.x + subView.x * radarScale, wRect.y + subView.y * radarScale);
    }
    radarVisible = true;
}

//------------------------------------------------------
// View map
//------------------------------------------------------

function createViewMap() {
    let view;
    let cCol;
    for (let row = 0; row < wBottom; row++) {
        cCol = [];
        for (let col = 0; col < wRight; col++) {
            cCol.push(false);
        }
        viewMap.push(cCol);
    }
    // add each view's rectangle to the view map
    for (view of app.viewspace.views) {
        drawViewInViewMap(view.x, view.y, view.width, view.height);
    }
}

function drawViewInViewMap(x, y, width, height) {
    for (let row = y; row < y + height; row++) {
        for (let col = x; col < x + width; col++) {
            viewMap[row][col] = true;
        }
    }
}

// return true if a point is in the view map
function inView(fx, fy) {
    let x = Math.floor(fx);
    let y = Math.floor(fy);
    return x > 0 && x < wRight && y > 0 && y < wBottom && viewMap[y][x] == true;
}

//------------------------------------------------------
// App functions for moving objects around
//------------------------------------------------------

function moveItems() {
    let item;
    let dx, dy;
    let d = 50;
    let x, y;
    for (let i = 0; i < boxes.length; i++) {
        item = boxes[i];
        dx = dxs[i];
        dy = dys[i];
        x = item.x;
        y = item.y;
        // if any border is going out of view, bounce
        if (!inView(x + dx, y) || !inView(x + d + dx, y) || !inView(x + d + dx, y + d) || !inView(x + dx, y + d)) {
            dxs[i] *= -1;
        }
        if (!inView(x, y + dy) || !inView(x, y + d + dy) || !inView(x + d, y + d + dy) || !inView(x + d, y + dy)) {
            dys[i] *= -1;
        }
        item.moveBy(dxs[i], dys[i]);

        // trail
        let dot = trails[i].shift();
        dot.moveTo(item.x + 25, item.y + 25);
        // dot.x = item.x+25;
        // dot.y = item.y+25;
        trails[i].push(dot);
    }
}

//------------------------------------------------------
// Handle custom events
//------------------------------------------------------

// on mousedown, we prepare for dragging a view rectangle in the radar
app.on('mousedown', (event) => {
    const { view } = event;
    // custom event gives us canvas coords; need to convert to WAMS coords
    let wX = event.x + view.x;
    let wY = event.y + view.y;
    let item = app.workspace.findItemByCoordinates(wX, wY);
    if (item && radarRects.includes(item)) {
        prevX = wX;
        prevY = wY;
        selected = item;
    }
});

app.on('mousemove', (event) => {
    const { view } = event;
    // nothing
});

// on mouseup, we finish the drag of the view rectangle,
// and adjust the view locations
app.on('mouseup', (event) => {
    const { view } = event;
    let subView;
    if (radarVisible) {
        if (selected != null) {
            let item = selected;
            // calculate position of view rect relative to workspace rect
            let newX = (item.x - wRect.x) / wRect.hitbox.width;
            let newY = (item.y - wRect.y) / wRect.hitbox.height;
            // move actual WAMS view
            subView = app.viewspace.views[item.referencedViewIndex];
            subView.moveTo(Math.floor(newX * wRight), Math.floor(newY * wBottom));
            selected = null;
            // update view map
            // reset all values in the bitmap to false
            for (let col = 0; col < wRight; col++) {
                for (let row = 0; row < wBottom; row++) {
                    viewMap[row][col] = false;
                }
            }
            // set each view's area to true
            for (subView of app.viewspace.views) {
                drawViewInViewMap(subView.x, subView.y, subView.width, subView.height);
            }
            // update radar position
            showRadar(view);
        }
    }
});

// keydown with 'r' turns the radar on or off
app.on('keydown', (event) => {
    const { view } = event;
    if (event.key == 'r') {
        if (radarVisible) {
            hideRadar();
        } else {
            showRadar(view);
        }
    }
});

//------------------------------------------------------
// Start WAMS app
//------------------------------------------------------

app.on('connect', handleConnect);
app.listen(3500);
