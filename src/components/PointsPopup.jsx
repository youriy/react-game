import React from 'react';
import Box from '@mui/material/Box';
import {keyframes} from '@emotion/react';

/** Сколько надпись с очками всплывает и тает, мс. */
const POPUP_TIME = 1100;

// Надпись поднимается над карточкой и тает. translateX(-50%) — центрирование по карточке
const floatUp = keyframes`
    0% {opacity: 0; transform: translate(-50%, 0) scale(0.8);}
    15% {opacity: 1; transform: translate(-50%, -8px) scale(1.1);}
    30% {transform: translate(-50%, -14px) scale(1);}
    70% {opacity: 1;}
    100% {opacity: 0; transform: translate(-50%, -44px) scale(1);}
`;

// При «уменьшить движение» — без подъёма: просто появляется и гаснет на месте
const fadeOnly = keyframes`
    0% {opacity: 0;} 15% {opacity: 1;} 70% {opacity: 1;} 100% {opacity: 0;}
`;

// Зелёная плашка с белым текстом — читается и поверх подсвеченной карточки, и в тёмной теме
const popupSx = {
    position: "absolute",
    left: "50%",
    top: 0,
    transform: "translateX(-50%)",
    zIndex: 2,
    pointerEvents: "none",
    whiteSpace: "nowrap",
    fontWeight: 700,
    fontSize: {xs: "0.95rem", sm: "1.3rem"},
    lineHeight: 1.4,
    px: {xs: 0.75, sm: 1.25},
    borderRadius: 999,
    bgcolor: "success.main",
    color: "success.contrastText",
    boxShadow: 3,
    opacity: 0,
    animation: `${floatUp} ${POPUP_TIME}ms ease-out forwards`,
    "@media (prefers-reduced-motion: reduce)": {
        animation: `${fadeOnly} ${POPUP_TIME}ms linear forwards`,
    },
};

/**
 * Всплывающие очки над угаданной парой: зелёная плашка «+150» и, если идёт серия, «🔥×2» (как в строке очков).
 * Анимация проигрывается один раз при появлении и заканчивается невидимой надписью,
 * поэтому компонент можно не убирать сразу. Клики проходят сквозь надпись.
 *
 * @param {Object} props
 * @param {number} props.points - очки за пару (core/score.js → getMatchPoints)
 * @param {number} props.streak - какая это пара подряд; при 2+ показывается серия
 */
export default function PointsPopup({points, streak}) {
    return (
        <Box sx={popupSx} aria-hidden="true">
            +{points}{streak >= 2 && ` 🔥×${streak}`}
        </Box>
    );
}
