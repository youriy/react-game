import {combineReducers, configureStore} from "@reduxjs/toolkit";
import itemsSlice from "./itemsSlice.js";
import gameSlice from "./gameSlice.js";
import {saveSetting} from "../core/storage.js";

/**
 * Redux-хранилище приложения.
 * state.items — колода (itemsSlice.js), state.game — партия и настройки (gameSlice.js).
 * Язык, тема и уровень сохраняются в localStorage подпиской ниже.
 */
const rootReducer = combineReducers({
    items: itemsSlice,
    game: gameSlice,
});

export const store = configureStore({
    reducer: rootReducer,
});

// Настройки, которые сохраняются в localStorage при изменении
// (побочные эффекты не должны выполняться внутри редьюсеров)
const PERSISTED_SETTINGS = ["language", "theme", "level"];

let savedSettings = {...store.getState().game};

store.subscribe(() => {
    const game = store.getState().game;

    PERSISTED_SETTINGS.forEach(key => {
        if (game[key] !== savedSettings[key]) {
            saveSetting(key, game[key]);
        }
    });

    savedSettings = game;
});
