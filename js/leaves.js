/* ══════════════════════════════════════════════════════════════
   АНИМАЦИЯ ЛИСТЬЕВ — js/leaves.js
   ══════════════════════════════════════════════════════════════ */

// ┌──────────────────────────────────────────────────────────────┐
// │                      НАСТРОЙКИ                               │
// └──────────────────────────────────────────────────────────────┘
const LEAVES_CONFIG = Object.assign({

    // ── Скорость падения ────────────────────────────────────────
    speedMin: 80,          // px/s  нижний порог скорости (медленнее = плавнее)
    speedMax: 160,         // px/s  верхний порог скорости

    // ── Количество листьев ──────────────────────────────────────
    spawnInterval: 280,    // мс    интервал между новыми листьями (меньше = больше листьев)
    maxLeaves: 80,         // шт    максимум листьев одновременно на экране

    // ── Старт анимации ──────────────────────────────────────────
    preStart: true,        // true  = при загрузке экран уже частично заполнен листьями
    preStartCount: 20,     // шт    сколько листьев «уже в полёте» при старте

    // ── Снос (угол падения) ─────────────────────────────────────
    //    Постоянная горизонтальная скорость — лист летит наискосок.
    //    Отличие от wind: drift даёт стабильный угол всё время падения,
    //    wind — накопительный эффект (чем дольше летит, тем дальше уносит).
    drift: 300,              // px/s  снос вбок (+ вправо, − влево, 0 = прямо вниз)
    driftVariation: 20,    // px/s  разброс ± между отдельными листьями

    // ── Ветер (накопительный дрейф) ─────────────────────────────
    wind: 0,               // px/s  постоянный боковой дрейф (+ вправо, − влево, 0 = нет ветра)
    windVariation: 20,     // px/s  случайное отклонение ± от wind у каждого листа

    // ── Качание (синусоидальный сваинг) ─────────────────────────
    swayAmplitude: 60,     // px    насколько лист отклоняется влево/вправо
    swayFrequency: 0.4,    // Гц    как быстро качается (0.2 = медленно, 1.0 = быстро)

    // ── Вращение ────────────────────────────────────────────────
    rotationSpeedMin: 40,  // deg/s минимальная угловая скорость
    rotationSpeedMax: 120, // deg/s максимальная угловая скорость

}, window.LEAVES_CONFIG_OVERRIDE || {});
// Переопределить настройки на конкретной странице: задай window.LEAVES_CONFIG_OVERRIDE = {...}
// до подключения этого скрипта.

// ┌──────────────────────────────────────────────────────────────┐
// │                    ЦВЕТА ЛИСТЬЕВ                             │
// └──────────────────────────────────────────────────────────────┘
const LEAF_COLORS = [
    '#22B14C', '#2ec75a', '#90CC6E', '#AAE588',
    '#4a9e35', '#6dbf5a', '#3a8a28', '#5db84a',
    '#81c45a', '#3d9c44', '#1e9944', '#a8d96b',
];

