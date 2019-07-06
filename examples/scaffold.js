// Includes the Wams API
const Wams = require('..');

const app = new Wams.Application();
const { html, image, square } = Wams.predefined.items

app.on('hello', (data) => { console.log(data) })

// app.spawn(html('<h1>hello world</h1>', 300, 100, {
//   x: 300,
//   y: 300,
// }))

app.spawn(square(100, 100, 200, 'yellow'))

// app.spawn(image('/images/joker.png', {
//   width: 100,
//   height: 250,
//   x: 1000,
//   y: 300,
// }))

app.onconnect((view, position) => {
  
  view.onclick = () => {
    app.spawn(square(200, 200, 100, 'green'))

  }

})
app.listen(8080);
