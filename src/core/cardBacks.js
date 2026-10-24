/**
 * Рубашки карточек: узоры на закрытой стороне. Все нарисованы SVG-кодом без файлов картинок
 * и перекрашиваются под цвет темы и светлый/тёмный режим.
 *
 * Рубашки — награда за достижения: каждая открывается, когда сумма баллов славы (getTotalGlory
 * в core/achievements.js) дойдёт до порога `glory`. Обычная (`plain`, прежний вид) доступна всегда.
 * Выбранная рубашка — настройка `cardBack` (gameSlice, localStorage). Ключи `id` лежат в настройках
 * у игроков — не переименовывать.
 *
 * Чтобы добавить рубашку: дописать элемент в cardBackList (id, порог, функция рисования)
 * и название `back<Id>` во все языки в dictionary/languages.js.
 */

/** Рубашка по умолчанию и для неизвестного значения в настройках. */
export const DEFAULT_CARD_BACK = "plain";

/**
 * Смешивает два цвета в формате #rrggbb.
 * @param {string} from - первый цвет
 * @param {string} to - второй цвет
 * @param {number} amount - доля второго цвета, 0–1
 * @returns {string} цвет #rrggbb
 */
const mix = (from, to, amount) => {
    const parse = (hex) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
    const a = parse(from);
    const b = parse(to);

    return `#${a.map((value, i) => Math.round(value + (b[i] - value) * amount).toString(16).padStart(2, "0")).join("")}`;
};

/**
 * Генератор псевдослучайных чисел с зерном: звёзды, конфетти и мозаика каждый раз на тех же местах.
 * @param {number} seed
 * @returns {function(): number} следующее число от 0 до 1
 */
const random = (seed) => () => {
    seed = (seed * 16807) % 2147483647;

    return (seed - 1) / 2147483646;
};

/**
 * Цвета рисования из основного цвета темы. В светлом режиме узор светлее фона рубашки,
 * в тёмном (основной цвет там светлый) — темнее.
 * @typedef {Object} BackColors
 * @property {string} base - фон рубашки (основной цвет темы)
 * @property {string} pattern - узор, спокойный
 * @property {string} strong - узор, контрастный
 * @property {string} ink - самый контрастный к фону: белый в светлом режиме, цвет страницы в тёмном
 * @property {string} deep - чуть темнее фона (тени в «Мраморе»)
 */

/**
 * @param {string} primary - основной цвет темы, #rrggbb
 * @param {boolean} darkMode
 * @returns {BackColors}
 */
const getBackColors = (primary, darkMode) => {
    const ink = darkMode ? "#121826" : "#ffffff";

    return {
        base: primary,
        pattern: mix(primary, ink, 0.28),
        strong: mix(primary, ink, 0.55),
        ink,
        deep: mix(primary, "#000000", 0.18),
    };
};

const svg = (content, extra = "") =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" ${extra}>${content}</svg>`;

/** Знак вопроса: карточка явно «закрыта». Знак нарисован линией — шрифты в SVG-картинке недоступны. */
const drawQuestion = ({base, pattern, strong}) => svg(`<rect width="100" height="100" fill="${base}"/>
    <circle cx="50" cy="52" r="36" fill="none" stroke="${pattern}" stroke-width="2.5"/>
    <path d="M37 39a13 13 0 1 1 20 11c-4.5 2.6-7 5-7 10v3" fill="none" stroke="${strong}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="50" cy="76" r="5.5" fill="${strong}"/>`);

/** Соты: шестиугольная сетка линиями. */
const drawHex = ({base, pattern}) => svg(`<defs><pattern id="h" width="24" height="42" patternUnits="userSpaceOnUse">
        <path d="M12 0L24 7V21L12 28L0 21V7ZM12 28V42" fill="none" stroke="${pattern}" stroke-width="2.5"/>
    </pattern></defs>
    <rect width="100" height="100" fill="${base}"/><rect width="100" height="100" fill="url(#h)"/>`);

/** Лампочка — значок «Памяти» — с лучами на круглой подложке. */
const drawBulb = ({base, pattern, ink}) => svg(`<rect width="100" height="100" fill="${base}"/>
    <circle cx="50" cy="50" r="34" fill="${pattern}" opacity=".45"/>
    <g fill="none" stroke="${ink}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
        <path d="M50 24a17 17 0 0 1 10 30.8c-2.4 1.8-3.6 4.2-3.6 7V64H43.6v-2.2c0-2.8-1.2-5.2-3.6-7A17 17 0 0 1 50 24z"/>
        <path d="M44 70h12M46 76h8M50 14v-4M30 22l-3-3M70 22l3-3M22 41h-4M78 41h4"/>
        <path d="M45 46c0-3 2.2-5 5-5" stroke-width="3"/>
    </g>`);

