import {formatDate, formatTime} from "./utils.js";
import {calculateScore, calculateStars} from "./score.js";
import {LEGACY_LEVEL} from "./levels.js";

/**
 * Работа с localStorage: настройки (язык, тема, уровень), результаты игр, рекорды и достижения (ключи "achievements" и "pairsFound").
 * Все обращения к localStorage — только через readItem/writeItem: если он недоступен или переполнен,
 * данные хранятся в памяти (memoryStorage) и игра продолжает работать.
 *
 * Результат игры хранится в массиве по ключу "results":
 * @typedef {Object} GameResult
 * @property {string} date - дата и время окончания, "YYYY-MM-DD HH:mm:ss" (уникально, это id строки в таблице)
 * @property {number} try - число попыток
 * @property {string} time - длительность в виде "ЧЧ : ММ : СС"
 * @property {number} [seconds] - длительность в секундах (нет у старых результатов)
 * @property {number} [bestStreak] - лучшая серия партии (нет у старых результатов)
 * @property {number} [score] - итоговый счёт (нет у результатов до появления очков)
 * @property {string} [level] - ключ уровня (нет у результатов до появления уровней — они считаются средним)
 * @property {number} [stars] - звёзды за партию, 1–3 (нет у результатов до появления звёзд)
 */

const RESULTS_KEY = "results";

/**
 * Запасное хранилище в памяти. localStorage бывает недоступен (игра во фрейме площадки с заблокированными
 * сторонними данными, sandbox без allow-same-origin, некоторые режимы инкогнито) или переполнен
 * (QuotaExceededError). Тогда игра не падает, а помнит настройки и результаты до перезагрузки страницы.
 * Всё, что записано за сессию, лежит здесь, поэтому чтение всегда видит последнюю запись,
 * даже если в localStorage она не попала.
 * @type {Map<string, string>}
 */
const memoryStorage = new Map();

/**
 * Читает строку: сначала из памяти (записи этой сессии), затем из localStorage.
 * Любая ошибка доступа к localStorage даёт null.
 * @param {string} key
 * @returns {string|null}
 */
const readItem = (key) => {
    if (memoryStorage.has(key)) {
        return memoryStorage.get(key);
    }

    try {
        return localStorage.getItem(key);
    } catch (e) {
        return null;
    }
};

/**
 * Записывает строку в память и пытается сохранить в localStorage. Ошибку записи не пробрасывает.
 * Единая точка записи — сюда же потом подключается облачное хранилище SDK площадки.
 * @param {string} key
 * @param {string} value
 */
const writeItem = (key, value) => {
    memoryStorage.set(key, value);

    try {
        localStorage.setItem(key, value);
    } catch (e) {
        // localStorage недоступен или переполнен — значение остаётся в памяти до перезагрузки
    }
};

/**
 * Читает настройку из localStorage.
 * @param {string} key - ключ настройки ("language", "theme", "level")
 * @param {string} defaultValue - значение, если настройки нет
 * @returns {string}
 */
export const loadSetting = (key, defaultValue) => readItem(key) || defaultValue;

/**
 * Сохраняет настройку в localStorage (значение приводится к строке, как это делает сам localStorage).
 * @param {string} key
 * @param {string|boolean} value
 */
export const saveSetting = (key, value) => {
    writeItem(key, String(value));
};

/**
 * Все сохранённые результаты в порядке сохранения. Повреждённые данные (не JSON, не массив)
 * дают пустой список, элементы, которые не являются объектами, пропускаются.
 * @returns {GameResult[]}
 */
export const loadResults = () => {
    try {
        const results = JSON.parse(readItem(RESULTS_KEY));

        return Array.isArray(results) ? results.filter(result => result && typeof result === "object") : [];
    } catch (e) {
        return [];
    }
};

/**
 * Длительность игры в секундах. У старых результатов есть только строка "ЧЧ : ММ : СС" — разбирает её.
 * @param {GameResult} result
 * @returns {number|undefined}
 */
export const getResultSeconds = (result) => {
    if (typeof result.seconds === "number") {
        return result.seconds;
    }

    if (typeof result.time !== "string") {
        return undefined;
    }

    const [hours, minutes, seconds] = result.time.split(":").map(Number);
    const total = hours * 3600 + minutes * 60 + seconds;

    return Number.isNaN(total) ? undefined : total;
};

/**
 * Результаты одного уровня. Старые результаты без уровня относятся к уровню по умолчанию.
 * @param {string} level - ключ уровня
 * @returns {GameResult[]}
 */
