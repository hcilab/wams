const canvas = document.querySelector('#wams');
const myID = Math.floor(Math.random() * 10000);

canvas.addEventListener('pointerdown', (event) => {
    const eventDescription = { x: event.x, y: event.y };
    //console.log(WAMS);
    WAMS.dispatch('mousedown', eventDescription);
});

canvas.addEventListener('click', (event) => {
    const eventDescription = { x: event.x, y: event.y };
    //console.log(eventDescription);
    WAMS.dispatch('mouseup', eventDescription);
});

canvas.addEventListener('pointerup', (event) => {
    const eventDescription = { x: event.x, y: event.y };
    //console.log(eventDescription);
    WAMS.dispatch('mouseup', eventDescription);
});

canvas.addEventListener('pointermove', (event) => {
    const eventDescription = { x: event.x, y: event.y, id: myID };
    //console.log(eventDescription);
    WAMS.dispatch('mousemove', eventDescription);
});

document.addEventListener('keydown', (event) => {
    const eventDescription = { key: event.key };
    //console.log(eventDescription);
    WAMS.dispatch('keydown', eventDescription);
});

// canvas.addEventListener("keypressed", (event) => {
//     const eventDescription = {key: event.key};
//     console.log(eventDescription);
//     WAMS.dispatch("keydown", eventDescription );
// });
// canvas.focus();

WAMS.on('timer', handleMyOtherMessage);
let elapsedList = [];
let total = 0;

function handleMyOtherMessage(data) {
    //console.log(data.detail.msg);
    if (data.detail.time) {
        let elapsed = Date.now() - data.detail.time;
        elapsedList.push(elapsed);
    }

    if (data.detail.msg == 1000) {
        for (let i = 0; i < 1000; i++) {
            total += elapsedList[i];
            console.log(total);
        }
        console.log('Mean RTT: ', total / 1000);
    }
}
