(function () {
  var consoleEl = document.querySelector('[data-search-console]');
  if (!consoleEl || !window.MOVIES_INDEX) {
    return;
  }

  var input = consoleEl.querySelector('[data-search-input]');
  var typeSelect = consoleEl.querySelector('[data-filter-type]');
  var regionSelect = consoleEl.querySelector('[data-filter-region]');
  var yearSelect = consoleEl.querySelector('[data-filter-year]');
  var results = consoleEl.querySelector('[data-search-results]');
  var summary = consoleEl.querySelector('[data-search-summary]');
  var params = new URLSearchParams(window.location.search);
  var initialKeyword = params.get('q') || '';

  input.value = initialKeyword;

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function card(movie) {
    var cover = movie.cover;
    return [
      '<article class="movie-card">',
      '  <a class="movie-link" href="' + movie.url + '" title="' + escapeHtml(movie.title) + '">',
      '    <figure class="movie-cover">',
      '      <img src="' + cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '      <span class="category-badge">' + escapeHtml(movie.category) + '</span>',
      '      <span class="corner-rating">★ ' + escapeHtml(movie.rating) + '</span>',
      '      <span class="play-badge">▶</span>',
      '    </figure>',
      '    <div class="movie-card-body">',
      '      <h3>' + escapeHtml(movie.title) + '</h3>',
      '      <p>' + escapeHtml(movie.oneLine) + '</p>',
      '      <div class="movie-footnote">',
      '        <span>' + escapeHtml(movie.year) + '</span>',
      '        <span>' + escapeHtml(movie.region) + '</span>',
      '        <span>' + escapeHtml(movie.type) + '</span>',
      '      </div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function runSearch() {
    var keyword = normalize(input.value);
    var type = typeSelect.value;
    var region = regionSelect.value;
    var year = yearSelect.value;

    var filtered = window.MOVIES_INDEX.filter(function (movie) {
      var text = normalize([
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.tags,
        movie.oneLine
      ].join(' '));

      if (keyword && text.indexOf(keyword) === -1) {
        return false;
      }
      if (type && movie.type !== type) {
        return false;
      }
      if (region && movie.region !== region) {
        return false;
      }
      if (year && movie.year !== year) {
        return false;
      }
      return true;
    }).slice(0, 120);

    if (!keyword && !type && !region && !year) {
      filtered = window.MOVIES_INDEX.slice(0, 36);
    }

    summary.textContent = '共找到 ' + filtered.length + ' 条结果' + (filtered.length === 120 ? '，已展示前 120 条。' : '。');
    results.innerHTML = filtered.map(card).join('');
  }

  [input, typeSelect, regionSelect, yearSelect].forEach(function (control) {
    control.addEventListener('input', runSearch);
    control.addEventListener('change', runSearch);
  });

  runSearch();
}());
