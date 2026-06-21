(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        stop();
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function getText(element, name) {
    return (element.getAttribute(name) || "").toLowerCase();
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var textInput = scope.querySelector("[data-filter-text]");
      var regionSelect = scope.querySelector("[data-filter-region]");
      var typeSelect = scope.querySelector("[data-filter-type]");
      var yearSelect = scope.querySelector("[data-filter-year]");
      var clearButton = scope.querySelector("[data-filter-clear]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-card]"));
      var empty = scope.querySelector("[data-filter-empty]");

      function applyQueryFromUrl() {
        if (!textInput) {
          return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (query) {
          textInput.value = query;
        }
      }

      function valueOf(input) {
        return input ? input.value.trim().toLowerCase() : "";
      }

      function filter() {
        var query = valueOf(textInput);
        var region = valueOf(regionSelect);
        var type = valueOf(typeSelect);
        var year = valueOf(yearSelect);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            getText(card, "data-title"),
            getText(card, "data-region"),
            getText(card, "data-type"),
            getText(card, "data-year"),
            getText(card, "data-tags")
          ].join(" ");
          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          var matchesRegion = !region || getText(card, "data-region").indexOf(region) !== -1;
          var matchesType = !type || getText(card, "data-type").indexOf(type) !== -1;
          var matchesYear = !year || getText(card, "data-year") === year;
          var showCard = matchesQuery && matchesRegion && matchesType && matchesYear;
          card.classList.toggle("is-hidden-by-filter", !showCard);
          if (showCard) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      [textInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", filter);
          control.addEventListener("change", filter);
        }
      });

      if (clearButton) {
        clearButton.addEventListener("click", function () {
          [textInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
              control.value = "";
            }
          });
          filter();
        });
      }

      applyQueryFromUrl();
      filter();
    });
  }

  onReady(function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
  });
})();
