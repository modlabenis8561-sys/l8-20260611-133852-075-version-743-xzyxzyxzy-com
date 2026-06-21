(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (toggle && menu) {
            toggle.addEventListener("click", function () {
                menu.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var thumbs = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-thumb]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === current);
                });
                thumbs.forEach(function (thumb, i) {
                    thumb.classList.toggle("is-active", i === current);
                });
            }

            function restart() {
                if (timer) {
                    clearInterval(timer);
                }
                timer = setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                    restart();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                    restart();
                });
            }
            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                    restart();
                });
            });
            restart();
        }

        var fields = Array.prototype.slice.call(document.querySelectorAll("[data-search-field]"));
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
        var activeValue = "";

        function applyFilter(value) {
            var term = String(value || "").trim().toLowerCase();
            var active = String(activeValue || "").trim().toLowerCase();
            cards.forEach(function (card) {
                var text = [
                    card.getAttribute("data-title"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-tags"),
                    card.textContent
                ].join(" ").toLowerCase();
                var matchTerm = !term || text.indexOf(term) !== -1;
                var matchActive = !active || text.indexOf(active) !== -1;
                card.style.display = matchTerm && matchActive ? "" : "none";
            });
        }

        fields.forEach(function (field) {
            field.addEventListener("input", function () {
                applyFilter(field.value);
            });
        });

        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                buttons.forEach(function (item) {
                    item.classList.remove("is-active");
                });
                button.classList.add("is-active");
                activeValue = button.getAttribute("data-filter-value") || "";
                var value = fields.length ? fields[0].value : "";
                applyFilter(value);
            });
        });

        var video = document.querySelector("[data-player-video]");
        if (video && typeof mediaUrl !== "undefined") {
            var cover = document.querySelector("[data-player-cover]");
            var playButtons = Array.prototype.slice.call(document.querySelectorAll("[data-play-button], [data-player-cover]"));
            var attached = false;
            var pendingPlay = false;

            function attach() {
                if (attached) {
                    return;
                }
                attached = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = mediaUrl;
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls();
                    hls.loadSource(mediaUrl);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        if (pendingPlay) {
                            video.play();
                        }
                    });
                    return;
                }
                video.src = mediaUrl;
            }

            function start() {
                pendingPlay = true;
                attach();
                if (cover) {
                    cover.classList.add("is-hidden");
                }
                var attempt = video.play();
                if (attempt && attempt.catch) {
                    attempt.catch(function () {
                        if (cover && !video.currentTime) {
                            cover.classList.remove("is-hidden");
                        }
                    });
                }
            }

            playButtons.forEach(function (button) {
                button.addEventListener("click", start);
            });
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                } else {
                    video.pause();
                }
            });
        }
    });
}());
