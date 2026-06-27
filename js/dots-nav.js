(function () {
    'use strict';

    var SECTIONS = (typeof DOT_NAV_SECTIONS !== 'undefined' && Array.isArray(DOT_NAV_SECTIONS))
        ? DOT_NAV_SECTIONS
        : [
            { id: 'section-suits',  label: 'Масти'            },
            { id: 'section-basics', label: 'Элементы игры'    },
            { id: 'vstack',         label: 'Ход игры'         },
            { id: 'vdraw',          label: 'Ничья'            },
            { id: 'section-score',  label: 'Подсчёт очков'   }
          ];

    /* ── Build nav DOM ────────────────────────────────────────────────────── */
    var nav = document.createElement('nav');
    nav.className = 'dot-nav';
    nav.setAttribute('aria-label', 'Навигация по разделам');

    var ul = document.createElement('ul');
    ul.className = 'dot-nav__list';

    var buttons = SECTIONS.map(function (sec) {
        var li  = document.createElement('li');
        var btn = document.createElement('button');
        btn.type      = 'button';
        btn.className = 'dot-nav__btn';
        btn.setAttribute('aria-label', 'Перейти: ' + sec.label);
        btn.setAttribute('data-target', sec.id);

        var label = document.createElement('span');
        label.className   = 'dot-nav__label';
        label.textContent = sec.label;

        var dot = document.createElement('span');
        dot.className = 'dot-nav__dot';
        dot.setAttribute('aria-hidden', 'true');

        btn.appendChild(label);
        btn.appendChild(dot);
        li.appendChild(btn);
        ul.appendChild(li);

        btn.addEventListener('click', function () {
            var target = document.getElementById(sec.id);
            if (!target) return;
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        return btn;
    });

    nav.appendChild(ul);
    document.body.appendChild(nav);

    /* ── Active section tracking ──────────────────────────────────────────── */
    var sectionEls = SECTIONS.map(function (sec) {
        return document.getElementById(sec.id);
    });

    function updateActive() {
        /* Активна та секция, чей верхний край последним прошёл верхние 50% экрана */
        var threshold = window.innerHeight * 0.5;
        var activeIdx = -1;

        sectionEls.forEach(function (el, i) {
            if (!el) return;
            if (el.getBoundingClientRect().top <= threshold) activeIdx = i;
        });

        buttons.forEach(function (btn, i) {
            btn.classList.toggle('is-active', i === activeIdx);
        });
    }

    window.addEventListener('scroll', updateActive, { passive: true });
    updateActive();
})();
