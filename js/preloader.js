/* ═══════════════════════════════════════════════════════════════
   PRELOADER — звезда-маска
   Подключи как первый <script> в <body>:
     <script src="js/preloader.js"></script>
   И добавь в <head>:
     <link rel="stylesheet" href="css/preloader.css">
   ═══════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var STAR_PATH =
        'M117.67,5.75l18.69,33.14,36.66-10.22c8.49-2.37,16.3,5.45,13.93,' +
        '13.93l-10.22,36.66,33.14,18.69c7.67,4.33,7.67,15.38,0,19.71l-33.14,' +
        '18.69,10.22,36.66c2.37,8.49-5.45,16.3-13.93,13.93l-36.66-10.22-18.69,' +
        '33.14c-4.33,7.67-15.38,7.67-19.71,0l-18.69-33.14-36.66,10.22c-8.49,' +
        '2.37-16.3-5.45-13.93-13.93l10.22-36.66L5.75,117.67c-7.67-4.33-7.67-' +
        '15.38,0-19.71l33.14-18.69-10.22-36.66c-2.37-8.49,5.45-16.3,13.93-' +
        '13.93l36.66,10.22L97.97,5.75c4.33-7.67,15.38-7.67,19.71,0Z';

    var STAR_NATURAL = 215.64;
    var STAR_CENTER  = STAR_NATURAL / 2;  // 107.82
    var VISUAL_PX    = 80;
    var MIN_MS       = 1400;
    var startedAt    = Date.now();
    var initScale    = VISUAL_PX / STAR_NATURAL;

    var NS = 'http://www.w3.org/2000/svg';

    function svgEl(tag, attrs) {
        var el = document.createElementNS(NS, tag);
        Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
        return el;
    }

    /* ── DOM ─────────────────────────────────────────────────────── */
    var pl = document.createElement('div');
    pl.id  = 'preloader';

    /* Фоновый слой: чёрный + серое свечение снизу (из preloader.css) */
    var bg = document.createElement('div');
    bg.className = 'pl-bg';
    pl.appendChild(bg);

    /* SVG-маска:
       <mask> содержит белый rect (= показывать) и чёрную звезду (= скрыть/дыра).
       Применяем маску к большому чёрному rect.
       Итог: чёрный экран с прозрачной дырой в форме звезды.
       Через дыру видна страница (или .pl-bg пока она не убрана). */
    var maskSvg = svgEl('svg', { class: 'pl-mask-svg', xmlns: NS });

    var defs = svgEl('defs', {});

    var maskEl = svgEl('mask', {
        id:               'pl-mask',
        x:                '-9999',
        y:                '-9999',
        width:            '29999',
        height:           '29999',
        maskUnits:        'userSpaceOnUse',
        maskContentUnits: 'userSpaceOnUse',
    });
    /* Белый фон маски — весь экран «показывает» чёрный rect */
    var maskWhite = svgEl('rect', {
        x: '-9999', y: '-9999', width: '29999', height: '29999', fill: 'white',
    });
    /* Чёрная звезда — в этой области rect становится прозрачным (дыра) */
    var starHole = svgEl('path', { d: STAR_PATH, fill: 'black' });

    maskEl.appendChild(maskWhite);
    maskEl.appendChild(starHole);
    defs.appendChild(maskEl);
    maskSvg.appendChild(defs);

    /* Чёрный прямоугольник с применённой маской */
    var overlayRect = svgEl('rect', {
        x:      '-9999',
        y:      '-9999',
        width:  '29999',
        height: '29999',
        fill:   '#000',
        mask:   'url(#pl-mask)',
    });
    maskSvg.appendChild(overlayRect);
    pl.appendChild(maskSvg);

    /* Центральный блок: вращающаяся звезда + полоса прогресса */
    var center = document.createElement('div');
    center.className = 'pl-center';

    var starSvg = svgEl('svg', {
        class:   'pl-star-visual',
        viewBox: '0 0 ' + STAR_NATURAL + ' ' + STAR_NATURAL,
        xmlns:   NS,
    });
    starSvg.appendChild(svgEl('path', { d: STAR_PATH, fill: '#bfe03d' }));
    center.appendChild(starSvg);

    var barWrap = document.createElement('div');
    barWrap.className = 'pl-bar-wrap';
    var barFill = document.createElement('div');
    barFill.className = 'pl-bar-fill';
    barWrap.appendChild(barFill);
    center.appendChild(barWrap);

    pl.appendChild(center);
    document.body.insertBefore(pl, document.body.firstChild);

    /* ── Позиция звезды-дыры ─────────────────────────────────────── */
    function setHoleTransform(scale) {
        var cx = window.innerWidth  / 2;
        var cy = window.innerHeight / 2;
        /* translate так, чтобы центр звезды (107.82×scale) совпал с центром экрана */
        var tx = cx - STAR_CENTER * scale;
        var ty = cy - STAR_CENTER * scale;
        starHole.setAttribute('transform',
            'translate(' + tx + ',' + ty + ') scale(' + scale + ')');
    }

    setHoleTransform(initScale);
    window.addEventListener('resize', function () { setHoleTransform(initScale); });

    /* ── Прогресс-бар ────────────────────────────────────────────── */
    var progress     = 0;
    var fakeInterval = setInterval(function () {
        progress += Math.random() * 9 + 3;
        if (progress >= 85) { progress = 85; clearInterval(fakeInterval); }
        barFill.style.width = progress + '%';
    }, 130);

    function triggerReveal() {
        var elapsed = Date.now() - startedAt;
        setTimeout(doReveal, Math.max(0, MIN_MS - elapsed));
    }

    if (document.readyState === 'complete') {
        clearInterval(fakeInterval);
        barFill.style.width = '100%';
        triggerReveal();
    } else {
        window.addEventListener('load', function () {
            clearInterval(fakeInterval);
            barFill.style.width = '100%';
            triggerReveal();
        });
    }

    /* ── Анимация раскрытия ──────────────────────────────────────── */
    function doReveal() {
        /* 1. Полоса затухает */
        barWrap.style.transition = 'opacity 0.35s ease';
        barWrap.style.opacity    = '0';

        setTimeout(function () {
            /* 2. Вращающаяся звезда уходит */
            starSvg.style.transition = 'opacity 0.2s ease';
            starSvg.style.opacity    = '0';

            /* 3. Убираем фоновый слой — через дыру теперь видна страница */
            bg.style.transition = 'opacity 0.05s ease';
            bg.style.opacity    = '0';

            /* 4. Звезда-дыра растёт от initScale до покрытия всего экрана */
            var maxDim     = Math.hypot(window.innerWidth, window.innerHeight) * 1.1;
            var finalScale = maxDim / STAR_CENTER;
            var duration   = 560;
            var t0         = performance.now();

            function grow(now) {
                var t     = Math.min((now - t0) / duration, 1);
                var eased = t * t * t * t;   /* ease-in quart: резкое ускорение к концу */
                var scale = initScale + (finalScale - initScale) * eased;
                setHoleTransform(scale);

                if (t < 1) {
                    requestAnimationFrame(grow);
                } else {
                    pl.style.transition = 'opacity 0.15s ease';
                    pl.style.opacity    = '0';
                    setTimeout(function () { pl.remove(); }, 160);
                }
            }

            requestAnimationFrame(grow);

        }, 400);
    }
}());
