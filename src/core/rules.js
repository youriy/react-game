/**
 * Правила игры в виде чистых функций над колодой (без React и Redux).
 * Колода — массив карточек CardItem (см. store/itemsSlice.js).
 */

/**
 * Индексы открытых сейчас карточек.
 * @param {import("../store/itemsSlice.js").CardItem[]} items
 * @returns {number[]}
 */
export const getOpenIndexes = (items) =>
    items.reduce((indexes, item, index) => (item.open ? [...indexes, index] : indexes), []);

/**
 * Совпадают ли две карточки (одна пара).
 * @param {import("../store/itemsSlice.js").CardItem[]} items
 * @param {[number, number]} indexes - индексы двух карточек
 * @returns {boolean}
 */
export const isPairMatch = (items, [first, second]) => items[first].type === items[second].type;

/**
 * Все пары убраны с поля — партия выиграна.
 * @param {import("../store/itemsSlice.js").CardItem[]} items
 * @returns {boolean}
 */
export const isBoardCleared = (items) => items.length > 0 && items.every(item => item.delete);
