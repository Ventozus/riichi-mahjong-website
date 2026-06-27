document.addEventListener('DOMContentLoaded', () => {
    const bodyContainer = document.getElementById('yaku-table-body');
    const searchInput = document.getElementById('yaku-search-input');
    const emptyState = document.getElementById('yaku-empty-state');
    const searchSticky = document.querySelector('.yaku-search-sticky');
    const tableShell = document.querySelector('.yaku-table-shell');

    if (!bodyContainer || !searchInput || !emptyState || !searchSticky || !tableShell) {
        return;
    }

    setupSearchVisibility(searchSticky, tableShell);

    fetch('yaku-table.csv')
        .then((response) => {
            if (!response.ok) {
                throw new Error('CSV file is unavailable');
            }
            return response.text();
        })
        .then((csvText) => {
            const rows = parseCsv(csvText);
            const dataRows = rows.slice(1).filter((row) => row.length >= 4);
            const state = createTableState(dataRows, bodyContainer);
            applySearch(dataRows, state, searchInput, emptyState);
        })
        .catch(() => {
            bodyContainer.innerHTML = '';
            emptyState.textContent = 'Не удалось загрузить таблицу.';
            emptyState.hidden = false;
        });
});

function parseCsv(text) {
    const lines = text.split(/\r?\n/).filter(Boolean);
    return lines.map(splitCsvLine);
}

function splitCsvLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
        const char = line[i];

        if (char === '"') {
            const isEscapedQuote = inQuotes && line[i + 1] === '"';
            if (isEscapedQuote) {
                current += '"';
                i += 1;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }

        if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
            continue;
        }

        current += char;
    }

    result.push(current.trim());
    return result;
}

