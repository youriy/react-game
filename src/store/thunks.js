/**
 * Составные действия (Redux thunk): несколько шагов, которые всегда выполняются вместе,
 * и действия с побочными эффектами (сохранение результата в localStorage).
 * Thunk-middleware уже включён в configureStore (store.js).
 */
import {resetItems} from "./itemsSlice.js";
import {setGaming, setNewRecords, setWin, startNewRound} from "./gameSlice.js";
import {getRecords, saveResult} from "../core/storage.js";

/** Какие показатели участвуют в рекордах. */
const RECORD_KEYS = ["score", "time", "streak"];

/**
 * Начинает новую партию на выбранном уровне: свежая перемешанная колода + обнулённые счётчики.
 * Используется кнопками «Начать игру» и «Заново».
 */
export const startNewGame = () => (dispatch, getState) => {
    dispatch(resetItems(getState().game.level));
    dispatch(startNewRound());
};

/**
 * Завершает выигранную партию: сохраняет результат, определяет побитые рекорды уровня
 * и показывает экран победы.
 * Рекорд считается новым, только если на этом уровне уже были результаты и он улучшен.
 */
export const finishGame = () => (dispatch, getState) => {
    const game = getState().game;
    const level = game.roundLevel;

    const previous = getRecords(level);
    saveResult({...game, level});
    const current = getRecords(level);

    dispatch(setNewRecords(RECORD_KEYS.filter(key => previous[key] !== undefined && current[key] !== previous[key])));
    dispatch(setGaming(false));
    dispatch(setWin(true));
};
