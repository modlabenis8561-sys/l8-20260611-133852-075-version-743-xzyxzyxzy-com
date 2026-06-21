(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  var slides = selectAll('[data-hero-slide]');
  var dots = selectAll('[data-hero-dot]');
  var current = 0;

  function showSlide(index) {
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

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var filterRoot = document.querySelector('[data-filter-root]');

  if (filterRoot) {
    var input = filterRoot.querySelector('[data-filter-input]');
    var sort = filterRoot.querySelector('[data-filter-sort]');
    var buttons = selectAll('[data-region-filter]', filterRoot);
    var grid = filterRoot.querySelector('[data-movie-grid]');
    var emptyState = filterRoot.querySelector('[data-empty-state]');
    var cards = selectAll('[data-movie-card]', filterRoot);
    var activeRegion = 'all';

    function getQueryFromUrl() {
      var params = new URLSearchParams(window.location.search);
      return params.get('q') || '';
    }

    if (input && input.hasAttribute('data-use-query')) {
      input.value = getQueryFromUrl();
    }

    function applyFilters() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var visible = 0;

      cards.forEach(function (card) {
        var index = card.getAttribute('data-index') || '';
        var region = card.getAttribute('data-region') || '';
        var matchKeyword = !keyword || index.indexOf(keyword) !== -1;
        var matchRegion = activeRegion === 'all' || region === activeRegion;
        var shouldShow = matchKeyword && matchRegion;

        card.style.display = shouldShow ? '' : 'none';

        if (shouldShow) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    function sortCards() {
      if (!grid || !sort) {
        return;
      }

      var value = sort.value;
      var sorted = cards.slice();

      sorted.sort(function (a, b) {
        if (value === 'year') {
          return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
        }

        if (value === 'title') {
          return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
        }

        return 0;
      });

      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    if (input) {
      input.addEventListener('input', applyFilters);
    }

    if (sort) {
      sort.addEventListener('change', function () {
        sortCards();
        applyFilters();
      });
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeRegion = button.getAttribute('data-region-filter') || 'all';
        buttons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        applyFilters();
      });
    });

    sortCards();
    applyFilters();
  }
})();
