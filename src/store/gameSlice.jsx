import {createSlice} from "@reduxjs/toolkit";

const gameSlice = createSlice({
    name: "try",
    initialState: {
        count: 0,
        time: null,
        gaming: false,
        win: false,
    },
    reducers: {
        increment(state) {
            state.count++;
        },
        setNull(state) {
            state.count = 0;
        },
        setTime(state, action) {
            state.time = action.payload;
        },
        setGaming(state, action) {
            state.gaming = action.payload;
        },
        setWin(state, action) {
            state.win = action.payload;
        }
    }
});

export default gameSlice.reducer
export const {increment, setNull, setTime, setGaming, setWin} = gameSlice.actions