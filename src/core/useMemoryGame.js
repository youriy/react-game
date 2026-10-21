import React from 'react';
import {useDispatch, useSelector} from "react-redux";
import {closePair, deletePair, setOpen} from "../store/itemsSlice.jsx";
import {incrementTry, setClickable, setGaming, setWin} from "../store/gameSlice.jsx";
import {saveResult} from "./storage.js";

// Сколько карточки показываются в начале игры
export const PREVIEW_TIME = 2000;
// Сколько открытая пара остаётся на экране перед удалением/закрытием
const PAIR_DELAY = 600;

// Вся игровая логика: показ карточек в начале, открытие, проверка пары, победа
export default function useMemoryGame() {
    const dispatch = useDispatch();
    const items = useSelector(state => state.items.items);
    const game = useSelector(state => state.game);
    const [preview, setPreview] = React.useState(true);

    React.useEffect(() => {
        const timeout = setTimeout(() => setPreview(false), PREVIEW_TIME);

        return () => clearTimeout(timeout);
    }, []);

    const openItem = (index) => {
        if (game.clickable && !preview) {
            dispatch(setOpen(index));
        }
    };

    React.useEffect(() => {
        const openIndexes = items
            .map((item, index) => (item.open ? index : -1))
            .filter(index => index !== -1);

        if (openIndexes.length === 2) {
            const [first, second] = openIndexes;
            const isMatch = items[first].type === items[second].type;

            dispatch(setClickable(false));
            dispatch(incrementTry());

            setTimeout(() => {
                dispatch(isMatch ? deletePair(openIndexes) : closePair(openIndexes));
                dispatch(setClickable(true));
            }, PAIR_DELAY);
        }

        if (items.every(item => item.delete)) {
            saveResult(game);
            dispatch(setGaming(false));
            dispatch(setWin(true));
        }
    }, [items]);

    return {items, preview, openItem};
}
