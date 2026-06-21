(function () {
  function initMoviePlayer(settings) {
    var video = document.getElementById(settings.videoId);
    var cover = document.getElementById(settings.coverId);
    var message = document.getElementById(settings.messageId);
    var source = settings.source;
    var hlsInstance = null;
    var prepared = false;

    if (!video || !source) {
      return;
    }

    function showMessage(text) {
      if (!message) {
        return;
      }
      message.textContent = text;
      message.classList.add("is-visible");
    }

    function prepare() {
      if (prepared) {
        return;
      }
      prepared = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showMessage("视频加载失败，请稍后重试");
          }
        });
      } else {
        showMessage("视频加载失败，请稍后重试");
      }
    }

    function play() {
      prepare();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          if (cover) {
            cover.classList.remove("is-hidden");
          }
        });
      }
    }

    if (cover) {
      cover.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", function () {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
