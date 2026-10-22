import {formatDate, formatTime} from "./utils.js";
import {calculateScore, calculateStars} from "./score.js";
import {DEFAULT_LEVEL} from "./levels.js";

/**
 * Работа с localStorage: настройки (язык, тема, уровень), результаты игр и рекорды.
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
 * Читает настройку из localStorage.
 * @param {string} key - ключ настройки ("language", "theme", "level")
 * @param {string} defaultValue - значение, если настройки нет
 * @returns {string}
 */
export const loadSetting = (key, defaultValue) => localStorage.getItem(key) || defaultValue;

/**
 * Сохраняет настройку в localStorage.
 * @param {string} key
 * @param {string} value
 */
export const saveSetting = (key, value) => {
    localStorage.setItem(key, value);
};

/**
 * Все сохранённые результаты в порядке сохранения. Повреждённые данные дают пустой список.
 * @returns {GameResult[]}
 */
export const loadResults = () => {
    try {
        return JSON.parse(localStorage.getItem(RESULTS_KEY)) || [];
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
export const loadLevelResults = (level) => loadResults().filter(result => (result.level || DEFAULT_LEVEL) === level);

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

    localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
};
