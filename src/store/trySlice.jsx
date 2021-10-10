import {createSlice} from "@reduxjs/toolkit";

const trySlice = createSlice({
    name: "try",
    initialState: {
        count: 0,
    },
    reducers: {
        increment(state) {
            state.count++;
        },
        setNull(state) {
            state.count = 0;
        }
    }
});

export default trySlice.reducer
export const {increment, setNull} = trySlice.actions