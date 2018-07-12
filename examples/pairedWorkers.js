/*
 * This is the simplest example, simply showing how an arbitrary number of
 *  users can interact with a shared set of objects.
 */

const WAMS = require('../src/server');

const workspace = new WAMS.WorkSpace(
    9003,
    {
        debug: false,
        BGcolor: '#aaaaaa',
        bounds: {
            x: 1000,
            y: 1000,
        },
        clientLimit: 10,
    }
);

workspace.addWSObject(new WAMS.WSObject(
    200,
    200,
    200,
    200,
    'Draggable',
    {
        imgsrc: 'monaLisa.png'
    }
));

workspace.addWSObject(new WAMS.WSObject(
    400,
    400,
    200,
    200,
    'Draggable',
    {
        imgsrc: 'scream.png'
    }
));

const handleDrag = function(target, client, x, y, dx, dy) {
    if (target.type === 'Draggable') {
        target.move(-dx, -dy);
    }
}

const handleLayout = function(workspace, client) {
    const otherUsers = workspace.users;
    const num_users = otherUsers.length;

    if (otherUsers.length > 0) {
        const prev_user = otherUsers[num_users - 1];

        client.moveToXY(
            prev_user.right() - 30,
            prev_user.top()
        ); 
    }
}

workspace.attachDragHandler(handleDrag);
workspace.attachLayoutHandler(handleLayout);

