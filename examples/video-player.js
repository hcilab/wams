/*
 * This is an advanced example showing a distributed video-player. 
 * The first connected device can see a YouTube video and player controls.
 * When the second device connects, the controls move to their screen 
 * and are synced with the video.
 */

const WAMS = require('..')
const path = require('path')
const { html } = WAMS.predefined.items

// markup for video player controls
const controlsHtml = (videoTitle, playing) => (
    `<div id="controls">
        <div class="video-title">
            ${videoTitle}
        </div>
        <div class="control-buttons">
            <i class="fas fa-undo-alt back-btn-icon"></i>
            <i class="fas fa-${playing ? 'pause' : 'play'} control-btn-icon"></i>
            <i class="fas fa-redo-alt frwd-btn-icon"></i>
        </div>
        <div class="video-time">00:00</div>
    </div>`
)

class VideoPlayer {
    constructor() {
        this.app = new WAMS.Application({
            clientLimit: 2,
            color: '#555',
            clientScripts: [
                'https://kit.fontawesome.com/3cc3d78fde.js',
                'video-player.js',
                'https://www.youtube.com/iframe_api'
            ],
            title: 'Video Player',
            staticDir: path.join(__dirname, './client'),
        })

        this.player = {
            playing: false,
            mounted: false,
        }
        this.initListeners()
    }

    initListeners() {
        this.app.on('play/pause',      this.handlePlayerStateChange.bind(this))
        this.app.on('forward',         this.handleForward.bind(this))
        this.app.on('replay',          this.handleReplay.bind(this))
        this.app.on('video-time-sync', this.handleVideoTimeSync.bind(this))
        this.app.onconnect(this.handleConnect.bind(this))
        this.app.ondisconnect(this.handleDisconnect.bind(this))
        this.app.listen(8080)
    }

    handlePlayerStateChange(playing) {
        if (playing === undefined) {
            this.player.playing = !this.player.playing
            this.app.dispatch('setPlayingState', { playing: this.player.playing })
        } else {
            if (playing === this.player.playing) return
            this.player.playing = playing
            this.app.dispatch('setPlayingState', { playing })
        }
    }

    handleVideoTimeSync(currentVideoTime) {
        this.app.dispatch('video-time-sync', currentVideoTime)
    }

    handleForward() {
        this.app.dispatch('forward')
    }

    handleReplay() {
        this.app.dispatch('replay')
    }

    spawnPlayerWrapper(view) {
        this.mainScreen = { width: view.width, height: view.height }
        this.app.spawn(html(
            `<div id="player-wrapper"></div>`,
            this.mainScreen.width,
            this.mainScreen.height,
            {
                x: 0,
                y: 0,
                width: this.mainScreen.width,
                height: this.mainScreen.height,
                type: 'player',
            }
        ))

        this.player.mounted = true
    }

    spawnControls(options) {
        const playing = this.player.playing
        const width = 300
        const height = 200
        const x = this.mainScreen.width / 2 - width / 2
        const y = this.mainScreen.height * 3 / 4
        const markup = controlsHtml(options.videoTitle, playing)

        this.controls = this.app.spawn(html(markup, width, height, {
            x, y, width, height, playing,
            type: 'controls',
            ondrag: WAMS.predefined.drag,
            onscale: WAMS.predefined.scale,
        }))
    }

    handleConnect(view) {
        if (!this.player.mounted) {
            this.spawnPlayerWrapper(view)
        }

        // re-rendering controls
        // to show current play/pause btn status
        // for newly connected device
        if (this.controls) this.app.removeItem(this.controls)
        this.spawnControls({
            videoTitle: 'Apollo 11 landing from PDI to Touchdown',
        })

        // notify clients that controls are spawned
        this.app.dispatch('controlsSpawned')

        if (view.index === 0) this.app.dispatch('initVideo')
        if (view.index === 1) {
            const initialOffset = [- (this.mainScreen.width * 2), 0]
            view.moveBy(...initialOffset)
            this.controls.moveTo(
                view.x + view.width / 2 - this.controls.width / 2,
                view.y + view.height / 2 - this.controls.height / 2
            )
        }
    }

    handleDisconnect() {
        this.controls.moveTo(
            this.mainScreen.width / 2 - this.controls.width / 2,
            this.mainScreen.height * 4 / 5
        )
    }
}

const player = new VideoPlayer()
