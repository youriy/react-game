import {createSlice} from "@reduxjs/toolkit";
import {loadSetting} from "../core/storage.js";
import {getMatchPoints} from "../core/score.js";
import {DEFAULT_LEVEL} from "../core/levels.js";

/**
 * Срез Redux с состоянием партии и настройками интерфейса.
 *
 * @typedef {Object} GameState
 * @property {number} count - число попыток (открытых пар) в текущей партии
 * @property {number} time - прошедшее время партии, в секундах
 * @property {number} score - очки за угаданные пары (без итоговых бонусов, см. core/score.js)
 * @property {number} streak - текущая серия угаданных пар подряд
 * @property {number} bestStreak - лучшая серия в текущей партии
 * @property {number} round - номер партии; используется как key у GameArea, чтобы поле пересоздавалось
 * @property {boolean} gaming - идёт партия (true) или показан стартовый экран (false)
 * @property {boolean} paused - партия на паузе
 * @property {boolean} hintUsed - подсказка в этой партии уже использована
 * @property {Array<'score'|'time'|'streak'>} newRecords - какие рекорды побиты в последней партии
 * @property {boolean} win - последняя партия завершилась победой (показывается экран победы)
 * @property {boolean} clickable - можно ли сейчас открывать карточки (false, пока решается пара)
 * @property {string} language - ключ языка из core/Language.js (сохраняется в localStorage)
 * @property {string} theme - имя темы из core/themes.js (сохраняется в localStorage)
 * @property {string} level - выбранный уровень сложности из core/levels.js (сохраняется в localStorage)
 * @property {string} roundLevel - уровень текущей/последней партии; фиксируется при старте,
 *   чтобы переключение уровня на стартовом экране не меняло результаты уже сыгранной партии
 */
const gameSlice = createSlice({
    name: "game",
    initialState: {
        count: 0,
        time: 0,
        score: 0,
        streak: 0,
        bestStreak: 0,
        // Номер партии: меняется при каждом старте, чтобы игровое поле создавалось заново
        round: 0,
        gaming: false,
        paused: false,
        hintUsed: false,
        // Какие рекорды побиты в последней партии: 'score' | 'time' | 'streak'
        newRecords: [],
        win: false,
        clickable: true,
        language: loadSetting("language", "russian"),
        theme: loadSetting("theme", "indigoTheme"),
        level: loadSetting("level", DEFAULT_LEVEL),
        roundLevel: DEFAULT_LEVEL
    },
    reducers: {
        /** Увеличивает число попыток на 1. */
        incrementTry(state) {
            state.count++;
        },
        /**
         * Учитывает результат открытой пары: очки и серию.
         * payload: true — пара угадана (серия растёт, начисляются очки), false — промах (серия обнуляется).
         */
        registerPair(state, action) {
            if (action.payload) {
                state.streak++;
                state.score += getMatchPoints(state.streak);
                state.bestStreak = Math.max(state.bestStreak, state.streak);
            } else {
                state.streak = 0;
            }
        },
        /** Увеличивает время партии на 1 секунду (вызывается таймером). */
        incrementTime(state) {
            state.time++;
        },
        /** payload: true — показать игровое поле, false — стартовый экран. */
        setGaming(state, action) {
            state.gaming = action.payload;
        },
        /** payload: true — партия выиграна. */
        setWin(state, action) {
            state.win = action.payload;
        },
        /** payload: можно ли открывать карточки. */
        setClickable(state, action) {
            state.clickable = action.payload;
        },
        /**
         * Начинает новую партию с нуля на выбранном уровне: обнуляет счётчики, снимает паузу
         * и подсказку, увеличивает `round`. Колоду нужно перемешать отдельно (`resetItems(level)`).
         */
        startNewRound(state) {
            state.roundLevel = state.level;
            state.count = 0;
            state.time = 0;
            state.score = 0;
            state.streak = 0;
            state.bestStreak = 0;
            state.clickable = true;
            state.win = false;
            state.paused = false;
            state.hintUsed = false;
            state.newRecords = [];
            state.gaming = true;
            state.round++;
        },
        /** Выход из партии без победы и без сохранения результата. */
        giveUp(state) {
            state.gaming = false;
            state.paused = false;
            state.win = false;
        },
        /** payload: список побитых рекордов, например ['score', 'time']. */
        setNewRecords(state, action) {
            state.newRecords = action.payload;
        },
        /** Отмечает, что подсказка в этой партии использована. */
        takeHint(state) {
            state.hintUsed = true;
        },
        /** payload: true — поставить на паузу, false — продолжить. */
        setPaused(state, action) {
            state.paused = action.payload;
        },
        /** payload: ключ языка, например 'english'. Сохраняется в localStorage (см. store.jsx). */
        setLanguage(state, action) {
            state.language = action.payload;
        },
        /** payload: имя темы, например 'greenTheme'. Сохраняется в localStorage (см. store.jsx). */
        setTheme(state, action) {
            state.theme = action.payload;
        },
        /** payload: ключ уровня, например 'hard'. Сохраняется в localStorage (см. store.jsx). */
        setLevel(state, action) {
            state.level = action.payload;
        }
    }
});

export default gameSlice.reducer
export const {incrementTry, registerPair, incrementTime, setGaming, setWin, setClickable, startNewRound, giveUp, setNewRecords, takeHint, setPaused, setLanguage, setTheme, setLevel} = gameSlice.actions
