window.youTubeIframeAPIReady = false

function onYouTubeIframeAPIReady() {
  window.youTubeIframeAPIReady = true
}

function handlePlayerStateChange({ data }) {
  // -1 unstarted
  //  0 ended
  //  1 playing
  //  2 paused
  //  3 buffering
  //  5 video cued
  const playing = (data !== 2 && data !== 5)
  Wams.dispatch('play/pause', playing)
}

function onWamsReady() {
  Wams.dispatch('hello', "world!")
  Wams.on('init', () => {
    // if YouTube iframe API is not ready yet,
    // re-dispatch the `init` custom DOM event later
    if (window.youTubeIframeAPIReady) {
      window.player = new YT.Player('player-wrapper', {
        height: '100%',
        width: '100%',
        videoId: 'RONIax0_1ec',
        origin: window.origin,
        events: {
          'onStateChange': handlePlayerStateChange
        }
      })
      setInterval(() => {
        Wams.dispatch('video-time-sync', Math.floor(window.player.getCurrentTime()))
        window.controls.lastCurrentTime = Math.floor(window.player.getCurrentTime())
      }, 1000)

    } else {
      setTimeout(() => document.dispatchEvent(new CustomEvent('init')), 100)
    }
  })

  function updateTime({ detail }) {
    document.querySelector('.video-time').textContent = secondsToMinSecs(detail)
    window.controls.lastCurrentTime = detail
  }

  function secondsToMinSecs(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds - minutes * 60

    let minutesStr = minutes.toString().padStart(2, '0')
    let secondsStr = seconds.toString().padStart(2, '0')
    return `${minutesStr}:${secondsStr}`
  }

  function handlePlayToggle() {
    Wams.dispatch('play/pause')
  }

  function handleReplay() {
    Wams.dispatch('replay')

    // handle possible negative seconds
    let newTime = Math.floor(window.controls.lastCurrentTime) - 10
    if (Math.sign(newTime) === -1) newTime = 0

    Wams.dispatch('video-time-sync', newTime)
  }

  function handleForward() {
    Wams.dispatch('forward')
    let newTime = Math.floor(window.controls.lastCurrentTime) + 10
    Wams.dispatch('video-time-sync', newTime)
  }


  Wams.on('controlsSpawned', () => {
    const playBtn = document.querySelector('.control-btn-icon')
    const backBtn = document.querySelector('.back-btn-icon')
    const frwdBtn = document.querySelector('.frwd-btn-icon')
    const title = document.querySelector('.video-title')

    window.controls = {
      lastCurrentTime: 0
    }

    Wams.on('video-time-sync', updateTime)

    // for some mystical reason, in WAMS
    // touch events don't automatically trigger click events
    // which they should do
    // so you have to listen for touch events separately from clicks
    playBtn.addEventListener('click', handlePlayToggle)
    playBtn.addEventListener('touchstart', handlePlayToggle)

    backBtn.addEventListener('click', handleReplay)
    backBtn.addEventListener('touchstart', handleReplay)

    frwdBtn.addEventListener('click', handleForward)
    frwdBtn.addEventListener('touchstart', handleForward)


  })

  Wams.on('setPlayingState', ({ detail }) => {
    const controlBtn = document.querySelector('.control-btn-icon')
    if (detail.playing) {
      controlBtn.classList.replace('fa-play', 'fa-pause')
      window.player.playVideo()
    } else {
      controlBtn.classList.replace('fa-pause', 'fa-play')
      window.player.pauseVideo()
    }
  })

  Wams.on('replay', () => {
    window.player.seekTo(window.player.l.currentTime - 10)
  })

  Wams.on('forward', () => {
    window.player.seekTo(window.player.l.currentTime + 10)
  })

  /**
   * Code to recreate the ongoing video

      time = window.player.getCurrentTime()
      window.player.destroy()
      delete window.player
      window.player = {}
      window.player = new YT.Player('player-wrapper', {
        height: '100%',
        width: '100%',
        videoId: 'RONIax0_1ec',
        playerVars: { controls: 0, start: Math.floor(time), autoplay: 1 },
        origin: window.origin,
      });

   */
}
