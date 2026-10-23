import React from 'react';
import {useDispatch, useSelector, useStore} from "react-redux";
import {formatTime} from "../core/utils.js";
import {setTime} from "../store/gameSlice.js";
import useTranslation from "../hooks/useTranslation.js";
import StatusText from "./StatusText.jsx";

/** Как часто сверять часы, мс. Только для перерисовки: само время считается по performance.now(). */
const TICK = 250;

/**
 * Время партии. Пока `running`, отсчитывает время по часам и записывает целые секунды в state.game.time.
 *
 * Время считается не по тикам интервала, а как накопленные миллисекунды плюс время с последнего старта
 * (performance.now()). Поэтому пауза не сбрасывает начатую секунду: частые пауза/продолжение не «замораживают»
 * время, а время в рекордах не теряет по секунде на каждую паузу. Интервал нужен только для перерисовки.
 * @param {Object} props
 * @param {boolean} [props.running=true] - идёт ли отсчёт (false во время показа карточек и на паузе)
 */
export default function Timer({running = true}) {
    const dispatch = useDispatch();
    const store = useStore();
    const time = useSelector(state => state.game.time);
    const t = useTranslation();
    // Миллисекунды, накопленные до последней паузы. Начальное значение — из стора, если таймер пересоздан посреди партии
    const elapsed = React.useRef(store.getState().game.time * 1000);

    React.useEffect(() => {
        if (!running) {
            return;
        }

        const startedAt = performance.now();
        const getElapsed = () => elapsed.current + performance.now() - startedAt;

        const interval = setInterval(() => {
            const seconds = Math.floor(getElapsed() / 1000);

            if (seconds !== store.getState().game.time) {
                dispatch(setTime(seconds));
            }
        }, TICK);

        // На паузе запоминаем точное время, включая начатую секунду
        return () => {
            clearInterval(interval);
            elapsed.current = getElapsed();
        };
    }, [running]);

    return (
        <StatusText>
            {t.time}: {formatTime(time)}
        </StatusText>
    );
}
