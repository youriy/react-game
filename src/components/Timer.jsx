import React from 'react';
import {useDispatch, useSelector} from "react-redux";
import {formatTime} from "../core/utils.js";
import {incrementTime} from "../store/gameSlice.js";
import useTranslation from "../core/useTranslation.js";
import StatusText from "./StatusText.jsx";

/**
 * Время партии. Пока `running`, каждую секунду увеличивает state.game.time.
 * @param {Object} props
 * @param {boolean} [props.running=true] - идёт ли отсчёт (false во время показа карточек и на паузе)
 */
export default function Timer({running = true}) {
    const dispatch = useDispatch();
    const time = useSelector(state => state.game.time);
    const t = useTranslation();

    React.useEffect(() => {
        if (!running) {
            return;
        }

        const interval = setInterval(() => {
            dispatch(incrementTime());
        }, 1000);

        return () => clearInterval(interval);
    }, [running]);

    return (
        <StatusText>
            {t.time}: {formatTime(time)}
        </StatusText>
    );
}
