(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
            return;
        }
        callback();
    }

    function setupMobileMenu() {
        var button = document.querySelector('[data-menu-button]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var nextButton = hero.querySelector('[data-hero-next]');
        var prevButton = hero.querySelector('[data-hero-prev]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function startTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        if (nextButton) {
            nextButton.addEventListener('click', function () {
                show(index + 1);
                startTimer();
            });
        }
        if (prevButton) {
            prevButton.addEventListener('click', function () {
                show(index - 1);
                startTimer();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                startTimer();
            });
        });
        show(0);
        startTimer();
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
        panels.forEach(function (panel) {
            var scope = panel.closest('section') || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
            var searchInput = panel.querySelector('[data-card-search]');
            var selects = Array.prototype.slice.call(panel.querySelectorAll('[data-filter]'));
            var reset = panel.querySelector('[data-reset-filters]');
            var empty = scope.querySelector('[data-empty-state]');
            var urlParams = new URLSearchParams(window.location.search);
            var initialSearch = urlParams.get('search');

            if (searchInput && initialSearch) {
                searchInput.value = initialSearch;
            }

            function applyFilters() {
                var query = normalize(searchInput ? searchInput.value : '');
                var filters = {};
                selects.forEach(function (select) {
                    filters[select.getAttribute('data-filter')] = normalize(select.value);
                });
                var visible = 0;
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute('data-search'));
                    var matched = true;
                    if (query && text.indexOf(query) === -1) {
                        matched = false;
                    }
                    Object.keys(filters).forEach(function (key) {
                        var value = filters[key];
                        var cardValue = normalize(card.getAttribute('data-' + key));
                        if (value && cardValue.indexOf(value) === -1) {
                            matched = false;
                        }
                    });
                    card.classList.toggle('is-hidden-by-filter', !matched);
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }

            if (searchInput) {
                searchInput.addEventListener('input', applyFilters);
            }
            selects.forEach(function (select) {
                select.addEventListener('change', applyFilters);
            });
            if (reset) {
                reset.addEventListener('click', function () {
                    if (searchInput) {
                        searchInput.value = '';
                    }
                    selects.forEach(function (select) {
                        select.value = '';
                    });
                    applyFilters();
                });
            }
            applyFilters();
        });
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('.static-player'));
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('.player-start');
            var source = player.getAttribute('data-video-url');
            var hlsInstance = null;
            var isAttached = false;

            if (!video || !source) {
                return;
            }

            function attachSource() {
                if (isAttached) {
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                } else {
                    video.src = source;
                }
                isAttached = true;
            }

            function playVideo(event) {
                if (event) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                attachSource();
                var promise = video.play();
                if (promise && typeof promise.then === 'function') {
                    promise.then(function () {
                        if (button) {
                            button.classList.add('is-hidden');
                        }
                    }).catch(function () {
                        if (button) {
                            button.classList.remove('is-hidden');
                        }
                    });
                } else if (button) {
                    button.classList.add('is-hidden');
                }
            }

            if (button) {
                button.addEventListener('click', playVideo);
            }
            video.addEventListener('play', function () {
                if (button) {
                    button.classList.add('is-hidden');
                }
            });
            video.addEventListener('pause', function () {
                if (video.currentTime === 0 && button) {
                    button.classList.remove('is-hidden');
                }
            });
            player.addEventListener('click', function (event) {
                if (event.target === player) {
                    playVideo(event);
                }
            });
            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });
}());