// Пришелец из 8-битных игр: X — закрашенный пиксель
const INVADER = ["..X.....X..", "...X...X...", "..XXXXXXX..", ".XX.XXX.XX.", "XXXXXXXXXXX", "X.XXXXXXX.X", "X.X.....X.X", "...XX.XX..."];

/** Пиксели: мозаика из квадратиков и пришелец в центре. */
const drawPixels = ({base, pattern, ink}) => {
    const next = random(11);
    let mosaic = "";

    for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 20; x++) {
            const value = next();

            if (value >= 0.45) {
                mosaic += `<rect x="${x * 5}" y="${y * 5}" width="5" height="5" fill="${pattern}" opacity="${value < 0.75 ? 0.35 : 0.7}"/>`;
            }
        }
    }

    const invader = INVADER.flatMap((row, y) => [...row].map((cell, x) =>
        (cell === "X" ? `<rect x="${x * 5}" y="${y * 5}" width="5" height="5"/>` : ""))).join("");

    return svg(`<rect width="100" height="100" fill="${base}"/>${mosaic}
        <rect x="17" y="27" width="66" height="50" fill="${base}"/>
        <g transform="translate(22.5 30)" fill="${ink}">${invader}</g>`, 'shape-rendering="crispEdges"');
};

/** Звёздное небо: тёмный фон с оттенком темы, звёзды, искры и месяц. Звёзды и месяц светлые в обоих режимах. */
const drawStars = ({base}) => {
    const sky = mix(base, "#0b1030", 0.68);
    const next = random(7);
    let stars = "";

    for (let i = 0; i < 46; i++) {
        stars += `<circle cx="${(next() * 100).toFixed(1)}" cy="${(next() * 100).toFixed(1)}" r="${(0.35 + next() * 0.9).toFixed(2)}"`
            + ` fill="#fff" opacity="${(0.45 + next() * 0.55).toFixed(2)}"/>`;
    }

    const sparkle = (x, y, size) => `<path transform="translate(${x} ${y}) scale(${size})"`
        + ` d="M0-6Q.8-.8 6 0Q.8.8 0 6Q-.8.8-6 0Q-.8-.8 0-6Z" fill="#fff"/>`;

    return svg(`<rect width="100" height="100" fill="${sky}"/>
        <circle cx="74" cy="26" r="11" fill="#fff4cf"/><circle cx="79" cy="22" r="10" fill="${sky}"/>
        ${stars}${sparkle(24, 30, 0.9)}${sparkle(62, 70, 0.7)}${sparkle(30, 78, 0.55)}`);
};

/** Орнамент: розетка из восьми лепестков и завитки по углам. */
const drawOrnament = ({base, strong}) => {
    let petals = "";
    let dots = "";

    for (let angle = 0; angle < 360; angle += 45) {
        petals += `<ellipse cx="50" cy="35" rx="5.5" ry="13" transform="rotate(${angle} 50 50)"/>`;
        dots += `<circle cx="50" cy="22" r="2.2" transform="rotate(${angle + 22.5} 50 50)"/>`;
    }

    const curl = `<path d="M10 10C10 28 28 30 28 18C28 11 19 11 19 17" fill="none" stroke-width="2.6" stroke-linecap="round"/><circle cx="10" cy="10" r="2.6" stroke="none"/>`;

    return svg(`<rect width="100" height="100" fill="${base}"/>
        <g fill="${strong}" stroke="${strong}">
            <g stroke="none">${petals}${dots}</g>
            <circle cx="50" cy="50" r="7" fill="${base}" stroke-width="3"/><circle cx="50" cy="50" r="2.6" stroke="none"/>
            ${curl}<g transform="matrix(-1 0 0 1 100 0)">${curl}</g>
            <g transform="matrix(1 0 0 -1 0 100)">${curl}</g><g transform="matrix(-1 0 0 -1 100 100)">${curl}</g>
        </g>`);
};

