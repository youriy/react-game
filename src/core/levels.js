/**
 * Уровни сложности.
 *
 * Чтобы добавить уровень — добавьте элемент сюда и подписи (ключ `labelKey`) во все языки
 * в core/Language.js. Число пар не может быть больше числа иконок в core/icons.js.
 *
 * @typedef {Object} Level
 * @property {string} key - идентификатор уровня (хранится в настройках и в результатах)
 * @property {string} labelKey - ключ подписи в languageList (core/Language.js)
 * @property {number} pairs - сколько пар карточек на поле
 * @property {number} columns - сколько карточек в ряду
 * @property {number} previewTime - сколько карточки показываются в начале партии, мс
 * @property {number} scoreMultiplier - множитель итогового счёта (сложнее — больше очков)
 */

/** @type {Level[]} в порядке показа в переключателе */
export const levelList = [
    {key: "easy", labelKey: "easy", pairs: 8, columns: 4, previewTime: 1500, scoreMultiplier: 0.5},
    {key: "medium", labelKey: "medium", pairs: 18, columns: 6, previewTime: 2000, scoreMultiplier: 1},
    {key: "hard", labelKey: "hard", pairs: 24, columns: 8, previewTime: 3000, scoreMultiplier: 1.5},
];

/**
 * Уровень по умолчанию. Им же считаются старые результаты, сохранённые до появления уровней:
 * тогда поле было 6×6, как сейчас на среднем уровне.
 */
export const DEFAULT_LEVEL = "medium";

/**
 * Настройки уровня по ключу; для неизвестного ключа — уровень по умолчанию.
 * @param {string} key - например, 'hard'
 * @returns {Level}
 */
export const getLevel = (key) =>
    levelList.find(level => level.key === key) || levelList.find(level => level.key === DEFAULT_LEVEL);
