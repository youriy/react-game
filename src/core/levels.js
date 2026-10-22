/**
 * Уровни сложности.
 *
 * Чтобы добавить уровень — добавьте элемент сюда и подписи (ключ `labelKey`) во все языки
 * в dictionary/languages.js. Число пар не может быть больше числа иконок в core/icons.js.
 *
 * @typedef {Object} Level
 * @property {string} key - идентификатор уровня (хранится в настройках и в результатах)
 * @property {string} labelKey - ключ подписи в languageList (dictionary/languages.js)
 * @property {number} pairs - сколько пар карточек на поле
 * @property {number} columns - сколько карточек в ряду
 * @property {number} mobileColumns - сколько карточек в ряду на телефоне (узкий экран, см. useIsMobile)
 * @property {number} previewTime - сколько карточки показываются в начале партии, мс
 * @property {number} scoreMultiplier - множитель итогового счёта (сложнее — больше очков)
 * @property {[number, number]} starScores - итоговый счёт для 2 и 3 звёзд (1 звезда — за любую победу).
 *   Пороги подобраны по формуле очков для типичной и хорошей игры; их можно подкрутить
 * @property {string|null} unlockedBy - уровень, победа на котором открывает этот; null — открыт сразу
 */

/** @type {Level[]} в порядке показа в переключателе */
export const levelList = [
    {
        key: "easy", labelKey: "easy", pairs: 8, columns: 4, mobileColumns: 4, previewTime: 2500,
        scoreMultiplier: 0.5, starScores: [2500, 3000], unlockedBy: null,
    },
    {
        key: "medium", labelKey: "medium", pairs: 18, columns: 6, mobileColumns: 6, previewTime: 3000,
        scoreMultiplier: 1, starScores: [5000, 8000], unlockedBy: null,
    },
    {
        key: "hard", labelKey: "hard", pairs: 24, columns: 8, mobileColumns: 6, previewTime: 4000,
        scoreMultiplier: 1.5, starScores: [7000, 11000], unlockedBy: "medium",
    },
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
