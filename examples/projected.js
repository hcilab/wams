const WAMS = require('..');
const path = require('path')

const app = new WAMS.Application({
	shadows: true,
	staticDir: path.join(__dirname, './img'),
	useMultiScreenGestures: true
});

const { image } = WAMS.predefined.items;

app.on('position', (data) => {
	console.log(data)
})

app.spawn(image('map.jpg', {
	width: 5650, height: 6053,
	x: 0, y: 0,
}));

function viewSetup(view, device, group) {
	if (view.index == 0) {
		view.scaleBy(0.6);
	}
	else {
		group.allowDrag = true;
		view.scaleBy(3.4);
		view.moveTo(1615, 2800);
	}
}

app.onconnect(viewSetup);
app.listen(3500);