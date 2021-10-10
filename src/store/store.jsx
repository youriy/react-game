import {combineReducers, configureStore } from "@reduxjs/toolkit";
import itemsSlice from "./itemsSlice.jsx";
import gameSlice from "./gameSlice.jsx"

const rootReducer = combineReducers({
    items: itemsSlice,
    game: gameSlice,
});

export const store = configureStore({
    reducer: rootReducer,
});