import {createSlice} from "@reduxjs/toolkit";

const gameSlice = createSlice({
    name: "try",
    initialState: {
        count: 0,
        time: 0,
        gaming: false,
        win: false,
        clickable: true
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
        }
    }
});

export default gameSlice.reducer
export const {incrementTry, incrementTime, setGaming, setWin, setClickable, resetGame} = gameSlice.actions