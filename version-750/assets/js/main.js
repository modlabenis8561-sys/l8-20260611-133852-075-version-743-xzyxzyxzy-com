(function () {
  var toggle = document.querySelector('.nav-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.style.opacity = '0';
      if (image.parentElement) {
        image.parentElement.classList.add('missing-image');
      }
    });
  });

  var hero = document.querySelector('.hero');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-target]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function activate(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        activate(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        activate(Number(dot.getAttribute('data-hero-target')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        activate(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        activate(current + 1);
        restart();
      });
    }

    restart();
  }

  function initHlsPlayer(shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.js-play-button');
    var status = shell.querySelector('[data-player-status]');
    var src = shell.getAttribute('data-video-src');

    if (!video || !src) {
      if (status) {
        status.textContent = '未找到可用播放源。';
      }
      return;
    }

    function setStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function playVideo() {
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          setStatus('浏览器阻止了自动播放，请再次点击播放器开始播放。');
        });
      }
      shell.classList.add('is-playing');
    }

    if (shell.dataset.playerReady === 'true') {
      playVideo();
      return;
    }

    shell.dataset.playerReady = 'true';
    setStatus('正在加载播放源…');

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        setStatus('播放源加载完成。');
        playVideo();
      });
      hls.on(window.Hls.Events.ERROR, function (_, data) {
        if (data && data.fatal) {
          setStatus('播放源加载失败，请检查网络或稍后重试。');
        }
      });
      shell._hls = hls;
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('loadedmetadata', function () {
        setStatus('播放源加载完成。');
        playVideo();
      }, { once: true });
      video.addEventListener('error', function () {
        setStatus('播放源加载失败，请检查网络或稍后重试。');
      }, { once: true });
      return;
    }

    setStatus('当前浏览器不支持 HLS m3u8 播放，请使用 Safari、Chrome、Edge 或 Firefox 最新版本。');
  }

  document.querySelectorAll('.js-player').forEach(function (shell) {
    var button = shell.querySelector('.js-play-button');
    var video = shell.querySelector('video');

    if (button) {
      button.addEventListener('click', function () {
        initHlsPlayer(shell);
      });
    }

    if (video) {
      video.addEventListener('play', function () {
        shell.classList.add('is-playing');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          shell.classList.remove('is-playing');
        }
      });
    }
  });
}());
