import React from 'react';
import {shallowEqual, useSelector} from "react-redux";
import useTranslation from "../hooks/useTranslation.js";
import StatusText from "./StatusText.jsx";

/**
 * Текущие очки партии. При серии из 2+ угаданных пар подряд показывает «🔥×N».
 */
export default function Score() {
    const {score, streak} = useSelector(state => ({score: state.game.score, streak: state.game.streak}), shallowEqual);
    const t = useTranslation();

    return (
        <StatusText>
            {t.score}: {score}
            {streak >= 2 && <span title={t.streak}> 🔥×{streak}</span>}
        </StatusText>
    );
}