function normalize(value) {
    return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

/* ── Руки яку: 13 тайлов в руке + 1 победный тайл ─────────────────────── */
const yakuHands = {
    'Якухай':       { hand: ['dragon-red','dragon-red','dragon-red','pin-1','pin-2','pin-3','pin-4','pin-5','pin-6','pin-7','pin-8','pin-9','wind-east'], win: 'wind-east' },
    'Таняо':        { hand: ['pin-2','pin-3','pin-4','pin-5','pin-6','pin-7','man-2','man-3','man-4','man-5','man-6','man-7','sou-3'], win: 'sou-3' },
    'Пинфу':        { hand: ['pin-1','pin-2','pin-3','pin-4','pin-5','pin-6','pin-7','pin-8','pin-9','man-5','man-5','sou-3','sou-4'], win: 'sou-5' },
    'Иппейко':      { hand: ['man-1','man-2','man-3','man-1','man-2','man-3','pin-5','pin-6','pin-7','sou-9','sou-9','pin-4','pin-5'], win: 'pin-6' },
    'Чанта':        { hand: ['pin-1','pin-2','pin-3','pin-7','pin-8','pin-9','wind-east','wind-east','wind-east','man-1','man-2','man-3','sou-9'], win: 'sou-9' },
    'Джунчан':      { hand: ['pin-1','pin-2','pin-3','pin-7','pin-8','pin-9','man-1','man-2','man-3','sou-9','sou-9','sou-7','sou-8'], win: 'sou-9' },
    'Иццу':         { hand: ['pin-1','pin-2','pin-3','pin-4','pin-5','pin-6','pin-7','pin-8','pin-9','man-5','man-5','sou-3','sou-4'], win: 'sou-5' },
    'Саншоку':      { hand: ['pin-2','pin-3','pin-4','man-2','man-3','man-4','sou-2','sou-3','sou-4','pin-6','pin-7','pin-8','sou-6'], win: 'sou-6' },
    'Хоницу':       { hand: ['pin-1','pin-2','pin-3','pin-4','pin-5','pin-6','pin-7','pin-8','pin-9','dragon-red','dragon-red','dragon-red','wind-east'], win: 'wind-east' },
    'Чиницу':       { hand: ['pin-1','pin-2','pin-3','pin-4','pin-5','pin-6','pin-7','pin-8','pin-9','pin-2','pin-3','pin-4','pin-6'], win: 'pin-6' },
    'Тойтой':       { hand: ['dragon-red','dragon-red','dragon-red','wind-east','wind-east','wind-east','man-3','man-3','man-3','pin-7','pin-7','pin-7','sou-5'], win: 'sou-5' },
    'Читойцу':      { hand: ['pin-1','pin-1','pin-5','pin-5','pin-9','pin-9','man-3','man-3','man-7','man-7','sou-2','sou-2','wind-east'], win: 'wind-east' },
    'Сананко':      { hand: ['pin-1','pin-1','pin-1','man-9','man-9','man-9','sou-5','sou-5','sou-5','pin-2','pin-3','pin-4','man-7'], win: 'man-7' },
    'Саншоку доко': { hand: ['pin-5','pin-5','pin-5','man-5','man-5','man-5','sou-5','sou-5','sou-5','pin-1','pin-2','pin-3','man-7'], win: 'man-7' },
    'Хонрото':      { hand: ['pin-1','pin-1','pin-1','man-9','man-9','man-9','wind-east','wind-east','wind-east','dragon-green','dragon-green','dragon-green','sou-1'], win: 'sou-1' },
    'Санканцу':     { hand: ['pin-1','pin-1','pin-1','man-9','man-9','man-9','wind-east','wind-east','wind-east','sou-2','sou-3','sou-4','man-5'], win: 'man-5' },
    'Сёсанген':     { hand: ['dragon-red','dragon-red','dragon-red','dragon-green','dragon-green','dragon-green','dragon-white','dragon-white','pin-1','pin-2','pin-3','man-4','man-5'], win: 'man-6' },
    'Рянпейко':     { hand: ['man-1','man-2','man-3','man-1','man-2','man-3','pin-4','pin-5','pin-6','pin-4','pin-5','pin-6','sou-9'], win: 'sou-9' },
    'Риичи':        { hand: ['pin-1','pin-2','pin-3','pin-4','pin-5','pin-6','man-7','man-8','man-9','sou-2','sou-3','pin-8','pin-8'], win: 'sou-4' },
    'Дабуру риичи': { hand: ['man-2','man-3','man-4','man-5','man-6','man-7','sou-1','sou-2','sou-3','sou-4','sou-5','sou-6','pin-8'], win: 'pin-8' },
    'Иппацу':       { hand: ['man-1','man-2','man-3','man-4','man-5','man-6','man-7','man-8','man-9','pin-3','pin-4','sou-7','sou-7'], win: 'pin-5' },
    'Мензен цумо':  { hand: ['sou-1','sou-2','sou-3','sou-4','sou-5','sou-6','sou-7','sou-8','sou-9','man-3','man-4','man-5','pin-7'], win: 'pin-7' },
    'Риншан':       { hand: ['dragon-red','dragon-red','dragon-red','pin-1','pin-2','pin-3','pin-4','pin-5','pin-6','pin-7','pin-8','man-5','man-5'], win: 'pin-9' },
    'Чанкан':       { hand: ['man-1','man-2','man-3','man-4','man-5','man-6','sou-7','sou-8','sou-9','pin-2','pin-3','sou-6','sou-6'], win: 'pin-4' },
    'Хайтей':       { hand: ['man-1','man-2','man-3','man-4','man-5','man-6','man-7','man-8','man-9','pin-5','pin-6','pin-7','sou-9'], win: 'sou-9' },
    'Хотей':        { hand: ['sou-1','sou-2','sou-3','sou-4','sou-5','sou-6','sou-7','sou-8','sou-9','pin-1','pin-2','pin-3','man-9'], win: 'man-9' },
    'Ренхо':        { hand: ['pin-1','pin-2','pin-3','pin-4','pin-5','pin-6','pin-7','pin-8','pin-9','man-2','man-3','sou-6','sou-6'], win: 'man-4' },
    'Кокуши мусо':  { hand: ['man-1','man-9','pin-1','pin-9','sou-1','sou-9','wind-east','wind-south','wind-west','wind-north','dragon-red','dragon-green','dragon-white'], win: 'dragon-white' },
    'Суанкo':       { hand: ['pin-1','pin-1','pin-1','man-9','man-9','man-9','sou-5','sou-5','sou-5','wind-east','wind-east','wind-east','pin-3'], win: 'pin-3' },
    'Дайсанген':    { hand: ['dragon-red','dragon-red','dragon-red','dragon-green','dragon-green','dragon-green','dragon-white','dragon-white','dragon-white','pin-1','pin-2','pin-3','man-5'], win: 'man-5' },
    'Шосуси':       { hand: ['wind-east','wind-east','wind-east','wind-south','wind-south','wind-south','wind-west','wind-west','wind-west','wind-north','wind-north','pin-1','pin-2'], win: 'pin-3' },
    'Дайсуси':      { hand: ['wind-east','wind-east','wind-east','wind-south','wind-south','wind-south','wind-west','wind-west','wind-west','wind-north','wind-north','wind-north','pin-1'], win: 'pin-1' },
    'Цуиісо':       { hand: ['dragon-red','dragon-red','dragon-red','dragon-green','dragon-green','dragon-green','dragon-white','dragon-white','dragon-white','wind-east','wind-east','wind-east','wind-south'], win: 'wind-south' },
    'Чинрото':      { hand: ['pin-1','pin-1','pin-1','pin-9','pin-9','pin-9','man-1','man-1','man-1','man-9','man-9','man-9','sou-1'], win: 'sou-1' },
    'Рюиісо':       { hand: ['sou-2','sou-3','sou-4','sou-2','sou-3','sou-4','dragon-green','dragon-green','dragon-green','sou-6','sou-6','sou-6','sou-8'], win: 'sou-8' },
    'Чуурен пото':  { hand: ['pin-1','pin-1','pin-1','pin-2','pin-3','pin-4','pin-5','pin-6','pin-7','pin-8','pin-9','pin-9','pin-9'], win: 'pin-5' },
    'Суканцу':      { hand: ['pin-1','pin-1','pin-1','man-9','man-9','man-9','wind-east','wind-east','wind-east','dragon-green','dragon-green','dragon-green','sou-5'], win: 'sou-5' },
    'Тэнхо':        { hand: ['man-1','man-2','man-3','man-4','man-5','man-6','man-7','man-8','man-9','sou-1','sou-2','sou-3','pin-5'], win: 'pin-5' },
    'Чихо':         { hand: ['sou-1','sou-2','sou-3','sou-4','sou-5','sou-6','sou-7','sou-8','sou-9','man-2','man-3','man-4','pin-7'], win: 'pin-7' },
};

function renderHandTiles(name) {
    const data = yakuHands[name];
    if (!data) return `<img src="img/tiles-render/18.png" class="yaku-hand-image" alt="">`;
    const base = 'img/tile-png-white-bg/';
    const handHtml = data.hand
        .map((t) => `<img src="${base}${t}.png" class="yaku-mini-tile" alt="${t}">`)
        .join('');
    const winHtml = `<img src="${base}${data.win}.png" class="yaku-mini-tile yaku-mini-tile--win" alt="${data.win}">`;
    return `<div class="yaku-hand-tiles">${handHtml}<span class="yaku-hand-sep"></span>${winHtml}</div>`;
}

function rowToHtml(row) {
    const [name, description, openness, cost] = row;

    return `
        <article class="yaku-row">
            <div class="yaku-cell yaku-name-cell">
                <span class="yaku-name-title">${escapeHtml(name)}</span>
                ${renderHandTiles(name)}
            </div>
            <div class="yaku-cell">${escapeHtml(description)}</div>
            <div class="yaku-cell">${escapeHtml(openness)}</div>
            <div class="yaku-cell yaku-cost-cell">${escapeHtml(cost)}</div>
        </article>
    `;
}

function createRowElement(row) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = rowToHtml(row);
    return wrapper.firstElementChild;
}

