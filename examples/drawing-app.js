/*
 * This is an advanced example showing a collaborative drawing application. 
 * Several users can connect to an infinite space, they can move around the space
 * and draw on it with different colors and line widths.
 */

const WAMS = require('..')
const path = require('path')
const { html, square } = WAMS.predefined.items
const { actions } = WAMS.predefined

const COLORS = {
    red:    '#D12C1F',
    orange: '#EF9135',
    yellow: '#FBEE4F',
    green:  '#377F34',
    blue:   '#1E4CF5',
    purple: '#6C1684',
    white:  '#fff',
    grey:   '#808080',
    black:  '#000',
}

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

        this.initialColor = 'red'

        this.screensColors = []

        this.initListeners()
    }

    setColor(color, view) {
        // this.app.workspace.state.color = color
        this.screensColors[view.index] = color
        view.color = COLORS[color]
    }

    initListeners() {

        this.app.on('init', (data, view) => {
            const color = this.screensColors[view.index] || this.initialColor
            this.setColor(color, view)
            // this.app.dispatch('init', { color })
            view.dispatch('init', { color })
        })

        // where is this coming from?
        // TODO: update WAMS to pass `view` when invoking `on` callback
        this.app.on('set-control', (type, view) => {
            this.updateControlType(type, view)
        })

        this.app.on('set-color', (color, view) => {
            this.setColor(color, view)
        })
        this.app.spawn(square(200, 200, 100, '#555', {
            onclick: () => {
                this.app.dispatch('init', {
                    color: this.initialColor
                })
            }
        }))
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
        view.allowDrag = true
        view.allowScale = true
    }
}

const app = new DrawingApp()
