/**
 * Составные действия (Redux thunk): несколько шагов, которые всегда выполняются вместе,
 * и действия с побочными эффектами (сохранение результата в localStorage).
 * Thunk-middleware уже включён в configureStore (store.js).
 */
import {resetItems} from "./itemsSlice.js";
import {setGaming, setLevel, setNewAchievements, setNewRecords, setNewUnlocks, setWin, startNewRound} from "./gameSlice.js";
import {getRecords, saveResult} from "../core/storage.js";
import {getLevel} from "../core/levels.js";
import {evaluateGame, getAchievementTiers, getImproved} from "../core/achievements.js";
import {getLastUnlockedLevel, getUnlockedLevels, isLevelUnlocked} from "../core/progress.js";

/** Какие показатели участвуют в рекордах. */
const RECORD_KEYS = ["score", "time", "streak"];

/**
 * Начинает новую партию на выбранном уровне: свежая перемешанная колода + обнулённые счётчики.
 * Используется кнопками «Начать игру» и «Заново».
 * Если выбранный уровень закрыт (например, сохранён в настройках раньше), партия идёт на самом сложном из открытых.
 */
export const startNewGame = () => (dispatch, getState) => {
    if (!isLevelUnlocked(getState().game.level)) {
        dispatch(setLevel(getLastUnlockedLevel()));
    }

    dispatch(resetItems(getState().game.level));
    dispatch(startNewRound());
};

/**
 * Завершает выигранную партию: сохраняет результат, определяет побитые рекорды уровня,
 * открытые этой победой уровни и полученные достижения (core/achievements.js), показывает экран победы.
 * Рекорд считается новым, только если на этом уровне уже были результаты и он улучшен.
 */
export const finishGame = () => (dispatch, getState) => {
    const game = getState().game;
    const level = game.roundLevel;

    const previous = getRecords(level);
    const unlockedBefore = getUnlockedLevels();
    const achievementsBefore = getAchievementTiers();
    saveResult({...game, level});
    evaluateGame({
        level,
        time: game.time,
        misses: Math.max(0, game.count - getLevel(level).pairs),
        seenMisses: game.seenMisses,
        luckyPairs: game.luckyPairs,
        bestStreak: game.bestStreak,
        hintUsed: game.hintUsed,
        hour: new Date().getHours(),
    });
    const current = getRecords(level);

    dispatch(setNewRecords(RECORD_KEYS.filter(key => previous[key] !== undefined && current[key] !== previous[key])));
    dispatch(setNewUnlocks(getUnlockedLevels().filter(key => !unlockedBefore.includes(key))));
    dispatch(setNewAchievements(getImproved(achievementsBefore, getAchievementTiers())));
    dispatch(setGaming(false));
    dispatch(setWin(true));
};
