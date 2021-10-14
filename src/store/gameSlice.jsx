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
        setNull(state) {
            state.count = 0;
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
        }
    }
});

export default gameSlice.reducer
export const {incrementTry, setNull, incrementTime, setGaming, setWin, setClickable} = gameSlice.actions