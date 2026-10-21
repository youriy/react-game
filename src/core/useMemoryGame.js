import React from 'react';
import {useDispatch, useSelector} from "react-redux";
import {closePair, deletePair, setOpen} from "../store/itemsSlice.jsx";
import {incrementTry, registerPair, setClickable, setGaming, setNewRecords, setWin, takeHint} from "../store/gameSlice.jsx";
import {getRecords, saveResult} from "./storage.js";

/** Сколько карточки показываются в начале партии, мс. */
export const PREVIEW_TIME = 2000;
/** Сколько открытая пара остаётся на экране перед удалением/закрытием, мс. */
const PAIR_DELAY = 800;
/** Сколько карточки показываются по подсказке, мс. */
export const HINT_TIME = 1000;

/**
 * Хук со всей игровой логикой одной партии.
 *
 * Как идёт партия:
 * 1. Первые PREVIEW_TIME мс все карточки открыты (`preview`), клики заблокированы.
 * 2. Игрок открывает карточки (`openItem`). Когда открыты две, засчитывается попытка,
 *    пара подсвечивается (`getHighlight`) и через PAIR_DELAY мс удаляется или закрывается.
 * 3. Раз за партию можно взять подсказку (`showHint`): все карточки открываются на HINT_TIME мс.
 * 4. Когда убраны все карточки — результат сохраняется, определяются новые рекорды, показывается победа.
 *
 * Состояние показа и подсказки локальное, поэтому при новой партии компонент с этим хуком
 * пересоздаётся через `key={round}` (см. Game.jsx). Таймеры очищаются при размонтировании.
 *
 * @returns {{
 *   items: import("../store/itemsSlice.jsx").CardItem[],
 *   preview: boolean,
 *   hinting: boolean,
 *   paused: boolean,
 *   canHint: boolean,
 *   showHint: function(): void,
 *   openItem: function(number): void,
 *   getHighlight: function(number): ('match'|'mismatch'|null)
 * }}
 * - items — колода; preview — идёт показ в начале; hinting — идёт подсказка; paused — пауза;
 * - canHint / showHint — доступна ли подсказка и как её взять;
 * - openItem(index) — открыть карточку (игнорируется, если сейчас нельзя);
 * - getHighlight(index) — как подсветить карточку: угадана, не угадана или никак.
 */
export default function useMemoryGame() {
    const dispatch = useDispatch();
    const items = useSelector(state => state.items.items);
    const game = useSelector(state => state.game);
    const [preview, setPreview] = React.useState(true);
    // Подсветка последней открытой пары: {indexes: [i, j], match: true/false}
    const [pairResult, setPairResult] = React.useState(null);
    // Отложенное закрытие/удаление пары; сбрасывается, если партию прервали
    const pairTimeout = React.useRef(null);
    // Подсказка: все карточки открыты на HINT_TIME
    const [hinting, setHinting] = React.useState(false);
    const hintTimeout = React.useRef(null);

    React.useEffect(() => {
        const timeout = setTimeout(() => setPreview(false), PREVIEW_TIME);

        return () => {
            clearTimeout(timeout);
            clearTimeout(pairTimeout.current);
            clearTimeout(hintTimeout.current);
        };
    }, []);

    /** Открывает карточку, если сейчас разрешено. @param {number} index */
    const openItem = (index) => {
        if (game.clickable && !preview && !hinting && !game.paused) {
            dispatch(setOpen(index));
        }
    };

    // Подсказка доступна раз за партию и не во время показа, паузы или проверки пары
    const canHint = !game.hintUsed && !preview && !hinting && !game.paused && game.clickable;

    /** Показывает все карточки на HINT_TIME мс и отмечает подсказку использованной. */
    const showHint = () => {
        if (!canHint) {
            return;
        }

        dispatch(takeHint());
        setHinting(true);
        hintTimeout.current = setTimeout(() => setHinting(false), HINT_TIME);
    };

    // Реакция на любое изменение колоды: проверка открытой пары и победы
    React.useEffect(() => {
        const openIndexes = items
            .map((item, index) => (item.open ? index : -1))
            .filter(index => index !== -1);

        if (openIndexes.length === 2) {
            const [first, second] = openIndexes;
            const isMatch = items[first].type === items[second].type;

            dispatch(setClickable(false));
            dispatch(incrementTry());
            dispatch(registerPair(isMatch));
            setPairResult({indexes: openIndexes, match: isMatch});

            pairTimeout.current = setTimeout(() => {
                // Неугаданная пара гаснет и переворачивается обратно,
                // угаданная исчезает, оставаясь зелёной
                if (!isMatch) {
                    setPairResult(null);
                }

                dispatch(isMatch ? deletePair(openIndexes) : closePair(openIndexes));
                dispatch(setClickable(true));
            }, PAIR_DELAY);
        }

        if (items.every(item => item.delete)) {
            // Рекорд считается новым, только если до этого уже были результаты и он улучшен
            const previous = getRecords();
            saveResult(game);
            const current = getRecords();
            const newRecords = ["score", "time", "streak"]
                .filter(key => previous[key] !== undefined && current[key] !== previous[key]);

            dispatch(setNewRecords(newRecords));
            dispatch(setGaming(false));
            dispatch(setWin(true));
        }
    }, [items]);

    /**
     * Как подсветить карточку.
     * @param {number} index - позиция карточки
     * @returns {'match'|'mismatch'|null}
     */
    const getHighlight = (index) => {
        if (!pairResult || !pairResult.indexes.includes(index)) {
            return null;
        }

        return pairResult.match ? "match" : "mismatch";
    };

    return {items, preview, hinting, paused: game.paused, canHint, showHint, openItem, getHighlight};
}
