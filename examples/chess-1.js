'use strict';
const WAMS = require('..');
const path = require('path');
const app = new WAMS.Application({
    clientScripts: ['custom-events.js'],
});
app.addStaticDirectory(path.join(__dirname, './client'));
const rectangle = WAMS.predefined.items.rectangle;
const image = WAMS.predefined.items.image;
const { square } = WAMS.predefined.items;
const { polygon } = WAMS.predefined.items;
const points = [
    { x: 0, y: 0 },
    { x: 21, y: 19 },
    { x: 11, y: 19 },
    { x: 16, y: 30 },
    { x: 12, y: 31 },
    { x: 7, y: 19 },
    { x: 0, y: 25 },
    { x: 0, y: 0 },
];
const teleColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00fff'];
let numOfTeles = 0;
let selected = null;
let prevX, prevY;

// app globals
let appCreated = false;
let teleMap = new Map();

//------------------------------------------------------
// classes
//------------------------------------------------------

class Piece {
    constructor(filename, size, row, col, rotated) {
        this.row = row;
        this.col = col;
        this.wamsObject = app.spawn(
            image(filename, {
                width: size,
                height: size,
                x: col * size,
                y: row * size,
            })
        );
        this.wamsObject.on('drag', WAMS.predefined.actions.drag);

        if (rotated) {
            this.wamsObject.rotateBy(Math.PI, this.wamsObject.x + size / 2, this.wamsObject.y + size / 2);
        }
    }
}

class Board {
    constructor() {
        this.pieces = [];
        this.wamsToPieceMap = new Map();
        this.positions = [];
        // [null, null, null, null, null, null, null, null],
        // [null, null, null, null, null, null, null, null],
        // [null, null, null, null, null, null, null, null],
        // [null, null, null, null, null, null, null, null],
        // [null, null, null, null, null, null, null, null],
        // [null, null, null, null, null, null, null, null],
        // [null, null, null, null, null, null, null, null],
        // [null, null, null, null, null, null, null, null]];
        for (let i = 0; i < 8; i++) {
            this.positions.push([null, null, null, null, null, null, null, null]);
        }
        this.size = 1000 / 8;
        this.wamsObject = app.spawn(
            image('board.png', {
                width: 1000,
                height: 1000,
                x: 0,
                y: 0,
            })
        );
    }

    createPiece(filename, row, col, rotated) {
        let piece = new Piece(filename, this.size, row, col, rotated);
        this.pieces.push(piece);
        this.wamsToPieceMap.set(piece.wamsObject, piece);
        this.positions[row][col] = piece;
    }

    createPieces() {
        this.createPiece('wr.png', 7, 0, false);
        this.createPiece('wr.png', 7, 7, false);
        this.createPiece('wkt.png', 7, 1, false);
        this.createPiece('wkt.png', 7, 6, false);
        this.createPiece('wb.png', 7, 2, false);
        this.createPiece('wb.png', 7, 5, false);
        this.createPiece('wq.png', 7, 3, false);
        this.createPiece('wk.png', 7, 4, false);
        for (let i = 0; i < 8; i++) {
            this.createPiece('wp.png', 6, i, false);
        }

        this.createPiece('br.png', 0, 0, true);
        this.createPiece('br.png', 0, 7, true);
        this.createPiece('bkt.png', 0, 1, true);
        this.createPiece('bkt.png', 0, 6, true);
        this.createPiece('bb.png', 0, 2, true);
        this.createPiece('bb.png', 0, 5, true);
        this.createPiece('bq.png', 0, 3, true);
        this.createPiece('bk.png', 0, 4, true);
        for (let i = 0; i < 8; i++) {
            this.createPiece('bp.png', 1, i, true);
        }
    }

