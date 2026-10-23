/**
 * Уровни сложности.
 *
 * Чтобы добавить уровень — добавьте элемент сюда и подписи (ключ `labelKey`) во все языки
 * в dictionary/languages.js. Число пар не может быть больше числа иконок в icons/icons.js.
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
 * @property {string|null} unlockedBy - уровень, победа на котором открывает этот (предыдущий); null — открыт сразу.
 *   Уровень, на котором (или на более сложном) у игрока уже есть победы, тоже открыт — см. core/progress.js
 */

/**
 * В порядке показа в переключателе и открытия: сначала открыт только первый, каждый следующий
 * открывается победой на предыдущем.
 * Ключи уровней хранятся в результатах игроков (localStorage) — существующие ключи не переименовывать.
 * @type {Level[]}
 */
export const levelList = [
    {
        key: "veryEasy", labelKey: "veryEasy", pairs: 6, columns: 4, mobileColumns: 4, previewTime: 2000,
        scoreMultiplier: 0.25, starScores: [1250, 1450], unlockedBy: null,
    },
    {
        key: "easy", labelKey: "easy", pairs: 8, columns: 4, mobileColumns: 4, previewTime: 2500,
        scoreMultiplier: 0.5, starScores: [2500, 3000], unlockedBy: "veryEasy",
    },
    {
        key: "belowMedium", labelKey: "belowMedium", pairs: 10, columns: 4, mobileColumns: 4, previewTime: 2750,
        scoreMultiplier: 0.75, starScores: [3750, 4750], unlockedBy: "easy",
    },
    {
        key: "medium", labelKey: "medium", pairs: 15, columns: 5, mobileColumns: 5, previewTime: 3000,
        scoreMultiplier: 1, starScores: [5000, 7500], unlockedBy: "belowMedium",
    },
    {
        key: "aboveMedium", labelKey: "aboveMedium", pairs: 18, columns: 6, mobileColumns: 6, previewTime: 3250,
        scoreMultiplier: 1.25, starScores: [6250, 9000], unlockedBy: "medium",
    },
    {
        key: "hard", labelKey: "hard", pairs: 21, columns: 7, mobileColumns: 6, previewTime: 3500,
        scoreMultiplier: 1.5, starScores: [7500, 10500], unlockedBy: "aboveMedium",
    },
];

/** Уровень по умолчанию: с него начинает новый игрок (единственный открытый сразу). */
export const DEFAULT_LEVEL = "veryEasy";

/**
 * Уровень, которым считаются старые результаты без ключа уровня (сохранённые до появления уровней:
 * тогда поле было 6×6, 18 пар; сейчас средний уровень — 5×6, 15 пар).
 */
export const LEGACY_LEVEL = "medium";

/**
 * Настройки уровня по ключу; для неизвестного ключа — уровень по умолчанию.
 * @param {string} key - например, 'hard'
 * @returns {Level}
 */
export const getLevel = (key) =>
    levelList.find(level => level.key === key) || levelList.find(level => level.key === DEFAULT_LEVEL);
