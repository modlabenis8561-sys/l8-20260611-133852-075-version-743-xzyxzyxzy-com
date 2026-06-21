(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    document.querySelectorAll("[data-menu-button]").forEach(function (button) {
      var menu = document.querySelector("[data-mobile-menu]");
      button.addEventListener("click", function () {
        var open = button.classList.toggle("is-open");
        if (menu) {
          menu.classList.toggle("is-open", open);
        }
      });
    });

    document.querySelectorAll("[data-hero]").forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
          dot.setAttribute("aria-pressed", dotIndex === index ? "true" : "false");
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5000);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          start();
        });
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
          start();
        });
      });

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      show(0);
      start();
    });

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input) {
          return;
        }
        var query = input.value.trim();
        if (!query) {
          return;
        }
        event.preventDefault();
        window.location.href = "./search.html?q=" + encodeURIComponent(query);
      });
    });

    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
      var input = panel.querySelector("[data-filter-input]");
      var year = panel.querySelector("[data-filter-year]");
      var region = panel.querySelector("[data-filter-region]");
      var type = panel.querySelector("[data-filter-type]");
      var list = panel.parentElement.querySelector("[data-filter-list]");
      var empty = panel.querySelector("[data-filter-empty]");
      var cards = list ? Array.prototype.slice.call(list.querySelectorAll(".movie-card")) : [];

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var selectedYear = year ? year.value : "";
        var selectedRegion = region ? region.value : "";
        var selectedType = type ? type.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var searchText = (card.getAttribute("data-search") || "").toLowerCase();
          var cardYear = card.getAttribute("data-year") || "";
          var cardRegion = card.getAttribute("data-region") || "";
          var cardType = card.getAttribute("data-type") || "";
          var matched = true;

          if (query && searchText.indexOf(query) === -1) {
            matched = false;
          }
          if (selectedYear && cardYear !== selectedYear) {
            matched = false;
          }
          if (selectedRegion && cardRegion !== selectedRegion) {
            matched = false;
          }
          if (selectedType && cardType !== selectedType) {
            matched = false;
          }

          card.hidden = !matched;
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [input, year, region, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      if (input && document.body.dataset.searchPage === "true") {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (query) {
          input.value = query;
        }
      }

      apply();
    });

    document.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var overlay = player.querySelector(".play-overlay");
      var started = false;
      var hls = null;

      function play() {
        if (!video) {
          return;
        }
        var stream = video.getAttribute("data-stream");
        if (!stream) {
          return;
        }
        if (!started) {
          started = true;
          video.controls = true;
          if (overlay) {
            overlay.classList.add("is-hidden");
          }
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
          } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls();
            hls.loadSource(stream);
            hls.attachMedia(video);
          } else {
            video.src = stream;
          }
        }
        var action = video.play();
        if (action && typeof action.catch === "function") {
          action.catch(function () {
            if (overlay) {
              overlay.classList.remove("is-hidden");
            }
          });
        }
      }

      if (overlay) {
        overlay.addEventListener("click", play);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (!started) {
            play();
          }
        });
      }

      window.addEventListener("beforeunload", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  });
})();
