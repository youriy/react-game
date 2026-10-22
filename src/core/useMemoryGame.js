import React from 'react';
import {shallowEqual, useDispatch, useSelector} from "react-redux";
import {closePair, deletePair, setOpen} from "../store/itemsSlice.js";
import {incrementTry, registerPair, setClickable, takeHint} from "../store/gameSlice.js";
import {finishGame} from "../store/thunks.js";
import {getOpenIndexes, isBoardCleared, isPairMatch} from "./rules.js";
import {getLevel} from "./levels.js";

/** Сколько открытая пара остаётся на экране перед удалением/закрытием, мс. */
const PAIR_DELAY = 800;
/** Сколько карточки показываются по подсказке, мс. */
export const HINT_TIME = 1000;

/**
 * Хук со всей игровой логикой одной партии.
 *
 * Как идёт партия:
 * 1. В начале все карточки открыты (`preview`) на время показа уровня (previewTime в core/levels.js),
 *    клики заблокированы.
 * 2. Игрок открывает карточки (`openItem`). Когда открыты две, засчитывается попытка,
 *    пара подсвечивается (`getHighlight`) и через PAIR_DELAY мс удаляется или закрывается.
 * 3. Раз за партию можно взять подсказку (`showHint`): все карточки открываются на HINT_TIME мс.
 * 4. Когда убраны все карточки — thunk `finishGame` сохраняет результат и показывает победу.
 *
 * Хук читает из стора только нужные поля — время партии (меняется каждую секунду) он не читает,
 * поэтому игровое поле не перерисовывается на каждый тик таймера.
 *
 * Состояние показа и подсказки локальное, поэтому при новой партии компонент с этим хуком
 * пересоздаётся через `key={round}` (см. Game.jsx). Таймеры очищаются при размонтировании.
 *
 * @returns {{
 *   items: import("../store/itemsSlice.js").CardItem[],
 *   level: import("./levels.js").Level,
 *   preview: boolean,
 *   hinting: boolean,
 *   paused: boolean,
 *   canHint: boolean,
 *   showHint: function(): void,
 *   openItem: function(number): void,
 *   getHighlight: function(number): ('match'|'mismatch'|null)
 * }}
 * - items — колода; level — настройки уровня партии; preview — идёт показ в начале;
 *   hinting — идёт подсказка; paused — пауза;
 * - canHint / showHint — доступна ли подсказка и как её взять;
 * - openItem(index) — открыть карточку (игнорируется, если сейчас нельзя); ссылка на функцию
 *   меняется, только когда меняется возможность кликать, — карточки (React.memo) не перерисовываются зря;
 * - getHighlight(index) — как подсветить карточку: угадана, не угадана или никак.
 */
export default function useMemoryGame() {
    const dispatch = useDispatch();
    const items = useSelector(state => state.items.items);
    const {clickable, paused, hintUsed, roundLevel} = useSelector(state => ({
        clickable: state.game.clickable,
        paused: state.game.paused,
        hintUsed: state.game.hintUsed,
        roundLevel: state.game.roundLevel,
    }), shallowEqual);
    const level = getLevel(roundLevel);

    const [preview, setPreview] = React.useState(true);
    // Подсветка последней открытой пары: {indexes: [i, j], match: true/false}
    const [pairResult, setPairResult] = React.useState(null);
    // Отложенное закрытие/удаление пары; сбрасывается, если партию прервали
    const pairTimeout = React.useRef(null);
    // Подсказка: все карточки открыты на HINT_TIME
    const [hinting, setHinting] = React.useState(false);
    const hintTimeout = React.useRef(null);

    // Показ карточек в начале партии; при размонтировании — очистка всех таймеров
    React.useEffect(() => {
        const timeout = setTimeout(() => setPreview(false), level.previewTime);

        return () => {
            clearTimeout(timeout);
            clearTimeout(pairTimeout.current);
            clearTimeout(hintTimeout.current);
        };
    }, []);

    const canOpen = clickable && !preview && !hinting && !paused;

    /** Открывает карточку, если сейчас разрешено. @param {number} index */
    const openItem = React.useCallback((index) => {
        if (canOpen) {
            dispatch(setOpen(index));
        }
    }, [canOpen, dispatch]);

    // Подсказка доступна раз за партию и не во время показа, паузы или проверки пары
    const canHint = !hintUsed && !preview && !hinting && !paused && clickable;

    /** Показывает все карточки на HINT_TIME мс и отмечает подсказку использованной. */
    const showHint = () => {
        if (!canHint) {
            return;
        }

        dispatch(takeHint());
        setHinting(true);
        hintTimeout.current = setTimeout(() => setHinting(false), HINT_TIME);
    };

    // Открыты две карточки — засчитываем попытку, подсвечиваем и через PAIR_DELAY убираем или закрываем
    React.useEffect(() => {
        const openIndexes = getOpenIndexes(items);

        if (openIndexes.length !== 2) {
            return;
        }

        const isMatch = isPairMatch(items, openIndexes);

        dispatch(setClickable(false));
        dispatch(incrementTry());
        dispatch(registerPair(isMatch));
        setPairResult({indexes: openIndexes, match: isMatch});

        pairTimeout.current = setTimeout(() => {
            // Неугаданная пара гаснет и переворачивается обратно, угаданная исчезает, оставаясь зелёной
            if (!isMatch) {
                setPairResult(null);
            }

            dispatch(isMatch ? deletePair(openIndexes) : closePair(openIndexes));
            dispatch(setClickable(true));
        }, PAIR_DELAY);
    }, [items, dispatch]);

    // Все пары убраны — победа
    React.useEffect(() => {
        if (isBoardCleared(items)) {
            dispatch(finishGame());
        }
    }, [items, dispatch]);

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

    return {items, level, preview, hinting, paused, canHint, showHint, openItem, getHighlight};
}
