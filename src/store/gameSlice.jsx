import {createSlice} from "@reduxjs/toolkit";

const gameSlice = createSlice({
    name: "try",
    initialState: {
        count: 0,
        time: 0,
        gaming: false,
        win: false,
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
    }
});

export default gameSlice.reducer
export const {incrementTry, setNull, incrementTime, setGaming, setWin} = gameSlice.actions