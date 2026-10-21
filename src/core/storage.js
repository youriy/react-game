import moment from "moment";
import Helper from "./Helper.jsx";
import {calculateScore} from "./score.js";

/**
 * Работа с localStorage: настройки (язык, тема), результаты игр и рекорды.
 *
 * Результат игры хранится в массиве по ключу "results":
 * @typedef {Object} GameResult
 * @property {string} date - дата и время окончания, "YYYY-MM-DD HH:mm:ss" (уникально, это id строки в таблице)
 * @property {number} try - число попыток
 * @property {string} time - длительность в виде "ЧЧ : ММ : СС"
 * @property {number} [seconds] - длительность в секундах (нет у старых результатов)
 * @property {number} [bestStreak] - лучшая серия партии (нет у старых результатов)
 * @property {number} [score] - итоговый счёт (нет у результатов до появления очков)
 */

const RESULTS_KEY = "results";

/**
 * Читает настройку из localStorage.
 * @param {string} key - ключ настройки ("language", "theme")
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
const getSeconds = (result) => {
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
 * Результаты, отсортированные по очкам от лучшего; игры без очков — в конце.
 * @returns {GameResult[]}
 */
export const loadSortedResults = () => [...loadResults()].sort((a, b) => (b.score ?? -1) - (a.score ?? -1));

/**
 * Рекорды по всем сохранённым играм. Значение undefined — по этому показателю данных ещё нет.
 * @returns {{score: (number|undefined), time: (number|undefined), streak: (number|undefined)}}
 * score — лучший итоговый счёт, time — лучшее (наименьшее) время в секундах, streak — лучшая серия.
 */
export const getRecords = () => {
    const results = loadResults();
    const pick = (values, best) => {
        const defined = values.filter(value => typeof value === "number");

        return defined.length ? best(...defined) : undefined;
    };

    return {
        score: pick(results.map(result => result.score), Math.max),
        time: pick(results.map(getSeconds), Math.min),
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
 */
export const saveResult = ({count, time, score, hintUsed, bestStreak}) => {
    const results = loadResults();

    results.push({
        date: moment().format('YYYY-MM-DD HH:mm:ss'),
        try: count,
        time: Helper.formatTime(time),
        seconds: time,
        bestStreak,
        score: calculateScore({score, time, count, hintUsed}).total
    });

    localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
};