export const loadLevelResults = (level) => loadResults().filter(result => (result.level || LEGACY_LEVEL) === level);

/**
 * Результаты уровня, отсортированные по очкам от лучшего; игры без очков — в конце.
 * @param {string} level - ключ уровня
 * @returns {GameResult[]}
 */
export const loadSortedResults = (level) =>
    loadLevelResults(level).sort((a, b) => (b.score ?? -1) - (a.score ?? -1));

/**
 * Рекорды уровня по всем сохранённым играм. Значение undefined — по этому показателю данных ещё нет.
 * @param {string} level - ключ уровня
 * @returns {{score: (number|undefined), time: (number|undefined), streak: (number|undefined)}}
 * score — лучший итоговый счёт, time — лучшее (наименьшее) время в секундах, streak — лучшая серия.
 */
export const getRecords = (level) => {
    const results = loadLevelResults(level);
    const pick = (values, best) => {
        const defined = values.filter(value => typeof value === "number");

        return defined.length ? best(...defined) : undefined;
    };

    return {
        score: pick(results.map(result => result.score), Math.max),
        time: pick(results.map(getResultSeconds), Math.min),
        streak: pick(results.map(result => result.bestStreak), Math.max),
    };
};

/**
 * Сохраняет результат завершённой (выигранной) партии. Итоговый счёт считается здесь же.
 * @param {Object} game - состояние партии (обычно весь state.game)
 * @param {number} game.count - попытки
 * @param {number} game.time - время в секундах
 * @param {number} game.score - очки за пары
 * @param {boolean} game.hintUsed - использована ли подсказка
 * @param {number} game.bestStreak - лучшая серия
 * @param {string} game.level - ключ уровня
 */
export const saveResult = ({count, time, score, hintUsed, bestStreak, level}) => {
    const results = loadResults();
    const total = calculateScore({score, time, count, hintUsed, level}).total;

    results.push({
        date: formatDate(),
        try: count,
        time: formatTime(time),
        seconds: time,
        bestStreak,
        level,
        score: total,
        stars: calculateStars(total, level),
    });

    writeItem(RESULTS_KEY, JSON.stringify(results));
};

const ACHIEVEMENTS_KEY = "achievements";

/**
 * Сохранённый прогресс достижений по итогам партий (см. core/achievements.js).
 * Повреждённые данные дают пустой прогресс, нечисловые значения пропускаются.
 * @returns {Object<string, number>} ключ достижения (например, "speed.medium") → ступень 1–3
 */
export const loadAchievements = () => {
    try {
        const saved = JSON.parse(readItem(ACHIEVEMENTS_KEY));

        return saved && typeof saved === "object" && !Array.isArray(saved)
            ? Object.fromEntries(Object.entries(saved).filter(([, tier]) => typeof tier === "number"))
            : {};
    } catch (e) {
        return {};
    }
};

/**
 * Сохраняет прогресс достижений.
 * @param {Object<string, number>} achievements - ключ достижения → ступень 1–3
 */
export const saveAchievements = (achievements) => {
    writeItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
};

const PAIRS_FOUND_KEY = "pairsFound";

/**
 * Счётчик найденных пар для достижения «Коллекционер»: пары из всех партий (выигранных, брошенных кнопкой
 * «Сдаться» и начатых заново), с момента `since` — когда счётчик появился у игрока. Пары побед до этого
 * момента досчитываются по сохранённым результатам (см. getHistorySummary в core/achievements.js).
 * Если счётчика ещё нет или он повреждён, он создаётся с нулём и текущим временем.
 * @returns {{count: number, since: string}} since — дата в формате результатов, "YYYY-MM-DD HH:mm:ss"
 */
export const loadPairsFound = () => {
    try {
        const saved = JSON.parse(readItem(PAIRS_FOUND_KEY));

        if (saved && typeof saved.count === "number" && typeof saved.since === "string") {
            return saved;
        }
    } catch (e) {
        // повреждённые данные — создаём счётчик заново
    }

    const created = {count: 0, since: formatDate()};
    writeItem(PAIRS_FOUND_KEY, JSON.stringify(created));

    return created;
};

/**
 * Прибавляет найденные пары к счётчику «Коллекционера».
 * @param {number} pairs - сколько пар найдено в партии
 */
export const addPairsFound = (pairs) => {
    if (pairs > 0) {
        const saved = loadPairsFound();
        writeItem(PAIRS_FOUND_KEY, JSON.stringify({...saved, count: saved.count + pairs}));
    }
};
