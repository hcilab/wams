/*
 * This is an advanced example showing a collaborative drawing application. 
 * Several users can connect to an infinite space, they can move around the space
 * and draw on it with different colors and line widths.
 */

const WAMS = require('..')
const path = require('path')
const { html, square } = WAMS.predefined.items
const { actions } = WAMS.predefined

// markup for video player controls
const controlsHtml = ({ pan, draw }) => (
    `<div id="controls">
        <ul class="control-buttons">
            <div class="button">
                <i class="far fa-hand-paper ${pan ? 'active' : ''}"></i>
            </div>
            <div class="button">
                <i class="fas fa-pencil-alt ${draw ? 'active' : ''}"></i>
            </div>
        </ul>
    </div>`
)

class DrawingApp {
    constructor() {
        this.app = new WAMS.Application({
            clientLimit: 2,
            color: 'white',
            clientScripts: [
                'https://kit.fontawesome.com/3cc3d78fde.js',
                'drawing-app.js',
            ],
            stylesheets: [
                './drawing-app.css'
            ],
            title: 'Collaborative Drawing',
            staticDir: path.join(__dirname, './client'),
        })

        this.initListeners()
    }

    initListeners() {
        // where is this coming from?
        // TODO: update WAMS to pass `view` when invoking `on` callback
        this.app.on('set-control', (type, view) => {
            this.updateControlType(type, view)
        })
        this.app.spawn(square(200, 200, 100, '#555'))
        this.app.onconnect(this.handleConnect.bind(this))
        this.app.listen(8080)
    }

    updateControlType(type, view) {
        this.controlType = type

        view.ondrag = type === 'pan' ? actions.drag : actions.draw
    }

    spawnControls(view) {
        const width = 60
        const height = 100
        const x = view.width - width
        const y = view.height / 2 - height / 2
        const markup = controlsHtml({ draw: true, pan: false })

        this.controls = this.app.spawn(html(markup, width, height, {
            x, y, width, height,
        }))
    }

    handleConnect(view) {
        this.app.dispatch('init')
        // // re-rendering controls
        // // to show current play/pause btn status
        // // for newly connected device
        // if (this.controls) this.app.removeItem(this.controls)
        // this.spawnControls(view)

        // // notify clients that controls are spawned
        // this.app.dispatch('controlsSpawned')
        view.allowDrag = true
    }
}

const app = new DrawingApp()