// ══════════════════════════════════════════════════════════════
//  ВНУТРЕННЯЯ ЛОГИКА — менять не нужно
// ══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', function () {
    const section = document.getElementById('leaves-section');
    if (!section) return;

    const leaves    = [];
    let   lastTime  = null;
    let   spawnAcc  = 0;   // накопленное время для спауна

    /* SVG-форма листа: миндаль с острыми концами на обоих концах */
    function makeSVG(w, h, color, opacity) {
        return `<svg width="${w}" height="${h}" viewBox="0 0 20 50"
                     xmlns="http://www.w3.org/2000/svg" style="overflow:visible;display:block">
            <path d="M10,1 C16,8 18,20 17,30 C16,40 13,46 10,49
                     C7,46 4,40 3,30 C2,20 4,8 10,1 Z"
                  fill="${color}" opacity="${opacity}"/>
        </svg>`;
    }

    /* Создать один лист. startY — если задано, лист начинает уже в полёте */
    function createLeaf(startY) {
        const cfg      = LEAVES_CONFIG;
        const sectionW = section.offsetWidth;

        const w           = 10 + Math.random() * 14;
        const h           = w * (2.2 + Math.random() * 0.7);
        const color       = LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)];
        const baseOpacity = 0.55 + Math.random() * 0.45;

        const vy             = cfg.speedMin + Math.random() * (cfg.speedMax - cfg.speedMin);
        const windOffset     = (Math.random() - 0.5) * 2 * cfg.windVariation;
        const driftOffset    = (Math.random() - 0.5) * 2 * cfg.driftVariation;
        const angularVel     = (cfg.rotationSpeedMin + Math.random() *
                               (cfg.rotationSpeedMax - cfg.rotationSpeedMin))
                               * (Math.random() < 0.5 ? 1 : -1);
        const swayPhase      = Math.random() * Math.PI * 2;

        /* Если pre-start: лист уже прошёл часть пути */
        const y0 = (startY !== undefined) ? startY : -h;
        const t0 = y0 > 0 ? y0 / vy : 0;

        /* Расширяем зону спауна, компенсируя снос.
           Для обычных листьев берём полное время падения,
           для pre-start — только оставшееся (лист уже в полёте). */
        const remainingH       = section.offsetHeight - Math.max(0, y0);
        const estimatedFallTime = remainingH / vy;
        const totalDrift = (cfg.drift + driftOffset) * estimatedFallTime;
        const spawnMin = Math.min(0, -totalDrift);
        const spawnMax = Math.max(sectionW, sectionW - totalDrift);
        const startX   = spawnMin + Math.random() * (spawnMax - spawnMin);

        const el = document.createElement('div');
        el.className = 'leaf';
        el.style.cssText = `
            position: absolute;
            top: 0;
            pointer-events: none;
            will-change: transform, opacity;
            left: ${startX}px;
            width: ${w}px;
            height: ${h}px;
        `;
        el.innerHTML = makeSVG(w, h, color, baseOpacity);
        section.appendChild(el);

        const leaf = {
            el,
            y: y0,
            t: t0,
            vy,
            windOffset,
            windDrift: (cfg.wind + windOffset) * t0,        /* начальный дрейф для pre-start */
            driftOffset,
            driftX: (cfg.drift + driftOffset) * t0,         /* начальный снос для pre-start */
            angularVel,
            angle: Math.random() * 360,
            swayPhase,
            baseOpacity,
            h,
        };

        leaves.push(leaf);
    }

    /* Основной цикл rAF */
    function tick(timestamp) {
        const dt       = lastTime ? Math.min((timestamp - lastTime) / 1000, 0.05) : 0;
        lastTime       = timestamp;

        const sectionH = section.offsetHeight;
        const cfg      = LEAVES_CONFIG;

        /* Спаун новых листьев */
        if (leaves.length < cfg.maxLeaves) {
            spawnAcc += dt * 1000;
            while (spawnAcc >= cfg.spawnInterval) {
                spawnAcc -= cfg.spawnInterval;
                createLeaf();
            }
        }

        /* Обновление каждого листа */
        for (let i = leaves.length - 1; i >= 0; i--) {
            const lf = leaves[i];

            lf.t          += dt;
            lf.y          += lf.vy * dt;
            lf.windDrift  += (cfg.wind + lf.windOffset) * dt;
            lf.driftX     += (cfg.drift + lf.driftOffset) * dt;
            lf.angle      += lf.angularVel * dt;

            const sway   = cfg.swayAmplitude *
                           Math.sin(2 * Math.PI * cfg.swayFrequency * lf.t + lf.swayPhase);
            const totalX = sway + lf.windDrift + lf.driftX;

            /* Прозрачность: плавное появление сверху и исчезновение снизу */
            const progress = (lf.y + lf.h) / (sectionH + lf.h);
            let alpha;
            if      (progress < 0.06) alpha = progress / 0.06;
            else if (progress > 0.88) alpha = 1 - (progress - 0.88) / 0.12;
            else                      alpha = 1;

            lf.el.style.transform = `translateY(${lf.y}px) translateX(${totalX}px) rotate(${lf.angle}deg)`;
            lf.el.style.opacity   = Math.max(0, Math.min(1, alpha)) * lf.baseOpacity;

            /* Удалить лист, ушедший за нижнюю границу */
            if (lf.y > sectionH + lf.h + 20) {
                lf.el.remove();
                leaves.splice(i, 1);
            }
        }

        requestAnimationFrame(tick);
    }

    /* Pre-start: разместить листья уже на разных высотах.
       startY передаётся случайным — createLeaf сам вычислит
       корректный X-диапазон с учётом уже пройденного пути. */
    if (LEAVES_CONFIG.preStart) {
        const sectionH = section.offsetHeight;
        for (let i = 0; i < LEAVES_CONFIG.preStartCount; i++) {
            createLeaf(Math.random() * sectionH * 0.9);
        }
    }

    requestAnimationFrame(tick);
});
