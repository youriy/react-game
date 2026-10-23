/**
 * Достижения: список, условия и прогресс игрока.
 *
 * Достижение бывает со ступенями (бронза, серебро, золото — 1, 2, 3) или одноступенчатое (только 1).
 * «По уровням» (perLevel) — отдельное достижение на каждом уровне: «Скорость» на среднем и «Скорость»
 * на сложном считаются двумя. Ключ прогресса — id, а у достижений по уровням `id.уровень`
 * (например, "speed.medium").
 *
 * Откуда берётся прогресс:
 * - достижения по итогам партии (`fromGame`) проверяются после каждой победы (evaluateGame) и хранятся
 *   в localStorage по ключу "achievements" (loadAchievements/saveAchievements в storage.js);
 * - достижения по истории (`fromHistory`: победы, первые ★★★, все уровни, найденные пары) считаются по сохранённым
 *   результатам (и счётчику пар) при каждом показе, поэтому у тех, кто играл до появления достижений, они уже открыты.
 *
 * Пороги подобраны симуляцией партий (23.10.2026): бронзу получают ~80 % побед, серебро ~30 %, золото ~5 %.
 *
 * Чтобы добавить достижение — добавьте элемент в achievementList и тексты (ключи `ach<Id>` и `ach<Id>Desc`,
 * см. getTextKeys) во все языки в dictionary/languages.js.
 */
import {getLevel, LEGACY_LEVEL, levelList} from "./levels.js";
import {loadAchievements, loadPairsFound, loadResults, saveAchievements} from "./storage.js";
import {getResultStars} from "./progress.js";

/** Медали ступеней: 1 — бронза, 2 — серебро, 3 — золото. */
export const MEDALS = ["🥉", "🥈", "🥇"];

/**
 * Итоги выигранной партии, по которым проверяются достижения.
 * @typedef {Object} GameSummary
 * @property {string} level - ключ уровня
 * @property {number} time - время в секундах (без показа карточек в начале)
 * @property {number} misses - промахи (неугаданные пары)
 * @property {number} seenMisses - промахи, когда второй открытой была уже открывавшаяся в партии карточка
 * @property {number} luckyPairs - пары, угаданные с первого раза: обе карточки ещё не открывались
 * @property {number} bestStreak - лучшая серия пар
 * @property {boolean} hintUsed - взята подсказка
 * @property {number} hour - час окончания партии по часам устройства, 0–23
 */

/**
 * @typedef {Object} Achievement
 * @property {string} id
 * @property {string} icon - эмодзи в списке и во всплывашке
 * @property {number[]} [tiers] - пороги бронзы, серебра и золота (чем больше значение, тем лучше)
 * @property {Object<string, number[]>} [perLevel] - пороги по уровням (чем меньше значение, тем лучше)
 * @property {string[]} [levels] - уровни бронзы, серебра и золота (ступень зависит от уровня партии)
 * @property {string} [unit] - как показывать порог: 'time' — «м:сс», иначе числом
 * @property {boolean} [noHint] - партия с подсказкой не засчитывается
 * @property {function(GameSummary, number[], string[]): number} [fromGame] - ступень (0–3) за партию
 *   (аргументы: итоги, пороги getTiers, уровни `levels`)
 * @property {function(HistorySummary, number[]): number} [fromHistory] - ступень (0–3) по истории
 * @property {function(HistorySummary): number} [progress] - текущее значение для подписи «сейчас / следующий порог»
 */

/**
 * Ступень по значению «чем больше, тем лучше»: сколько порогов достигнуто.
 * @param {number} value
 * @param {number[]} tiers - пороги по возрастанию
 * @returns {number} 0–3
 */
const tierAtLeast = (value, tiers) => tiers.filter(threshold => value >= threshold).length;

/**
 * Ступень по значению «чем меньше, тем лучше» (время, промахи).
 * @param {number} value
 * @param {number[]} tiers - пороги по убыванию
 * @returns {number} 0–3
 */
const tierAtMost = (value, tiers) => tiers.filter(threshold => value <= threshold).length;