/** Мрамор: полосы, искривлённые шумом (feTurbulence + feDisplacementMap), как разводы на мраморной бумаге. */
const drawMarble = ({base, pattern, strong, deep}) => {
    let lines = "";

    for (let y = -20; y < 130; y += 9) {
        lines += `<rect x="-20" y="${y}" width="140" height="${y % 2 ? 3 : 1.4}"/>`;
    }

    return svg(`<defs><filter id="m" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.018 0.03" numOctaves="3" seed="4" result="n"/>
            <feDisplacementMap in="SourceGraphic" in2="n" scale="38" xChannelSelector="R" yChannelSelector="G"/>
        </filter></defs>
        <rect width="100" height="100" fill="${base}"/>
        <g filter="url(#m)" transform="rotate(-25 50 50)">
            <g fill="${strong}" opacity=".8">${lines}</g>
            <ellipse cx="40" cy="55" rx="34" ry="16" fill="${deep}" opacity=".55"/>
            <ellipse cx="70" cy="25" rx="22" ry="9" fill="${pattern}" opacity=".6"/>
        </g>`);
};

/**
 * Все рубашки по возрастанию порога.
 * id — ключ (настройка `cardBack`, название `back<Id>` в словаре); glory — сколько баллов славы нужно,
 * чтобы открыть; draw — SVG-разметка по цветам темы (у обычной нет: её рисует MemoryCard прежним способом);
 * centered — рисунок в центре: квадратная картинка целиком посередине, а края карточки (она бывает и не квадратной)
 * залиты цветом фона. У остальных узор заполняет карточку, лишнее обрезается.
 * @type {Array<{id: string, glory: number, centered?: boolean, draw?: function(BackColors): string}>}
 */
export const cardBackList = [
    {id: "plain", glory: 0},
    {id: "question", glory: 100, centered: true, draw: drawQuestion},
    {id: "hex", glory: 200, draw: drawHex},
    {id: "bulb", glory: 320, centered: true, draw: drawBulb},
    {id: "pixels", glory: 440, draw: drawPixels},
    {id: "stars", glory: 560, draw: drawStars},
    {id: "ornament", glory: 700, centered: true, draw: drawOrnament},
    {id: "marble", glory: 800, draw: drawMarble},
];

/**
 * Рубашка по ключу; неизвестный ключ — обычная.
 * @param {string} id
 */
export const getCardBack = (id) => cardBackList.find(back => back.id === id) || cardBackList[0];

/**
 * Открыта ли рубашка при данной сумме баллов славы.
 * @param {{glory: number}} back
 * @param {number} glory
 * @returns {boolean}
 */
export const isCardBackUnlocked = (back, glory) => glory >= back.glory;

/**
 * Ключ названия рубашки в словаре.
 * @param {string} id - например, 'stars'
 * @returns {string} например, 'backStars'
 */
export const getCardBackTextKey = (id) => `back${id[0].toUpperCase()}${id.slice(1)}`;

// Готовые картинки: одна на рубашку, цвет и режим, общая для всех карточек поля
const imageCache = new Map();

/**
 * CSS-значение background-image для рубашки: SVG как data URI. Браузер растрирует картинку один раз,
 * сколько бы карточек её ни показывали (фильтр «Мрамора» не пересчитывается на каждой карточке).
 * @param {string} id - ключ рубашки
 * @param {string} primary - основной цвет темы, #rrggbb
 * @param {boolean} darkMode
 * @returns {string|null} `url("data:…")` или null для обычной рубашки
 */
export const getCardBackImage = (id, primary, darkMode) => {
    const back = getCardBack(id);

    if (!back.draw) {
        return null;
    }

    const key = `${back.id}|${primary}|${darkMode}`;

    if (!imageCache.has(key)) {
        const markup = back.draw(getBackColors(primary, darkMode)).replace(/\s+/g, " ");
        imageCache.set(key, `url("data:image/svg+xml,${encodeURIComponent(markup)}")`);
    }

    return imageCache.get(key);
};

/**
 * CSS-фон рубашки для sx: картинка, как её уложить и цвет под ней.
 * У обычной рубашки картинки нет — null.
 * @param {string} id - ключ рубашки
 * @param {string} primary - основной цвет темы, #rrggbb
 * @param {boolean} darkMode
 * @returns {{backgroundImage: string, backgroundSize: string, backgroundPosition: string,
 *   backgroundRepeat: string, backgroundColor: string}|null}
 */
export const getCardBackStyle = (id, primary, darkMode) => {
    const image = getCardBackImage(id, primary, darkMode);

    if (!image) {
        return null;
    }

    return {
        backgroundImage: image,
        backgroundSize: getCardBack(id).centered ? "contain" : "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: primary,
    };
};
