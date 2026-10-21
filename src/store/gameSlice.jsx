import {createSlice} from "@reduxjs/toolkit";
import {loadSetting} from "../core/storage.js";

const gameSlice = createSlice({
    name: "game",
    initialState: {
        count: 0,
        time: 0,
        gaming: false,
        win: false,
        clickable: true,
        language: loadSetting("language", "russian"),
        theme: loadSetting("theme", "indigoTheme")
    },
    reducers: {
        incrementTry(state) {
            state.count++;
        },
        incrementTime(state) {
            state.time++;
        },
        setGaming(state, action) {
            state.gaming = action.payload;
        },
        setWin(state, action) {
            state.win = action.payload;
        },
        setClickable(state, action) {
            state.clickable = action.payload;
        },
        resetGame(state) {
            state.count = 0;
            state.time = 0;
        },
        setLanguage(state, action) {
            state.language = action.payload;
        },
        setTheme(state, action) {
            state.theme = action.payload;
        }
    }
});

export default gameSlice.reducer
export const {incrementTry, incrementTime, setGaming, setWin, setClickable, resetGame, setLanguage, setTheme} = gameSlice.actions
