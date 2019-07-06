/*
 * This is a simple example showing how users can interact with a shared set
 *  of items.
 */

'use strict';

const Wams = require('..');
const path = require('path');
const { Rectangle } = require('../src/shared.js')

// Provide custom route for card assets
const router = new Wams.Router();
const icons = path.join(__dirname, '../img/Icons');
router.use('/icons', router.express.static(icons));

class VideoPlayer {
    constructor() {
        this.app = new Wams.Application({
            clientLimit: 2,
            color: 'transparent',
        }, router);

        this.app.on('video-time-sync', () => {})
        this.app.onconnect(this.handleConnect.bind(this))
        this.app.ondisconnect(this.handleDisconnect.bind(this))
        this.app.listen(9020)
    }

    spawnPlayerWrapper(view) {
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
        this.videoPlayerExists = true
        // const playing = this.player.playing
        const width = 60
        const height = width
        const x = this.mainScreen.width / 2 - width / 2
        const y = this.mainScreen.height / 2

        const replayBtn = this.app.spawnImage(Wams.predefined.items.image('icons/white/replay.png', {
            x: x - width, y, height, width, type: 'replay',
            onclick: this.handleReplay.bind(this),
        }))

        const playBtn = this.app.spawnImage(Wams.predefined.items.image('icons/white/play.png', {
            x, y: y * 0.98, height: height * 1.4, width: width * 1.4, type: 'control',
            onclick: this.handlePlayPause.bind(this),
        }))

        const forwardBtn = this.app.spawnImage(Wams.predefined.items.image('icons/white/forward.png', {
            x: x + width * 1.4, y, height, width, type: 'forward',
            onclick: this.handleForward.bind(this),
        }))

        const text = new Wams.CanvasSequence();
        text.font = 'normal 36px sans-serif';
        text.fillStyle = '#fff';
        text.fillText('00:00', 0, 0);

        // app.spawnItem({
        //     x: 380,
        //     y: 230,
        //     type: 'text',
        //     sequence: text,
        // });

        this.controls = this.app.createGroup({
            items: [replayBtn, playBtn, forwardBtn],
            ondrag: Wams.predefined.dragGroup
        })

    }

    handlePlayPause(e) {
        console.log('play/pause...')
    }

    handleReplay(e) {
        console.log('replaying...')
    }

    handleForward(e) {
        console.log('forwarding...')
    }

    // main function
    // called each time a browser connects
    handleConnect(view, position) {
        if (position === 0) {
            this.mainScreen = { width: view.width, height: view.height }

            if (!this.videoPlayerExists) {
                this.spawnPlayerWrapper(view)
                this.spawnControls({
                    videoTitle: 'Apollo 11 landing from PDI to Touchdown',
                })
            }

            this.app.dispatch('init')
        }






        // removing and re-creating controls
        // hacky way to show current play/pause btn status
        // for newly connected device
        // if (this.controls) this.app.removeItem(this.controls)


        // this.app.dispatch('controlsSpawned')

        // if (position === 0) this.app.dispatch('init')

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
        // this.controls.moveTo(
        //     this.mainScreen.width / 2 - this.controls.width / 2,
        //     this.mainScreen.height * 4 / 5
        // )
    }


}


const player = new VideoPlayer()

