/* ── Всплывающие подсказки при наведении на тайлы ─────────────────────────
   Делегирование на document — не конфликтует с другими скриптами.
   Срабатывает только на img из папки tile-png-white-bg/.
   ────────────────────────────────────────────────────────────────────────── */
(function () {
    var NAMES = {
        'pin-1': '1 Пин',  'pin-2': '2 Пин',  'pin-3': '3 Пин',
        'pin-4': '4 Пин',  'pin-5': '5 Пин',  'pin-6': '6 Пин',
        'pin-7': '7 Пин',  'pin-8': '8 Пин',  'pin-9': '9 Пин',
        'man-1': '1 Ман',  'man-2': '2 Ман',  'man-3': '3 Ман',
        'man-4': '4 Ман',  'man-5': '5 Ман',  'man-6': '6 Ман',
        'man-7': '7 Ман',  'man-8': '8 Ман',  'man-9': '9 Ман',
        'sou-1': '1 Соу',  'sou-2': '2 Соу',  'sou-3': '3 Соу',
        'sou-4': '4 Соу',  'sou-5': '5 Соу',  'sou-6': '6 Соу',
        'sou-7': '7 Соу',  'sou-8': '8 Соу',  'sou-9': '9 Соу',
        'wind-east':    'Восточный ветер',
        'wind-south':   'Южный ветер',
        'wind-west':    'Западный ветер',
        'wind-north':   'Северный ветер',
        'dragon-red':   'Красный дракон',
        'dragon-green': 'Зелёный дракон',
        'dragon-white': 'Белый дракон',
        'pin-red-dora': 'Красная дора  赤5 Пин',
        'man-red-dora': 'Красная дора  赤5 Ман',
        'sou-red-dora': 'Красная дора  赤5 Соу',
        'back-of-tile': 'Рубашка тайла',
    };

    var tip = document.createElement('div');
    tip.style.cssText = [
        'position:fixed',
        'z-index:99999',
        'pointer-events:none',
        'background:#1a1a1a',
        'color:#fff',
        'font-family:sans-serif',
        'font-size:13px',
        'padding:4px 10px',
        'border-radius:4px',
        'white-space:nowrap',
        'opacity:0',
        'transition:opacity 0.12s ease',
        'left:0',
        'top:0',
    ].join(';');
    document.body.appendChild(tip);

    function getName(img) {
        var src = img.src || '';
        if (src.indexOf('tile-png-white-bg/') === -1) return null;
        var m = src.match(/tile-png-white-bg\/([^/?#]+)\.png/i);
        return m ? (NAMES[m[1]] || null) : null;
    }

    function show(name, x, y) {
        tip.textContent = name;
        tip.style.left = (x + 14) + 'px';
        tip.style.top  = (y - 32) + 'px';
        tip.style.opacity = '1';
    }

    function hide() {
        tip.style.opacity = '0';
    }

    var active = null;

    document.addEventListener('mouseover', function (e) {
        var img = e.target;
        if (img.tagName !== 'IMG') return;
        var name = getName(img);
        if (!name) return;
        active = img;
        show(name, e.clientX, e.clientY);
    }, true);

    document.addEventListener('mouseout', function (e) {
        if (e.target === active) { active = null; hide(); }
    }, true);

    document.addEventListener('mousemove', function (e) {
        if (!active) return;
        tip.style.left = (e.clientX + 14) + 'px';
        tip.style.top  = (e.clientY - 32) + 'px';
    }, true);
}());
