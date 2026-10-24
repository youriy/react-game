import {createSlice} from "@reduxjs/toolkit";
import {shuffle} from "../core/utils.js";
import {DEFAULT_PICTURE_SET, getPictureSet} from "../icons/pictureSets.js";
import {DEFAULT_LEVEL, getLevel} from "../core/levels.js";

/**
 * Срез Redux с колодой карточек.
 * Состояние: `{items: CardItem[]}`; индекс в массиве = позиция карточки на поле.
 */

/**
 * @typedef {Object} CardItem
 * @property {number} id - уникальный идентификатор (используется как React key)
 * @property {number} type - номер пары; у двух одинаковых карточек он совпадает
 * @property {string} set - ключ набора картинок (icons/pictureSets.js), общий для всей колоды
 * @property {string} icon - имя картинки в наборе (у «Классики» — имя иконки из `cardIcons`, icons/icons.js)
 * @property {boolean} open - карточка сейчас открыта игроком
 * @property {boolean} delete - пара угадана, карточка убрана с поля
 * @property {boolean} seen - карточку уже открывали в этой партии (или её показала подсказка);
 *   показ в начале партии не считается. Нужно для достижений «Идеальная память» и «Везунчик»
 */

/**
 * Создаёт новую перемешанную колоду для уровня: берёт нужное число случайных картинок
 * из набора и кладёт по две карточки на каждую. Набор запоминается в карточках, поэтому смена
 * настройки не меняет уже разложенное поле.
 * @param {string} levelKey - ключ уровня из core/levels.js
 * @param {string} pictureSet - ключ набора картинок из icons/pictureSets.js
 * @returns {CardItem[]}
 */
const createDeck = (levelKey, pictureSet) => {
    const {pairs} = getLevel(levelKey);
    const set = getPictureSet(pictureSet);
    const icons = shuffle(set.pictures).slice(0, pairs);
    const deck = icons.flatMap((icon, index) => [0, 1].map(copy => ({
        id: index * 2 + copy,
        type: index + 1,
        set: set.id,
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
        items: createDeck(DEFAULT_LEVEL, DEFAULT_PICTURE_SET)
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
        /** Заменяет колоду новой перемешанной. payload: {level, pictureSet}, например {level: 'hard', pictureSet: 'sea'}. */
        resetItems(state, action) {
            state.items = createDeck(action.payload.level, action.payload.pictureSet);
        }
    }
});

export default itemsSlice.reducer
export const {setOpen, closePair, deletePair, markAllSeen, resetItems} = itemsSlice.actions
