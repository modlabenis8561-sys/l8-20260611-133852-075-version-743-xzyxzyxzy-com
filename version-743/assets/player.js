import { H as Hls } from './hls-vendor.js';

const preparePlayer = (box) => {
  const video = box.querySelector('video');
  const overlay = box.querySelector('.player-overlay');
  const source = video ? video.dataset.src : '';
  let hlsInstance = null;
  let initialized = false;

  if (!video || !overlay || !source) {
    return;
  }

  const attachSource = () => {
    if (initialized) {
      return;
    }

    initialized = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 60
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = source;
  };

  const startPlayback = async () => {
    overlay.classList.add('is-hidden');
    attachSource();

    try {
      await video.play();
    } catch (error) {
      overlay.classList.remove('is-hidden');
    }
  };

  overlay.addEventListener('click', startPlayback);

  video.addEventListener('click', () => {
    if (video.paused) {
      startPlayback();
    }
  });

  video.addEventListener('play', () => {
    overlay.classList.add('is-hidden');
  });

  video.addEventListener('error', () => {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
      initialized = false;
    }
  });
};

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-player]').forEach(preparePlayer);
});