function createTableState(rows, container) {
    const byName = new Map(rows.map((row) => [row[0], row]));
    const elements = new Map();

    rows.forEach((row, index) => {
        const element = createRowElement(row);
        element.classList.add('yaku-row-entering');
        element.style.transitionDelay = `${Math.min(index, 7) * 35}ms`;
        container.appendChild(element);
        requestAnimationFrame(() => {
            element.classList.remove('yaku-row-entering');
        });
        elements.set(row[0], element);
    });

    return { byName, elements, container };
}

function updateRows(nextRows, state) {
    const nextNames = new Set(nextRows.map((row) => row[0]));

    state.elements.forEach((element, name) => {
        if (nextNames.has(name)) {
            return;
        }

        if (element.classList.contains('yaku-row-leaving')) {
            return;
        }

        element.classList.add('yaku-row-leaving');
        setTimeout(() => {
            if (element.parentElement) {
                element.remove();
            }
            state.elements.delete(name);
        }, 240);
    });

    nextRows.forEach((row, index) => {
        const name = row[0];
        let element = state.elements.get(name);

        if (!element) {
            element = createRowElement(row);
            element.classList.add('yaku-row-entering');
            element.style.transitionDelay = `${Math.min(index, 7) * 25}ms`;
            state.elements.set(name, element);
        } else {
            element.classList.remove('yaku-row-leaving');
        }

        state.container.appendChild(element);

        if (element.classList.contains('yaku-row-entering')) {
            requestAnimationFrame(() => {
                element.classList.remove('yaku-row-entering');
            });
        }
    });
}

function applySearch(rows, state, input, emptyState) {
    const searchableRows = rows.map((row) => ({
        row,
        haystack: normalize(row.join(' '))
    }));

    const update = () => {
        const query = normalize(input.value);
        const filtered = query
            ? searchableRows.filter((item) => item.haystack.includes(query)).map((item) => item.row)
            : rows;

        updateRows(filtered, state);
        emptyState.hidden = filtered.length > 0;
    };

    input.addEventListener('input', update);
    update();
}

function setupSearchVisibility(searchSticky, tableShell) {
    const observer = new IntersectionObserver(
        (entries) => {
            const isVisible = entries.some((entry) => entry.isIntersecting);
            searchSticky.classList.toggle('yaku-search-visible', isVisible);
        },
        {
            root: null,
            threshold: 0.07
        }
    );

    observer.observe(tableShell);
}

function escapeHtml(value) {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}