/** Порядковый номер уровня в levelList (чем больше, тем сложнее). */
const levelIndex = (key) => levelList.findIndex(level => level.key === key);

/** @type {Achievement[]} в порядке показа в окне «Достижения» */
export const achievementList = [
    {
        id: "firstWin", icon: "🎉",
        fromHistory: ({wins}) => (wins > 0 ? 1 : 0),
    },
    {
        id: "threeStars", icon: "⭐",
        fromHistory: ({threeStars}) => (threeStars ? 1 : 0),
    },
    {
        id: "allLevels", icon: "🗺️",
        fromHistory: ({levelsWon}) => (levelsWon === levelList.length ? 1 : 0),
    },
    {
        id: "wins", icon: "🏁", tiers: [10, 50, 100],
        fromHistory: ({wins}, tiers) => tierAtLeast(wins, tiers),
        progress: ({wins}) => wins,
    },
    {
        // Найдено пар за все партии, включая брошенные; подсказка не мешает
        id: "collector", icon: "🃏", tiers: [200, 1000, 3000],
        fromHistory: ({pairsFound}, tiers) => tierAtLeast(pairsFound, tiers),
        progress: ({pairsFound}) => pairsFound,
    },
    {
        id: "streak", icon: "🔥", tiers: [3, 5, 8],
        fromGame: ({bestStreak}, tiers) => tierAtLeast(bestStreak, tiers),
    },
    {
        // Время, с
        id: "speed", icon: "⚡", unit: "time", noHint: true,
        perLevel: {
            veryEasy: [40, 25, 18], easy: [55, 35, 25], belowMedium: [75, 45, 33],
            medium: [135, 80, 55], aboveMedium: [180, 100, 70], hard: [240, 125, 85],
        },
        fromGame: ({time}, tiers) => tierAtMost(time, tiers),
    },
    {
        // Промахов не больше
        id: "accuracy", icon: "🎯", noHint: true,
        perLevel: {
            veryEasy: [4, 2, 1], easy: [7, 4, 2], belowMedium: [10, 5, 3],
            medium: [20, 10, 6], aboveMedium: [28, 14, 9], hard: [40, 19, 12],
        },
        fromGame: ({misses}, tiers) => tierAtMost(misses, tiers),
    },
    {
        // Без промахов на любом уровне (по симуляции реально только на очень лёгком — ~0,7 % побед)
        id: "flawless", icon: "💎", noHint: true,
        fromGame: ({misses}) => (misses === 0 ? 1 : 0),
    },
    {
        // Ступень — по уровню: ниже среднего и сложнее — бронза, средний и сложнее — серебро, сложный — золото
        id: "perfectMemory", icon: "🧠", noHint: true, levels: ["belowMedium", "medium", "hard"],
        fromGame: ({seenMisses, level}, tiers, levels) => (seenMisses > 0 ? 0
            : levels.filter(key => levelIndex(level) >= levelIndex(key)).length),
    },
    {
        // Угаданных с первого раза пар за партию
        id: "lucky", icon: "🍀", tiers: [1, 2, 3], noHint: true,
        fromGame: ({luckyPairs}, tiers) => tierAtLeast(luckyPairs, tiers),
    },
    {
        // Победа с 0:00 до 5:00 по часам устройства
        id: "owl", icon: "🦉",
        fromGame: ({hour}) => (hour < 5 ? 1 : 0),
    },
];

/**
 * Ключи текстов достижения в languageList: название и описание.
 * @param {string} id - например, 'firstWin'
 * @returns {{title: string, description: string}} например, {title: 'achFirstWin', description: 'achFirstWinDesc'}
 */
export const getTextKeys = (id) => {
    const name = `ach${id[0].toUpperCase()}${id.slice(1)}`;

    return {title: name, description: `${name}Desc`};
};

/**
 * Все отдельно засчитываемые достижения: у достижений по уровням — по одному на уровень.
 * @returns {Array<{key: string, achievement: Achievement, level: (string|undefined)}>}
 */
