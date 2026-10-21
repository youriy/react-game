import {createSlice} from "@reduxjs/toolkit";
import Helper from "../core/Helper.jsx";
import {cardIcons} from "../core/icons.js";

// Создаёт перемешанную колоду: по две карточки на каждую иконку
const createDeck = () => {
    const deck = Object.keys(cardIcons).flatMap((icon, index) => [0, 1].map(copy => ({
        id: index * 2 + copy,
        type: index + 1,
        icon,
        open: false,
        delete: false,
    })));

    return Helper.shuffle(deck);
};

const itemsSlice = createSlice({
    name: "items",
    initialState: {
        items: createDeck()
    },
    reducers: {
        setOpen(state, action) {
            state.items[action.payload].open = true;
        },
        closePair(state, action) {
            action.payload.forEach(index => {
                state.items[index].open = false;
            });
        },
        deletePair(state, action) {
            action.payload.forEach(index => {
                state.items[index].open = false;
                state.items[index].delete = true;
            });
        },
        resetItems(state) {
            state.items = createDeck();
        }
    }
});

export default itemsSlice.reducer
export const {setOpen, closePair, deletePair, resetItems} = itemsSlice.actions
