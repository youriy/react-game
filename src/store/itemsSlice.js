import {createSlice} from "@reduxjs/toolkit";
import {shuffle} from "../core/utils.js";
import {cardIcons} from "../icons/icons.js";
import {DEFAULT_LEVEL, getLevel} from "../core/levels.js";

/**
 * Срез Redux с колодой карточек.
 * Состояние: `{items: CardItem[]}`; индекс в массиве = позиция карточки на поле.
 */

/**
 * @typedef {Object} CardItem
 * @property {number} id - уникальный идентификатор (используется как React key)
 * @property {number} type - номер пары; у двух одинаковых карточек он совпадает
 * @property {string} icon - имя иконки из `cardIcons` (icons/icons.js)
 * @property {boolean} open - карточка сейчас открыта игроком
 * @property {boolean} delete - пара угадана, карточка убрана с поля
 * @property {boolean} seen - карточку уже открывали в этой партии (или её показала подсказка);
 *   показ в начале партии не считается. Нужно для достижений «Идеальная память» и «Везунчик»
 */

/**
 * Создаёт новую перемешанную колоду для уровня: берёт нужное число случайных иконок
 * из `cardIcons` и кладёт по две карточки на каждую.
 * @param {string} levelKey - ключ уровня из core/levels.js
 * @returns {CardItem[]}
 */
const createDeck = (levelKey) => {
    const {pairs} = getLevel(levelKey);
    const icons = shuffle(Object.keys(cardIcons)).slice(0, pairs);
    const deck = icons.flatMap((icon, index) => [0, 1].map(copy => ({
        id: index * 2 + copy,
        type: index + 1,
        icon,
        open: false,
        delete: false,
        seen: false,
    })));

    return shuffle(deck);
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
                state.items[index].seen = true;
            });
        },
        /** Убирает угаданную пару с поля. payload: массив индексов карточек. */
        deletePair(state, action) {
            action.payload.forEach(index => {
                state.items[index].open = false;
                state.items[index].delete = true;
            });
        },
        /** Отмечает все карточки увиденными (подсказка показала поле). */
        markAllSeen(state) {
            state.items.forEach(item => {
                item.seen = true;
            });
        },
        /** Заменяет колоду новой перемешанной. payload: ключ уровня, например 'hard'. */
        resetItems(state, action) {
            state.items = createDeck(action.payload);
        }
    }
});

export default itemsSlice.reducer
export const {setOpen, closePair, deletePair, markAllSeen, resetItems} = itemsSlice.actions
