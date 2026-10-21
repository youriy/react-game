import {createSlice} from "@reduxjs/toolkit";
import Helper from "../core/Helper.jsx";
import {cardIcons} from "../core/icons.js";

/**
 * Срез Redux с колодой карточек.
 * Состояние: `{items: CardItem[]}`; индекс в массиве = позиция карточки на поле.
 */

/**
 * @typedef {Object} CardItem
 * @property {number} id - уникальный идентификатор (используется как React key)
 * @property {number} type - номер пары; у двух одинаковых карточек он совпадает
 * @property {string} icon - имя иконки из `cardIcons` (core/icons.js)
 * @property {boolean} open - карточка сейчас открыта игроком
 * @property {boolean} delete - пара угадана, карточка убрана с поля
 */

/**
 * Создаёт новую перемешанную колоду: по две карточки на каждую иконку из `cardIcons`.
 * @returns {CardItem[]}
 */
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
        /** Открывает карточку. payload: индекс карточки. */
        setOpen(state, action) {
            state.items[action.payload].open = true;
        },
        /** Закрывает неугаданную пару. payload: массив индексов карточек. */
        closePair(state, action) {
            action.payload.forEach(index => {
                state.items[index].open = false;
            });
        },
        /** Убирает угаданную пару с поля. payload: массив индексов карточек. */
        deletePair(state, action) {
            action.payload.forEach(index => {
                state.items[index].open = false;
                state.items[index].delete = true;
            });
        },
        /** Заменяет колоду новой перемешанной. */
        resetItems(state) {
            state.items = createDeck();
        }
    }
});

export default itemsSlice.reducer
export const {setOpen, closePair, deletePair, resetItems} = itemsSlice.actions