export const getAchievementEntries = () => achievementList.flatMap(achievement => (achievement.perLevel
    ? levelList.map(level => ({key: `${achievement.id}.${level.key}`, achievement, level: level.key}))
    : [{key: achievement.id, achievement, level: undefined}]));

/**
 * @typedef {Object} HistorySummary
 * @property {number} wins - всего побед
 * @property {boolean} threeStars - хоть раз получены ★★★
 * @property {number} levelsWon - на скольких уровнях есть победы
 * @property {number} pairsFound - найдено пар всего: счётчик (core/storage.js, loadPairsFound) плюс пары побед,
 *   сохранённых до появления счётчика (по числу пар их уровня)
 */

/**
 * Сводка по всем сохранённым результатам.
 * @returns {HistorySummary}
 */
export const getHistorySummary = () => {
    const results = loadResults();
    const levels = new Set(results.map(result => result.level || LEGACY_LEVEL));
    const pairs = loadPairsFound();
    // Даты в формате "YYYY-MM-DD HH:mm:ss" сравниваются как строки
    const earlierPairs = results
        .filter(result => typeof result.date === "string" && result.date < pairs.since)
        .reduce((sum, result) => sum + getLevel(result.level || LEGACY_LEVEL).pairs, 0);

    return {
        wins: results.length,
        threeStars: results.some(result => getResultStars(result, result.level || LEGACY_LEVEL) === 3),
        levelsWon: levelList.filter(level => levels.has(level.key)).length,
        pairsFound: pairs.count + earlierPairs,
    };
};

/**
 * Текущий прогресс: ступень каждого достижения (0 — не получено).
 * @returns {Object<string, number>} ключ из getAchievementEntries → 0–3
 */
export const getAchievementTiers = () => {
    const saved = loadAchievements();
    const history = getHistorySummary();

    return Object.fromEntries(getAchievementEntries().map(({key, achievement}) => [
        key,
        achievement.fromHistory ? achievement.fromHistory(history, achievement.tiers) : (saved[key] || 0),
    ]));
};

/**
 * Пороги достижения: общие или уровня.
 * @param {Achievement} achievement
 * @param {string} [level]
 * @returns {number[]|undefined}
 */
export const getTiers = (achievement, level) => (achievement.perLevel ? achievement.perLevel[level] : achievement.tiers);

/**
 * Проверяет достижения по итогам партии и сохраняет улучшения. Ступень никогда не понижается.
 * @param {GameSummary} game
 */
export const evaluateGame = (game) => {
    const saved = loadAchievements();
    let changed = false;

    getAchievementEntries().forEach(({key, achievement, level}) => {
        if (!achievement.fromGame || (achievement.noHint && game.hintUsed) || (level && level !== game.level)) {
            return;
        }

        const tier = achievement.fromGame(game, getTiers(achievement, level), achievement.levels);

        if (tier > (saved[key] || 0)) {
            saved[key] = tier;
            changed = true;
        }
    });

    if (changed) {
        saveAchievements(saved);
    }
};

/**
 * Что улучшилось между двумя снимками прогресса (getAchievementTiers до и после партии).
 * @param {Object<string, number>} before
 * @param {Object<string, number>} after
 * @returns {Array<{key: string, tier: number}>} в порядке achievementList
 */
export const getImproved = (before, after) =>
    Object.keys(after).filter(key => after[key] > (before[key] || 0)).map(key => ({key, tier: after[key]}));

/**
 * Достижение и уровень по ключу прогресса.
 * @param {string} key - например, 'speed.medium' или 'owl'
 * @returns {{achievement: Achievement, level: (string|undefined)}}
 */
export const parseKey = (key) => {
    const [id, level] = key.split(".");

    return {achievement: achievementList.find(item => item.id === id), level};
};

/** Максимальная ступень достижения: 3 у ступенчатых, 1 у одноступенчатых. */
export const getMaxTier = (achievement) => (achievement.tiers || achievement.perLevel || achievement.levels ? 3 : 1);
