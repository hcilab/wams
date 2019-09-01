const WAMS = require('..');
const path = require('path')

const TOTAL_WIDTH = 5650
const TOTAL_HEIGHT = 6053

const app = new WAMS.Application({
	enableTracking: true,
	shadows: true,
	staticDir: path.join(__dirname, './img'),
	useMultiScreenGestures: true
});

const { image } = WAMS.predefined.items;

app.on('position', (data) => {
	console.log(data)
	// x and y are floats from 0 to 1, representing relative
	// position of the tracker in space on each dimension
	const { x, y } = data.position
	const trackedView = app.group.views[data.deviceIndex]
	if (trackedView) {
		trackedView.moveTo(x * TOTAL_WIDTH, y * TOTAL_HEIGHT)
	}
})

app.spawn(image('map.jpg', {
	width: 5650, height: 6053,
	x: 0, y: 0,
}));

function viewSetup(view, device, group) {
	if (view.index === 0) {
		view.scaleBy(0.6);
	}
	else if (view.index === 1) {
		group.allowDrag = true
		view.scaleBy(3.4);
		view.moveTo(1615, 2800);
	} else {
		view.scaleBy(1.7)
		view.allowDrag = true
	}
}

app.onconnect(viewSetup);
app.listen(3500);