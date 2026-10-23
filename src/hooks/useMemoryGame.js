import React from 'react';
import {shallowEqual, useDispatch, useSelector, useStore} from "react-redux";
import {closePair, deletePair, setOpen} from "../store/itemsSlice.js";
import {incrementTry, registerPair, setClickable, takeHint} from "../store/gameSlice.js";
import {finishGame} from "../store/thunks.js";
import {getOpenIndexes, isBoardCleared, isPairMatch} from "../core/rules.js";
import {getLevel} from "../core/levels.js";
import {getMatchPoints} from "../core/score.js";
import {vibrate, VIBRATION} from "../core/vibration.js";
import {playSound} from "../core/sound.js";

/** Сколько открытая пара остаётся на экране перед удалением/закрытием, мс. */
const PAIR_DELAY = 800;
/** Сколько карточки показываются по подсказке, мс. */
export const HINT_TIME = 2000;

/**
 * Хук со всей игровой логикой одной партии.
 *
 * Как идёт партия:
 * 1. В начале все карточки открыты (`preview`) на время показа уровня (previewTime в core/levels.js),
 *    клики заблокированы.
 * 2. Игрок открывает карточки (`openItem`). Когда открыты две, засчитывается попытка,
 *    пара подсвечивается (`getHighlight`) и через PAIR_DELAY мс удаляется или закрывается.
 *    На телефоне угаданная и неугаданная пара отличаются вибрацией (core/vibration.js),
 *    если она не выключена кнопкой в шапке (state.game.vibration).
 *    Звуки (core/sound.js, выключаются кнопкой в шапке — state.game.sound): щелчок при перевороте карточки,
 *    две ноты вверх за угаданную пару (с каждой парой серии — выше), две ноты вниз за промах.
 *    Над последней открытой карточкой угаданной пары всплывают очки за неё (`getPopup`, PointsPopup.jsx).
 * 3. Раз за партию можно взять подсказку (`showHint`): все карточки открываются на HINT_TIME мс, со звуком.
 * 4. Когда убраны все карточки — звук и вибрация победы, thunk `finishGame` сохраняет результат и показывает победу.
 *
 * Хук читает из стора только нужные поля — время партии (меняется каждую секунду) он не читает,
 * поэтому игровое поле не перерисовывается на каждый тик таймера.
 *
 * Состояние показа и подсказки локальное, поэтому при новой партии компонент с этим хуком
 * пересоздаётся через `key={round}` (см. Game.jsx). Таймеры очищаются при размонтировании.
 *
 * @returns {{
 *   items: import("../store/itemsSlice.js").CardItem[],
 *   level: import("../core/levels.js").Level,
 *   preview: boolean,
 *   hinting: boolean,
 *   paused: boolean,
 *   canHint: boolean,
 *   showHint: function(): void,
 *   openItem: function(number): void,
 *   getHighlight: function(number): ('match'|'mismatch'|null),
 *   getPopup: function(number): ({points: number, streak: number}|null)
 * }}
 * - items — колода; level — настройки уровня партии; preview — идёт показ в начале;
 *   hinting — идёт подсказка; paused — пауза;
 * - canHint / showHint — доступна ли подсказка и как её взять;
 * - openItem(index) — открыть карточку (игнорируется, если сейчас нельзя); ссылка на функцию
 *   меняется, только когда меняется возможность кликать, — карточки (React.memo) не перерисовываются зря;
 * - getHighlight(index) — как подсветить карточку: угадана, не угадана или никак;
 * - getPopup(index) — очки, которые всплывают над карточкой (только у последней открытой карточки
 *   угаданной пары), иначе null. Объект один и тот же, пока пара на экране, — React.memo карточки не сбивается.
 */
export default function useMemoryGame() {
    const dispatch = useDispatch();
    // Для чтения серии сразу после registerPair и карточки при клике — без подписки
    const store = useStore();
    const items = useSelector(state => state.items.items);
    const {clickable, paused, hintUsed, roundLevel, vibration, sound} = useSelector(state => ({
        clickable: state.game.clickable,
        paused: state.game.paused,
        hintUsed: state.game.hintUsed,
        roundLevel: state.game.roundLevel,
        vibration: state.game.vibration,
        sound: state.game.sound,
    }), shallowEqual);
    const level = getLevel(roundLevel);

    const [preview, setPreview] = React.useState(true);
    // Подсветка последней открытой пары: {indexes: [i, j], match: true/false,
    //   popupIndex — над какой карточкой всплывают очки, popup — {points, streak} (только у угаданной)}
    const [pairResult, setPairResult] = React.useState(null);
    // Отложенное закрытие/удаление пары; сбрасывается, если партию прервали
    const pairTimeout = React.useRef(null);
    // Подсказка: все карточки открыты на HINT_TIME
    const [hinting, setHinting] = React.useState(false);
    const hintTimeout = React.useRef(null);
    // Последняя карточка, которую открыл игрок: над ней всплывают очки за пару
    const lastOpened = React.useRef(null);

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

    /**
     * Открывает карточку, если сейчас разрешено. Клик по уже открытой (или убранной) карточке ничего не делает:
     * без щелчка и без переноса lastOpened, чтобы очки за пару всплыли над нужной карточкой.
     * Звук щелчка играет прямо в обработчике клика — браузер включает звук только по действию игрока (см. core/sound.js).
     * Карточка читается из стора напрямую, а не из `items`: так ссылка на openItem не меняется при каждом ходе.
     * @param {number} index
     */
    const openItem = React.useCallback((index) => {
        const item = store.getState().items.items[index];

        if (canOpen && item && !item.open && !item.delete) {
            lastOpened.current = index;
            if (sound) {
                playSound("flip");
            }
            dispatch(setOpen(index));
        }
    }, [canOpen, sound, dispatch, store]);

    // Подсказка доступна раз за партию и не во время показа, паузы или проверки пары
    const canHint = !hintUsed && !preview && !hinting && !paused && clickable;

    /** Показывает все карточки на HINT_TIME мс и отмечает подсказку использованной. */
    const showHint = () => {
        if (!canHint) {
            return;
        }

        dispatch(takeHint());
        if (sound) {
            playSound("hint");
        }
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

        // dispatch синхронный: серия в сторе уже учитывает эту пару
        const {streak} = store.getState().game;
        setPairResult({
            indexes: openIndexes,
            match: isMatch,
            popupIndex: openIndexes.includes(lastOpened.current) ? lastOpened.current : openIndexes[1],
            popup: isMatch ? {points: getMatchPoints(streak), streak} : null,
        });
        if (vibration) {
            vibrate(isMatch ? VIBRATION.match : VIBRATION.mismatch);
        }
        if (sound) {
            playSound(isMatch ? "match" : "mismatch", streak);
        }

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
            if (vibration) {
                vibrate(VIBRATION.win);
            }
            if (sound) {
                playSound("win");
            }
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

    /**
     * Очки над карточкой.
     * @param {number} index - позиция карточки
     * @returns {{points: number, streak: number}|null}
     */
    const getPopup = (index) =>
        pairResult && pairResult.popup && pairResult.popupIndex === index ? pairResult.popup : null;

    return {items, level, preview, hinting, paused, canHint, showHint, openItem, getHighlight, getPopup};
}
