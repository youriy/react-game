import {combineReducers, configureStore } from "@reduxjs/toolkit";
import itemsSlice from "./itemsSlice.jsx";
import trySlice from "./trySlice.jsx"

const rootReducer = combineReducers({
    items: itemsSlice,
    try: trySlice,
});

export const store = configureStore({
    reducer: rootReducer,

});