    movePiece(wamsPiece) {
        // find the associated piece
        let piece = this.wamsToPieceMap.get(wamsPiece);
        // find new location
        let newRow = Math.floor((wamsPiece.y + wamsPiece.height / 2) / this.size);
        let newCol = Math.floor((wamsPiece.x + wamsPiece.width / 2) / this.size);
        // snap piece to location
        // wamsPiece.x = newCol * this.size;
        // wamsPiece.y = newRow * this.size;
        console.log('snapping');
        wamsPiece.moveTo(newCol * this.size, newRow * this.size);
        // remove piece from old location
        console.log(piece.row + ',' + piece.col);
        this.positions[piece.row][piece.col] = null;
        // move piece to new location
        piece.row = newRow;
        piece.col = newCol;
        this.positions[newRow][newCol] = piece;
        //console.log(piece);
    }
}

// function movePiece(piece, event) {
//     selected = piece;
// }

//------------------------------------------------------
// WAMS functions
//------------------------------------------------------

let numberConnected = 0;
let board;

function handleConnect({ view, device }) {
    // view.on('click', createBox);
    console.log('connecting view id: ' + view.id);
    numberConnected++;
    console.log('Number connected:' + numberConnected);
    if (numberConnected == 1) {
        // I'm first, create the board and pieces
        board = new Board();
        board.createPieces();
    } else {
        // rotate board 180
        view.rotateBy(Math.PI, 500, 500);
    }
    // size my view to show the whole board
    view.scale = Math.min(view.width / 1000, view.height / 1000);
}

// function createBox(event) {
//     const box = app.spawn(square(100, "green", {
//         x: event.x,
//         y: event.y,
//     })
//     );
//     box.on('drag', handleBoxDrag);
// }

// function handleBoxDrag(event) {
//     let dX = event.x - prevX;
//     let dY = event.y - prevY;
//     prevX = event.x;
//     prevY = event.y;
//     event.target.moveBy(dX,dY);
// }

//------------------------------------------------------
// Handle custom events
//------------------------------------------------------

app.on('mousedown', (event) => {
    const { view } = event;
    // custom event gives us canvas coords; need to convert to WAMS coords
    // let wX = event.x / view.scale + view.x;
    // let wY = event.y / view.scale + view.y;
    let wX = event.x / view.scale;
    let wY = event.y / view.scale;
    console.log(view.rotation);
    if (view.rotation != 0) {
        //wY = app.workspace.height - wY;
        //wX = app.workspace.width - wX;
        wY = 1000 - wY;
        wX = 1000 - wX;
    }
    console.log(event.x + ',' + event.y + '     ' + wX + ',' + wY);
    let item = app.workspace.findItemByCoordinates(wX, wY);
    //console.log(item);
    if (item) {
        selected = item;
    }
    //console.log(item);
    //     if (item) {
    //         prevX = wX;
    //         prevY = wY;
    //         selected = item;
    //     }
});

app.on('mousemove', (event) => {
    const { view } = event;
    //     let tele;
    //     if (selected != null) {
    //         let dX = event.x - prevX;
    //         let dY = event.y - prevY;
    //         prevX = event.x;
    //         prevY = event.y;
    //         selected.moveBy(dX,dY);
    //     }
    //     if (teleMap.has(event.id)) {
    //         tele = teleMap.get(event.id);
    //         tele.moveTo(event.x, event.y);
    //     } else {
    //         // create tele
    //         let tele = app.spawn(createTelepointer(event.x, event.y, numOfTeles));
    //         teleMap.set(event.id, tele);
    //     }
});

// function createTelepointer(x, y) {
//     return WAMS.predefined.items.polygon(
//         points,
//         teleColors[numOfTeles++],
//         {
//             x: x,
//             y: y,
//             type: 'colour',
//             onclick: findBelow,
//         }
//     );
// }

// function findBelow(event) {
//     console.log("findBelow");
// }

app.on('mouseup', (event) => {
    const { view } = event;
    console.log(selected);
    if (selected != null) {
        console.log('mouseup on piece: ' + selected);
        board.movePiece(selected);
        selected = null;
    }
});

app.on('keydown', (event) => {
    const { view } = event;
    console.log('keydown');
});

//------------------------------------------------------
// Start WAMS app
//------------------------------------------------------

app.on('connect', handleConnect);
app.listen(3500);
