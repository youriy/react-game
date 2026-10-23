/**
 * Составные действия (Redux thunk): несколько шагов, которые всегда выполняются вместе,
 * и действия с побочными эффектами (сохранение результата в localStorage).
 * Thunk-middleware уже включён в configureStore (store.js).
 */
import {resetItems} from "./itemsSlice.js";
import {giveUp, setGaming, setLevel, setNewAchievements, setNewRecords, setNewUnlocks, setWin, startNewRound} from "./gameSlice.js";
import {addPairsFound, getRecords, saveResult} from "../core/storage.js";
import {getLevel} from "../core/levels.js";
import {evaluateGame, getAchievementTiers, getImproved} from "../core/achievements.js";
import {getLastUnlockedLevel, getUnlockedLevels, isLevelUnlocked} from "../core/progress.js";

/** Какие показатели участвуют в рекордах. */
const RECORD_KEYS = ["score", "time", "streak"];

/**
 * Засчитывает «Коллекционеру» пары, найденные в прерванной партии («Заново», «Сдаться»).
 * Убранные с поля карточки — найденные пары, по две карточки на пару.
 * @param {function} getState
 */
const countAbandonedPairs = (getState) => {
    if (getState().game.gaming) {
        addPairsFound(getState().items.items.filter(item => item.delete).length / 2);
    }
};

/**
 * Начинает новую партию на выбранном уровне: свежая перемешанная колода + обнулённые счётчики.
 * Используется кнопками «Начать игру» и «Заново».
 * Если выбранный уровень закрыт (например, сохранён в настройках раньше), партия идёт на самом сложном из открытых.
 * Если партия уже шла («Заново»), найденные в ней пары засчитываются «Коллекционеру».
 */
export const startNewGame = () => (dispatch, getState) => {
    countAbandonedPairs(getState);

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
    addPairsFound(getLevel(level).pairs);
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

/**
 * «Сдаться»: выйти из партии без победы и без сохранения результата. Найденные пары засчитываются «Коллекционеру».
 */
export const giveUpGame = () => (dispatch, getState) => {
    countAbandonedPairs(getState);
    dispatch(giveUp());
};
