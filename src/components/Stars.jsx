import React from 'react';
import Rating from '@mui/material/Rating';
import {MAX_STARS} from "../core/score.js";

/**
 * Звёзды за партию или лучшие звёзды уровня (только просмотр).
 * @param {Object} props
 * @param {number} props.value - сколько звёзд закрашено, 0–3
 * @param {'small'|'medium'|'large'} [props.size='medium']
 */
export default function Stars({value, size = "medium"}) {
    return <Rating value={value} max={MAX_STARS} size={size} readOnly/>;
}
