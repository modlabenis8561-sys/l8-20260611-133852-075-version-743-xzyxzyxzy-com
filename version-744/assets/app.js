(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-nav-toggle]");
        var mobile = document.querySelector("[data-mobile-nav]");
        if (toggle && mobile) {
            toggle.addEventListener("click", function () {
                mobile.classList.toggle("open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".visual-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-slide-index]"));
        var current = 0;
        var timer = null;

        function showSlide(index) {
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
        }

        function nextSlide() {
            showSlide(current + 1);
        }

        if (slides.length) {
            showSlide(0);
            var next = document.querySelector("[data-slide-next]");
            var prev = document.querySelector("[data-slide-prev]");
            if (next) {
                next.addEventListener("click", nextSlide);
            }
            if (prev) {
                prev.addEventListener("click", function () {
                    showSlide(current - 1);
                });
            }
            dots.forEach(function (dot) {
                dot.addEventListener("click", function () {
                    showSlide(parseInt(dot.getAttribute("data-slide-index"), 10) || 0);
                });
            });
            timer = window.setInterval(nextSlide, 5200);
            var visual = document.querySelector(".main-visual");
            if (visual) {
                visual.addEventListener("mouseenter", function () {
                    window.clearInterval(timer);
                });
                visual.addEventListener("mouseleave", function () {
                    timer = window.setInterval(nextSlide, 5200);
                });
            }
        }

        var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search]"));
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-title]"));
        var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
        var noResults = document.querySelector("[data-no-results]");
        var activeFilter = "all";
        var searchTerm = "";

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function filterMatches(card) {
            if (activeFilter === "all") {
                return true;
            }
            var pair = activeFilter.split(":");
            var key = pair[0];
            var value = pair.slice(1).join(":");
            if (key === "year") {
                return card.getAttribute("data-year") === value;
            }
            if (key === "type") {
                return normalize(card.getAttribute("data-type")).indexOf(normalize(value)) !== -1;
            }
            if (key === "genre") {
                return normalize(card.getAttribute("data-genre")).indexOf(normalize(value)) !== -1;
            }
            return true;
        }

        function searchMatches(card) {
            if (!searchTerm) {
                return true;
            }
            var haystack = [
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-year"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-category")
            ].join(" ");
            return normalize(haystack).indexOf(searchTerm) !== -1;
        }

        function applyFilters() {
            var visible = 0;
            cards.forEach(function (card) {
                var ok = filterMatches(card) && searchMatches(card);
                card.style.display = ok ? "" : "none";
                if (ok) {
                    visible += 1;
                }
            });
            if (noResults) {
                noResults.classList.toggle("show", visible === 0 && cards.length > 0);
            }
        }

        inputs.forEach(function (input) {
            input.addEventListener("input", function () {
                searchTerm = normalize(input.value);
                inputs.forEach(function (other) {
                    if (other !== input && other.value !== input.value) {
                        other.value = input.value;
                    }
                });
                applyFilters();
            });
        });

        filterButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                filterButtons.forEach(function (item) {
                    item.classList.remove("is-active");
                });
                button.classList.add("is-active");
                activeFilter = button.getAttribute("data-filter-value") || "all";
                applyFilters();
            });
        });
    });
})();

function initMoviePlayer(src) {
    var video = document.getElementById("movieVideo");
    var button = document.getElementById("playButton");
    if (!video || !button || !src) {
        return;
    }
    var attached = false;
    var hls = null;

    function attach() {
        if (attached) {
            return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = src;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(src);
            hls.attachMedia(video);
        } else {
            video.src = src;
        }
    }

    function start() {
        attach();
        button.classList.add("is-hidden");
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
        }
    }

    button.addEventListener("click", start);
    video.addEventListener("click", function () {
        if (video.paused) {
            start();
        }
    });
    video.addEventListener("play", function () {
        button.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
        if (video.currentTime === 0 || video.ended) {
            button.classList.remove("is-hidden");
        }
    });
    window.addEventListener("beforeunload", function () {
        if (hls && typeof hls.destroy === "function") {
            hls.destroy();
        }
    });
}
