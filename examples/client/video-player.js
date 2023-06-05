/* global WAMS, YT */
// flag to know when iframe is ready to be initialized
window.youTubeIframeAPIReady = false;

function onYouTubeIframeAPIReady() {
  window.youTubeIframeAPIReady = true;
}

/**
 *
 * Setting multiple WAMS event listeners to control the player,
 *
 **/

WAMS.on('controlsSpawned', () => {
  const playBtn = document.querySelector('.control-btn-icon');
  const backBtn = document.querySelector('.back-btn-icon');
  const frwdBtn = document.querySelector('.frwd-btn-icon');

  window.controls = {
    lastCurrentTime: 0,
  };

  WAMS.on('video-time-sync', updateTime);

  playBtn.addEventListener('click', handlePlayToggle);
  backBtn.addEventListener('click', handleReplay);
  frwdBtn.addEventListener('click', handleForward);
});

WAMS.on('initVideo', () => {
  // if YouTube iframe API is not ready yet,
  // re-dispatch the `init` custom DOM event later
  if (window.youTubeIframeAPIReady && window.player == undefined) {
    window.player = new YT.Player('player-wrapper', {
      height: '100%',
      width: '100%',
      videoId: 'RONIax0_1ec',
      origin: window.origin,
      events: {
        onStateChange: handlePlayerStateChange,
      },
      playerVars: {
        rel: 0,
      },
    });
    setInterval(() => {
      if (window.player.getCurrentTime) {
        window.controls.lastCurrentTime = Math.floor(window.player.getCurrentTime());
        WAMS.dispatch('video-time-sync', { currentVideoTime: window.controls.lastCurrentTime });
      }
    }, 1000);
  } else {
    setTimeout(() => document.dispatchEvent(new CustomEvent('initVideo')), 100);
  }
});

WAMS.on('setPlayingState', ({ detail }) => {
  const controlBtn = document.querySelector('.control-btn-icon');
  if (detail.playing) {
    controlBtn.classList.replace('fa-play', 'fa-pause');
    window.player && window.player.playVideo();
  } else {
    controlBtn.classList.replace('fa-pause', 'fa-play');
    window.player && window.player.pauseVideo();
  }
});

WAMS.on('replay', () => {
  window.player && window.player.seekTo(window.player.getCurrentTime() - 10);
});

WAMS.on('forward', () => {
  window.player && window.player.seekTo(window.player.getCurrentTime() + 10);
});

/**
 *
 * Handlers for events above.
 *
 **/

function handlePlayerStateChange({ data }) {
  //    -1         0        1         2         3           5
  // unstarted   ended   playing   paused   buffering   video cued
  const playing = data !== 2 && data !== 5;
  WAMS.dispatch('play-state-changed', { playing });
}

function updateTime({ detail }) {
  document.querySelector('.video-time').textContent = secondsToMinSecs(detail);
  window.controls.lastCurrentTime = detail;
}

function handlePlayToggle() {
  WAMS.dispatch('toggle-play-state');
}

function handleReplay() {
  WAMS.dispatch('replay');

  // handle possible negative seconds
  let newTime = Math.floor(window.controls.lastCurrentTime) - 10;
  if (Math.sign(newTime) === -1) newTime = 0;

  WAMS.dispatch('video-time-sync', { currentVideoTime: newTime });
}

function handleForward() {
  WAMS.dispatch('forward');
  const newTime = Math.floor(window.controls.lastCurrentTime) + 10;
  WAMS.dispatch('video-time-sync', { currentVideoTime: newTime });
}

function secondsToMinSecs(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds - minutes * 60;

  const minutesStr = minutes.toString().padStart(2, '0');
  const secondsStr = seconds.toString().padStart(2, '0');
  return `${minutesStr}:${secondsStr}`;
}
