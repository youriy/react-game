/**
 * Прогресс игрока по уровням: лучшие звёзды и какие уровни открыты.
 * Считается по сохранённым результатам (core/storage.js), отдельно ничего не хранится.
 */
import {getLevel, levelList} from "./levels.js";
import {loadLevelResults} from "./storage.js";
import {calculateStars} from "./score.js";

/**
 * Звёзды за сохранённый результат. У новых результатов они сохранены; у результатов до появления
 * звёзд считаются по счёту, а если нет и счёта — победа даёт 1 звезду.
 * @param {import("./storage.js").GameResult} result
 * @param {string} level - ключ уровня результата
 * @returns {number}
 */
export const getResultStars = (result, level) => {
    if (typeof result.stars === "number") {
        return result.stars;
    }

    return typeof result.score === "number" ? calculateStars(result.score, level) : 1;
};

/**
 * Лучшие звёзды на уровне за всё время; 0 — на уровне ещё не было побед.
 * @param {string} level - ключ уровня
 * @returns {number} 0–3
 */
export const getBestStars = (level) =>
    loadLevelResults(level).reduce((best, result) => Math.max(best, getResultStars(result, level)), 0);

/**
 * Открыт ли уровень: открыт сразу (unlockedBy = null), есть победа на уровне unlockedBy (предыдущем)
 * или есть победы на этом уровне либо на более сложном. Последнее — чтобы у игроков, которые
 * играли до появления последовательного открытия, не закрылись уровни, где у них уже есть рекорды
 * (и все уровни перед ними).
 * @param {string} level - ключ уровня
 * @returns {boolean}
 */
export const isLevelUnlocked = (level) => {
    const current = getLevel(level);

    if (!current.unlockedBy) {
        return true;
    }

    const keys = [current.unlockedBy, ...levelList.slice(levelList.indexOf(current)).map(item => item.key)];

    return keys.some(key => loadLevelResults(key).length > 0);
};

/**
 * Ключи всех открытых уровней, в порядке levelList.
 * @returns {string[]}
 */
export const getUnlockedLevels = () => levelList.map(level => level.key).filter(isLevelUnlocked);

/**
 * Самый сложный из открытых уровней — на него переключаемся, если выбран закрытый.
 * @returns {string} ключ уровня
 */
export const getLastUnlockedLevel = () => getUnlockedLevels().pop();
