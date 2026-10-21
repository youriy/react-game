import React from 'react';
import {useSelector} from "react-redux";
import useTranslation from "../core/useTranslation.js";
import StatusText from "./StatusText.jsx";

export default function Try() {
    const count = useSelector(state => state.game.count);
    const t = useTranslation();

    return (
        <StatusText>
            {t.try}: {count}
        </StatusText>
    );
}
