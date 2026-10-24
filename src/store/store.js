import {combineReducers, configureStore} from "@reduxjs/toolkit";
import itemsSlice from "./itemsSlice.js";
import gameSlice, {setSystemDarkMode} from "./gameSlice.js";
import {loadSetting, saveSetting} from "../core/storage.js";
import {getSystemDarkQuery} from "../core/themes.js";

/**
 * Redux-хранилище приложения.
 * state.items — колода (itemsSlice.js), state.game — партия и настройки (gameSlice.js).
 * Язык, цвет, тёмная тема, вибрация, звук, уровень и рубашка карточек сохраняются в localStorage подпиской ниже.
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
const PERSISTED_SETTINGS = ["language", "theme", "darkMode", "vibration", "sound", "level", "cardBack"];

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

// Смена тёмной темы в системе на лету — пока игрок сам не переключал режим кнопкой в шапке.
// Такое изменение не сохраняется: savedSettings обновляется заранее, и подписка выше его не записывает.
const systemDarkQuery = getSystemDarkQuery();

if (systemDarkQuery) {
    const onSystemDarkChange = event => {
        if (loadSetting("darkMode", "")) {
            return;
        }

        savedSettings = {...savedSettings, darkMode: event.matches};
        store.dispatch(setSystemDarkMode(event.matches));
    };

    if (typeof systemDarkQuery.addEventListener === "function") {
        systemDarkQuery.addEventListener("change", onSystemDarkChange);
    } else {
        // Safari до 14
        systemDarkQuery.addListener(onSystemDarkChange);
    }
}
