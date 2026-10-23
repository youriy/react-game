/**
 * Правила подсчёта очков. Все числа — константы, их можно менять здесь.
 *
 * Во время партии: каждая угаданная пара даёт MATCH_POINTS, а каждая следующая подряд —
 * на STREAK_BONUS больше (100, 150, 200…). Промах обнуляет серию.
 *
 * Итоговый счёт = (очки за пары + бонус за время + бонус за точность − штраф за подсказку)
 * × множитель уровня (core/levels.js), округлённый и не меньше нуля.
 *
 * Звёзды за партию (1–3) — по итоговому счёту и порогам уровня (starScores в core/levels.js).
 */
import {getLevel} from "./levels.js";

// Очки за угаданную пару и прибавка за каждую следующую пару в серии
export const MATCH_POINTS = 100;
export const STREAK_BONUS = 50;

// Бонус за время: максимум и сколько отнимается за каждую секунду
export const TIME_BONUS_MAX = 3000;
export const TIME_PENALTY_PER_SECOND = 10;

// Бонус за точность: максимум и сколько отнимается за каждую лишнюю попытку
// (лишняя — сверх минимума, равного числу пар на уровне)
export const ACCURACY_BONUS_MAX = 2000;
export const MISS_PENALTY = 50;

// Штраф к итоговому счёту за использование подсказки
export const HINT_PENALTY = 500;

/**
 * Очки за угаданную пару с учётом серии.
 * @param {number} streak - какая это пара подряд (1, 2, 3…)
 * @returns {number} например, getMatchPoints(3) → 200
 */
export const getMatchPoints = (streak) => MATCH_POINTS + STREAK_BONUS * (streak - 1);

/**
 * Итоговый счёт партии с разбивкой по слагаемым.
 * @param {Object} params
 * @param {number} params.score - очки за угаданные пары
 * @param {number} params.time - время партии в секундах
 * @param {number} params.count - число попыток
 * @param {boolean} [params.hintUsed=false] - использована ли подсказка
 * @param {string} [params.level] - ключ уровня (по умолчанию — очень лёгкий)
 * @returns {{pairsPoints: number, timeBonus: number, accuracyBonus: number, hintPenalty: number,
 *            multiplier: number, total: number}}
 * @example
 * calculateScore({score: 550, time: 120, count: 30, level: "medium"})
 * // → {pairsPoints: 550, timeBonus: 1800, accuracyBonus: 1250, hintPenalty: 0, multiplier: 1, total: 3600}
 */
export const calculateScore = ({score, time, count, hintUsed = false, level}) => {
    const {pairs, scoreMultiplier} = getLevel(level);
    const timeBonus = Math.max(0, TIME_BONUS_MAX - time * TIME_PENALTY_PER_SECOND);
    const misses = Math.max(0, count - pairs);
    const accuracyBonus = Math.max(0, ACCURACY_BONUS_MAX - misses * MISS_PENALTY);
    const hintPenalty = hintUsed ? HINT_PENALTY : 0;

    return {
        pairsPoints: score,
        timeBonus,
        accuracyBonus,
        hintPenalty,
        multiplier: scoreMultiplier,
        total: Math.max(0, Math.round((score + timeBonus + accuracyBonus - hintPenalty) * scoreMultiplier)),
    };
};

/** Максимум звёзд за партию. */
export const MAX_STARS = 3;

/**
 * Звёзды за выигранную партию: 1 — за победу, 2 и 3 — если итоговый счёт достиг порогов уровня.
 * @param {number} total - итоговый счёт (calculateScore(...).total)
 * @param {string} [level] - ключ уровня (по умолчанию — очень лёгкий)
 * @returns {number} 1, 2 или 3
 * @example
 * calculateStars(6000, "medium") // → 2 (порог 2 звёзд на среднем — 5000)
 */
export const calculateStars = (total, level) => {
    const [twoStars, threeStars] = getLevel(level).starScores;

    if (total >= threeStars) {
        return 3;
    }

    return total >= twoStars ? 2 : 1;
};
