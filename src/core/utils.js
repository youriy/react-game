/**
 * Утилиты общего назначения, без зависимостей.
 */

/** Число двумя цифрами: 5 → "05". */
const pad2 = (number) => String(number).padStart(2, "0");

/**
 * Перемешивает массив на месте (алгоритм Фишера — Йетса).
 * @template T
 * @param {T[]} array - массив, который нужно перемешать (будет изменён)
 * @returns {T[]} тот же массив, уже перемешанный
 */
export const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
};

/**
 * Форматирует длительность в строку вида «ЧЧ : ММ : СС».
 * @param {number} seconds - длительность в секундах
 * @returns {string} например, `formatTime(75)` → "00 : 01 : 15"
 */
export const formatTime = (seconds) =>
    `${pad2(Math.floor(seconds / 3600))} : ${pad2(Math.floor(seconds / 60) % 60)} : ${pad2(seconds % 60)}`;

/**
 * Форматирует дату и время (местное) в строку "YYYY-MM-DD HH:mm:ss" —
 * в таком виде дата хранится в результатах игр.
 * @param {Date} [date=new Date()]
 * @returns {string} например, "2026-10-22 13:05:09"
 */
export const formatDate = (date = new Date()) =>
    `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} `
    + `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`;
