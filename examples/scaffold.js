// scaffold example for an app

const WAMS = require('..');
const app = new WAMS.Application();

app.onconnect((view) => {});

app.listen(8080);
