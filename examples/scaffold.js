// scaffold example for an app

const WAMS = require('..');
const app = new WAMS.Application();

app.on('connect', ({ view }) => {});

app.listen(9000);
