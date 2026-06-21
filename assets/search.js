(() => {
  const form = document.querySelector('[data-search-form]');
  const input = document.querySelector('[data-search-input]');
  const results = document.querySelector('[data-search-results]');
  const title = document.querySelector('[data-search-title]');
  const summary = document.querySelector('[data-search-summary]');
  const index = Array.isArray(window.SEARCH_INDEX) ? window.SEARCH_INDEX : [];

  if (!form || !input || !results) {
    return;
  }

  const escapeHtml = (value) => String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  const cardHtml = (movie) => `
<article class="movie-card">
  <a class="movie-poster" href="${escapeHtml(movie.url)}" aria-label="观看${escapeHtml(movie.title)}">
    <img src="./${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}" loading="lazy">
    <span class="poster-type">${escapeHtml(movie.type)}</span>
    <span class="poster-year">${escapeHtml(movie.year)}</span>
    <span class="poster-play" aria-hidden="true">▶</span>
  </a>
  <div class="movie-card-body">
    <h3><a href="${escapeHtml(movie.url)}">${escapeHtml(movie.title)}</a></h3>
    <p>${escapeHtml(movie.oneLine)}</p>
    <div class="movie-meta">
      <span>${escapeHtml(movie.region)}</span>
      <span>${escapeHtml(movie.genre)}</span>
    </div>
    <div class="movie-tags">
      ${movie.tags.slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}
    </div>
  </div>
</article>`;

  const runSearch = (keyword) => {
    const query = keyword.trim().toLowerCase();

    if (!query) {
      return;
    }

    const found = index
      .filter((movie) => movie.searchText.includes(query))
      .slice(0, 120);

    if (title) {
      title.textContent = `搜索结果：${keyword}`;
    }

    if (summary) {
      summary.textContent = found.length ? `找到 ${found.length} 条相关影片。` : '未找到完全匹配的影片，可以尝试更短的关键词。';
    }

    results.innerHTML = found.length
      ? found.map(cardHtml).join('')
      : '<article class="story-card"><h2>暂无匹配结果</h2><p>请尝试搜索片名、地区、年份、题材或标签。</p></article>';
  };

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q') || '';

  if (initialQuery) {
    input.value = initialQuery;
    runSearch(initialQuery);
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const keyword = input.value.trim();
    const nextUrl = keyword ? `search.html?q=${encodeURIComponent(keyword)}` : 'search.html';
    window.history.replaceState(null, '', nextUrl);
    runSearch(keyword);
  });
})();
