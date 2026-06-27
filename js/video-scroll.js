(function () {
    'use strict';

    /* ── helpers ──────────────────────────────────────────────────────────── */
    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

    /* Только буферизация: data-src → src + video.load(), без play() */
    function ensureLoaded(container) {
        if (!container) return;
        var video  = container.querySelector('video');
        if (!video) return;
        var source = video.querySelector('source[data-src]');
        if (!source) return;
        source.setAttribute('src', source.getAttribute('data-src'));
        source.removeAttribute('data-src');
        video.load();
    }

    function playVideo(container) {
        if (!container) return;
        var video = container.querySelector('video');
        if (!video) return;
        ensureLoaded(container);
        if (video.paused) video.play().catch(function () {});
    }

    function pauseVideo(container) {
        if (!container) return;
        var video = container.querySelector('video');
        if (video && !video.paused) video.pause();
    }

    function easeInOut(t) {
        t = clamp(t, 0, 1);
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    /* Секция занимает ≥70% высоты экрана? */
    function fills70(section) {
        if (!section) return false;
        var rect  = section.getBoundingClientRect();
        var viewH = window.innerHeight;
        return rect.top <= viewH * 0.3 && rect.bottom >= 0;
    }

    /* ════════════════════════════════════════════════════════════════════════
       VSTACK — sticky card stack, videos 01-10

       Каждая карточка занимает SLOT = (100 + DWELL_VH) vh:
         ├─ DWELL_VH  vh  →  текущая карточка видна полностью, «пауза»
         └─ 100       vh  →  следующая карточка въезжает сверху

       Схема для 10 карточек с DWELL_VH = 50:
         ┌────────────────────────────────────────────────────────────┐
         │ card-0 dwell (50vh) │ card-1 slides in (100vh) │          │
         │ card-1 dwell (50vh) │ card-2 slides in (100vh) │  ...     │
         └────────────────────────────────────────────────────────────┘
    ════════════════════════════════════════════════════════════════════ */
    var DWELL_VH   = 50;                          // пауза после появления каждого ролика
    var SLOT       = (100 + DWELL_VH) / 100;      // 1.5 — размер слота в vh-кратных
    var DWELL_FRAC = DWELL_VH / (100 + DWELL_VH); // ≈ 0.333 — доля слота для паузы

    var vstackSection = document.getElementById('vstack');
    var vstackCards, vstackCount;

    if (vstackSection) {
        vstackCards = Array.prototype.slice.call(
            vstackSection.querySelectorAll('.vstack-card')
        );
        vstackCount = vstackCards.length;

        /*
         * Section height:
         *   vstackCount * SLOT * 100vh  — прокручиваемое пространство
         *   + 100vh                     — высота прилипшего контейнера
         */
        vstackSection.style.height = (vstackCount * SLOT * 100 + 100) + 'vh';

        vstackCards.forEach(function (card, i) {
            card.style.zIndex    = i + 1;
            card.style.transform = i === 0 ? 'translateY(0)' : 'translateY(100%)';
        });

        vstackCards.forEach(pauseVideo);

        if (window.IntersectionObserver) {
            new IntersectionObserver(function (entries) {
                if (!entries[0].isIntersecting) {
                    vstackCards.forEach(pauseVideo);
                } else {
                    updateVstack();
                }
            }, { threshold: 0 }).observe(vstackSection);
        }
    }

    function updateVstack() {
        if (!vstackSection) return;

        var scrolled = -vstackSection.getBoundingClientRect().top;
        var viewH    = window.innerHeight;
        var slotPx   = viewH * SLOT;          // пикселей на один слот
        var canPlay  = fills70(vstackSection);

        /* Какой слот и насколько внутри него */
        var rawSlot    = scrolled / slotPx;
        var slotIdx    = clamp(Math.floor(rawSlot), 0, vstackCount - 1);
        var withinSlot = clamp(rawSlot - slotIdx, 0, 1);

        var current, t;

        if (withinSlot < DWELL_FRAC || slotIdx >= vstackCount - 1) {
            /* Пауза: текущая карточка показана полностью, следующая не въезжает */
            current = slotIdx;
            t       = 0;
        } else {
            /* Переход: следующая карточка въезжает */
            current = slotIdx;
            t       = easeInOut((withinSlot - DWELL_FRAC) / (1 - DWELL_FRAC));
        }

        vstackCards.forEach(function (card, i) {
            if (i < current) {
                card.style.transform = 'translateY(0)';
                card.style.zIndex    = i + 1;
                pauseVideo(card);
            } else if (i === current) {
                card.style.transform = 'translateY(0)';
                card.style.zIndex    = vstackCount + 1;
                if (canPlay) { playVideo(card); } else { pauseVideo(card); }
                ensureLoaded(vstackCards[current + 1]); // буферизуем следующее без play()
            } else if (i === current + 1 && t > 0) {
                var offset = (1 - t) * 100;
                card.style.transform = 'translateY(' + offset + '%)';
                card.style.zIndex    = vstackCount + 2;
                if (canPlay) { playVideo(card); } else { pauseVideo(card); }
            } else {
                card.style.transform = 'translateY(100%)';
                card.style.zIndex    = i + 1;
                pauseVideo(card);
            }
        });
    }

    /* ════════════════════════════════════════════════════════════════════════
       VDRAW — horizontal column compression, videos 11-14
    ════════════════════════════════════════════════════════════════════════ */
    var vdrawSection = document.getElementById('vdraw');
    var vdrawCols, vdrawCount;

    var DRAW_STATES = [
        [100,  0,   0,   0 ],
        [ 25, 75,   0,   0 ],
        [ 25, 25,  50,   0 ],
        [ 25, 25,  25,  25 ]
    ];

    if (vdrawSection && window.IntersectionObserver) {
        new IntersectionObserver(function (entries, obs) {
            if (entries[0].isIntersecting) {
                vdrawSection.querySelectorAll('.vdraw-col').forEach(ensureLoaded);
                obs.disconnect();
            }
        }, { rootMargin: '300px' }).observe(vdrawSection);

        new IntersectionObserver(function (entries) {
            if (!entries[0].isIntersecting && vdrawCols) {
                vdrawCols.forEach(pauseVideo);
            }
        }, { threshold: 0 }).observe(vdrawSection);
    }

    if (vdrawSection) {
        vdrawCols  = Array.prototype.slice.call(
            vdrawSection.querySelectorAll('.vdraw-col')
        );
        vdrawCount = vdrawCols.length;

        vdrawSection.style.height = ((vdrawCount + 1) * 100) + 'vh';

        applyDrawWidths(DRAW_STATES[0]);
    }

    function applyDrawWidths(widths) {
        var maxW = -1, activeCol = 0;
        widths.forEach(function (w, i) {
            if (w >= maxW) { maxW = w; activeCol = i; }
        });

        var canPlay = fills70(vdrawSection);

        vdrawCols.forEach(function (col, i) {
            col.style.width = widths[i] + '%';

            if (widths[i] < 40) {
                col.classList.add('is-narrow');
            } else {
                col.classList.remove('is-narrow');
            }

            if (i === activeCol) {
                col.classList.add('is-draw-active');
            } else {
                col.classList.remove('is-draw-active');
            }

            if (!canPlay || widths[i] < 1) {
                pauseVideo(col);
            } else {
                playVideo(col);
            }
        });
    }

    function updateVdraw() {
        if (!vdrawSection) return;

        var scrolled     = -vdrawSection.getBoundingClientRect().top;
        var scrollableH  = vdrawSection.offsetHeight - window.innerHeight;
        var rawProgress  = clamp(scrolled / scrollableH, 0, 1);
        var progress     = clamp(rawProgress * vdrawCount / (vdrawCount - 1), 0, 1);

        var phase    = progress * (DRAW_STATES.length - 1);
        var stateIdx = clamp(Math.floor(phase), 0, DRAW_STATES.length - 2);
        var t        = easeInOut(phase - stateIdx);

        var from = DRAW_STATES[stateIdx];
        var to   = DRAW_STATES[stateIdx + 1];

        var widths = from.map(function (v, i) {
            return v + (to[i] - v) * t;
        });

        applyDrawWidths(widths);
    }

    /* ── main scroll loop ─────────────────────────────────────────────────── */
    function onScroll() {
        updateVstack();
        updateVdraw();
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
})();
