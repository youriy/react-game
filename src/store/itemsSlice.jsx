import {createSlice} from "@reduxjs/toolkit";
import Helper from "../core/Helper.jsx";
import {cardIcons} from "../core/icons.js";
import {DEFAULT_LEVEL, getLevel} from "../core/levels.js";

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
 * Создаёт новую перемешанную колоду для уровня: берёт нужное число случайных иконок
 * из `cardIcons` и кладёт по две карточки на каждую.
 * @param {string} levelKey - ключ уровня из core/levels.js
 * @returns {CardItem[]}
 */
const createDeck = (levelKey) => {
    const {pairs} = getLevel(levelKey);
    const icons = Helper.shuffle(Object.keys(cardIcons)).slice(0, pairs);
    const deck = icons.flatMap((icon, index) => [0, 1].map(copy => ({
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
        items: createDeck(DEFAULT_LEVEL)
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
        /** Заменяет колоду новой перемешанной. payload: ключ уровня, например 'hard'. */
        resetItems(state, action) {
            state.items = createDeck(action.payload);
        }
    }
});

export default itemsSlice.reducer
export const {setOpen, closePair, deletePair, resetItems} = itemsSlice.actions
