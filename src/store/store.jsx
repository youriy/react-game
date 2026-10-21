import {combineReducers, configureStore} from "@reduxjs/toolkit";
import itemsSlice from "./itemsSlice.jsx";
import gameSlice from "./gameSlice.jsx";
import {saveSetting} from "../core/storage.js";

const rootReducer = combineReducers({
    items: itemsSlice,
    game: gameSlice,
});

export const store = configureStore({
    reducer: rootReducer,
});

// Сохраняем язык и тему в localStorage при их изменении
// (побочные эффекты не должны выполняться внутри редьюсеров)
let {language, theme} = store.getState().game;

store.subscribe(() => {
    const game = store.getState().game;

    if (game.language !== language) {
        language = game.language;
        saveSetting("language", language);
    }

    if (game.theme !== theme) {
        theme = game.theme;
        saveSetting("theme", theme);
    }
});
