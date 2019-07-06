/*
 * This is a simple example showing how users can interact with a shared set
 *  of items.
 */

'use strict';

const Wams = require('..');
const path = require('path');

// Provide custom route for card assets
const router = new Wams.Router();
const icons = path.join(__dirname, '../img/Icons');
router.use('/icons', router.express.static(icons));

class VideoPlayer {
    constructor() {
        this.app = new Wams.Application({
            clientLimit: 2,
            color: '#555',
        });

        this.player = {
            playing: false
        }
        this.videoPlayerExists = false
        this.app.on('play/pause', this.handlePlayerStateChange.bind(this))
        this.app.on('forward', this.handleForward.bind(this))
        this.app.on('replay', this.handleReplay.bind(this))
        this.app.on('video-time-sync', this.handleVideoTimeSync.bind(this))
        this.app.onconnect(this.handleConnect.bind(this))
        this.app.ondisconnect(this.handleDisconnect.bind(this))
        this.app.listen(9020)
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
        this.app.spawnElement(Wams.predefined.items.html(
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
        ));

        this.videoPlayerExists = true
    }

    spawnControls(options) {
        const playing = this.player.playing
        const width = 300
        const height = 200
        const x = this.mainScreen.width / 2 - width / 2
        const y = this.mainScreen.height * 4 / 5

        const html = `
        <div id="controls">
            <div class="video-title">
                ${options.videoTitle}
            </div>
            <div class="control-buttons">
                <i class="fas fa-undo-alt back-btn-icon"></i>
                <i class="fas fa-${playing ? 'pause' : 'play'} control-btn-icon"></i>
                <i class="fas fa-redo-alt frwd-btn-icon"></i>
            </div>
            <div class="video-time">00:00</div>
        </div>`

        this.controls = this.app.spawnElement(Wams.predefined.items.html(html, width, height, {
            x, y, width, height, playing,
            type: 'controls',
            ondrag: Wams.predefined.drag,
            onrotate: Wams.predefined.rotate,
            onscale: Wams.predefined.scale,
        }))

        // this.controls = this.app.spawnElement(Wams.predefined.items.htmlGroup(
        //     {
        //         x, y, width, height, style,
        //     },
        //     {
        //         html: html1,
        //         onclick: this.handleReplay,
        //     },
        //     {
        //         html: html2,
        //         onclick: this.handlePlayPause,
        //     },
        //     {
        //         html: html3,
        //         onclick: this.handleForward,
        //     }
        // ))
    }

    // main function
    // called each time a browser connects
    handleConnect(view, position) {
        if (!this.videoPlayerExists) {
            this.spawnPlayerWrapper(view)
        }


        // removing and re-creating controls
        // hacky way to show current play/pause btn status
        // for newly connected device
        if (this.controls) this.app.removeItem(this.controls)
        this.spawnControls({
            videoTitle: 'Apollo 11 landing from PDI to Touchdown',
        })

        this.app.dispatch('controlsSpawned')

        if (position === 0) this.app.dispatch('init')

        if (position === 1) {

            const initialOffset = [- (this.mainScreen.width * 2), 0]

            view.moveBy(...initialOffset)

            this.controls.moveTo(
                view.x + view.width / 2 - this.controls.width / 2,
                view.y + view.height / 2 - this.controls.height / 2
            )

        }
    }

    handleDisconnect(view, position) {
        this.controls.moveTo(
            this.mainScreen.width / 2 - this.controls.width / 2,
            this.mainScreen.height * 4 / 5
        )
    }


}


const player = new VideoPlayer()

