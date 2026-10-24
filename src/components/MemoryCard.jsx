import React from 'react';
import {useSelector} from "react-redux";
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Zoom from '@mui/material/Zoom';
import {alpha} from '@mui/material/styles';
import {keyframes} from '@emotion/react';
import CardPicture from "./CardPicture.jsx";
import {HOVER_MEDIA, PRESS_MS, PRESS_SCALE, TOUCH_MEDIA} from "../core/themes.js";
import {PAIR_SOUND_DELAY} from "../core/sound.js";
import {getCardBackStyle} from "../core/cardBacks.js";
import PointsPopup from "./PointsPopup.jsx";

/** Длительность переворота карточки, мс. */
const FLIP_TIME = 400;
/**
 * Через сколько после открытия второй карточки начинаются встряска / вспышка пары, мс:
 * когда лицо карточки уже видно. Звук пары (core/sound.js) звучит в тот же момент.
 * Встряска и вспышка должны закончиться до закрытия пары (PAIR_DELAY = 800 мс в useMemoryGame.js).
 */
const PAIR_EFFECT_DELAY = PAIR_SOUND_DELAY;

const reducedMotion = "@media (prefers-reduced-motion: reduce)";

// Карточка при перевороте чуть «приподнимается» к игроку. Два одинаковых keyframes с разными
// именами: при смене открыта/закрыта меняется имя анимации, и браузер проигрывает её заново
const liftOpen = keyframes`
    0%, 100% {transform: scale(1);}
    50% {transform: scale(1.08);}
`;
const liftClose = keyframes`
    0%, 100% {transform: scale(1);}
    50% {transform: scale(1.08);}
`;

// Промах: карточка качается из стороны в сторону, затухая
const shake = keyframes`
    0%, 100% {transform: translateX(0) rotate(0);}
    15% {transform: translateX(-7px) rotate(-3deg);}
    35% {transform: translateX(6px) rotate(2.5deg);}
    55% {transform: translateX(-4px) rotate(-1.5deg);}
    75% {transform: translateX(2px) rotate(0.5deg);}
`;

// Угаданная пара: карточка «подпрыгивает»…
const pop = keyframes`
    0%, 100% {transform: scale(1);}
    40% {transform: scale(1.12);}
`;

// …а поверх неё вспыхивает и расходится свечение
const flash = keyframes`
    0% {opacity: 0; transform: scale(0.7);}
    30% {opacity: 1;}
    100% {opacity: 0; transform: scale(1.35);}
`;

// При «уменьшить движение» — только вспышка на месте, без движения
const flashFade = keyframes`
    0%, 100% {opacity: 0;} 30% {opacity: 0.8;}
`;

// Увеличение при наведении — только для мыши: на телефоне «hover» залипает после касания.
// Отдельный слой внутри Zoom: transform внешнего элемента принадлежит Zoom (исчезновение угаданной пары),
// и если перебить его при наведении, карточка под курсором не уменьшается, а пропадает рывком
const hoverSx = {
    transition: "transform 150ms ease-out",
    [HOVER_MEDIA]: {
        "&:hover": {
            transform: "scale(1.07)",
        },
    },
    [reducedMotion]: {transition: "none"},
};

// Отклик на касание вместо наведения — на сенсорном экране, на том же слое: карточка чуть вдавливается
// и быстро возвращается. Только у закрытой карточки: открытую нажимать незачем
const pressSx = {
    [TOUCH_MEDIA]: {
        "&:active": {
            transform: PRESS_SCALE,
            transitionDuration: `${PRESS_MS}ms`,
        },
    },
};

// Слой эффектов пары (встряска, прыжок, вспышка). Отдельный от переворота, чтобы анимации transform не спорили
const effectSx = {
    position: "relative",
};

/**
 * Стили слоя эффектов пары: встряска при промахе, прыжок и вспышка цвета `success` темы при угаданной паре.
 * Анимация стартует, когда у карточки появляется подсветка, — один раз на каждую пару.
 * @param {'match'|'mismatch'|null} highlight
 * @returns {Object} объект sx
 */
const getEffectSx = (highlight) => {
    if (highlight === "mismatch") {
        return {
            ...effectSx,
            animation: `${shake} 400ms ease-out ${PAIR_EFFECT_DELAY}ms`,
            [reducedMotion]: {animation: "none"},
        };
    }

    if (highlight === "match") {
        return {
            ...effectSx,
            animation: `${pop} 400ms ease-out ${PAIR_EFFECT_DELAY}ms`,
            "&::after": {
                content: '""',
                position: "absolute",
                inset: -10,
                zIndex: 1,
                pointerEvents: "none",
                borderRadius: "50%",
                background: (theme) =>
                    `radial-gradient(circle, ${alpha(theme.palette.common.white, 0.9)} 0%, `
                    + `${alpha(theme.palette.success.light, 0.7)} 35%, ${alpha(theme.palette.success.main, 0)} 70%)`,
                opacity: 0,
                animation: `${flash} 450ms ease-out ${PAIR_EFFECT_DELAY}ms`,
            },
            [reducedMotion]: {
                animation: "none",
                "&::after": {animation: `${flashFade} 450ms linear ${PAIR_EFFECT_DELAY}ms`},
            },
        };
    }

    return effectSx;
};

// Сцена переворота: perspective задаёт глубину 3D для flipper'а
const liftSx = {
    perspective: "800px",
};

// Переворот с лёгким «перелётом» в конце (cubic-bezier выше 1) — карточка как будто пружинит
const flipperSx = {
    position: "relative",
    transformStyle: "preserve-3d",
    transition: `transform ${FLIP_TIME}ms cubic-bezier(0.34, 1.35, 0.64, 1)`,
    [reducedMotion]: {transition: "none"},
};

// Скругление мягкое, на телефоне (карточки мельче) — поменьше
const faceSx = {
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    borderRadius: {xs: "14px", sm: "18px"},
    // Тень легче, чем у плашек: карточки стоят плотно, и общая тень темы сливалась бы в дымку.
    // В тёмном режиме карточку отделяет цвет, тень не нужна
    boxShadow: (theme) => (theme.palette.mode === "dark" ? "none" : "0 2px 8px rgba(31, 42, 68, 0.08)"),
    transition: "background-color 150ms ease-out, box-shadow 150ms ease-out",
};

/**
 * Стили рубашки. Обычная — светлый тон основного цвета темы, чтобы закрытые карточки отличались от открытых (белых);
 * тон — полупрозрачный слой поверх цвета окна, поэтому рубашка непрозрачная в обеих темах.
 * Остальные — SVG-узор из core/cardBacks.js в цвет темы (getCardBackStyle).
 * @param {string} cardBack - ключ рубашки (настройка `cardBack`)
 * @returns {Array} sx массивом: общие стили стороны и фон по теме
 */
const getBackFaceSx = (cardBack) => [
    faceSx,
    (theme) => getCardBackStyle(cardBack, theme.palette.primary.main, theme.palette.mode === "dark") || {
        backgroundImage: `linear-gradient(${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.primary.main, 0.2)})`,
    },
];

// Лицевая сторона (с иконкой) изначально развёрнута «спиной» к игроку
const frontFaceSx = {
    ...faceSx,
    position: "absolute",
    inset: 0,
    transform: "rotateY(180deg)",
};

// Цвет подсветки пары: зелёный — угадана, красный — нет
const highlightColors = {
    match: "success",
    mismatch: "error",
};

/**
 * Стили подсветки лицевой стороны: фон, рамка и свечение цвета темы (success / error).
 * @param {'match'|'mismatch'|null} highlight
 * @returns {Object} объект sx (пустой, если подсветки нет)
 */
const getHighlightSx = (highlight) => {
    const color = highlightColors[highlight];

    if (!color) {
        return {};
    }

    return {
        bgcolor: `${color}.light`,
        boxShadow: (theme) => `0 0 0 3px ${theme.palette[color].main}, 0 0 16px ${theme.palette[color].main}`,
        "& .MuiTypography-root": {
            color: `${color}.contrastText`,
        },
    };
};

/**
 * Одна сторона карточки.
 * @param {Object} props
 * @param {Object} props.sx - стили стороны
 * @param {import("../store/itemsSlice.js").CardItem} props.item - карточка: набор и имя картинки
 * @param {string} props.iconSize - CSS-размер картинки (например "60px")
 * @param {boolean} [props.compact] - уменьшенные поля (телефон)
 * @param {boolean} [props.hidden] - скрыть картинку, сохранив размер (для рубашки)
 */
function CardFace({sx, item, iconSize, compact, hidden}) {
    return (
        <Card sx={sx}>
            <CardActionArea>
                {/* На телефоне поля меньше; у CardContent по умолчанию увеличенный нижний отступ — выравниваем */}
                <CardContent sx={compact ? {p: 0.75, "&:last-child": {pb: 0.75}} : undefined}>
                    <Typography
                        textAlign="center"
                        variant="body1"
                        color="text.secondary"
                        sx={hidden ? {visibility: "hidden"} : undefined}
                    >
                        <CardPicture set={item.set} picture={item.icon} size={iconSize}/>
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}

/**
 * Одна карточка игрового поля.
 *
 * Состоит из двух сторон (рубашка и лицо с картинкой из набора, CardPicture) в 3D-контейнере. Рубашка — выбранная игроком
 * (настройка `cardBack`, core/cardBacks.js).
 * При открытии переворачивается справа налево (rotateY до -180°), при закрытии — обратно;
 * на перевороте чуть приподнимается и в конце пружинит. Неугаданная пара встряхивается,
 * угаданная подпрыгивает со вспышкой (getEffectSx), затем исчезает через Zoom, оставаясь открытой.
 * При «уменьшить движение» переворот мгновенный, без встряски и прыжка, вспышка — только на месте. Очки за пару (`popup`) всплывают
 * поверх карточки и остаются видны, пока она исчезает: надпись лежит рядом с Zoom, а не внутри.
 *
 * Обёрнута в React.memo: перерисовывается, только когда меняются её пропсы. Поэтому обработчик
 * клика — общий `onOpen(index)` со стабильной ссылкой, а не новая стрелочная функция на каждую карточку.
 *
 * @param {Object} props
 * @param {import("../store/itemsSlice.js").CardItem} props.item - данные карточки
 * @param {number} props.index - позиция карточки на поле
 * @param {boolean} props.revealed - показывать лицевую сторону
 * @param {boolean} props.disabled - отключить клики и эффект наведения
 * @param {'match'|'mismatch'|null} props.highlight - подсветка пары
 * @param {{points: number, streak: number}|null} [props.popup] - всплывающие очки над карточкой
 * @param {string} props.iconSize - CSS-размер иконки (на телефоне зависит от ширины экрана)
 * @param {boolean} props.compact - уменьшенные поля карточки (телефон)
 * @param {function(number): void} props.onOpen - открыть карточку по индексу
 */
function MemoryCard({item, index, revealed, disabled, highlight, popup, iconSize, compact, onOpen}) {
    const cardBack = useSelector(state => state.game.cardBack);
    // Объект стилей — один на рубашку, а не новый на каждую перерисовку
    const backFaceSx = React.useMemo(() => getBackFaceSx(cardBack), [cardBack]);
    // Угаданная пара исчезает открытой, не переворачиваясь обратно
    const flipped = revealed || item.delete;

    return (
        <Box sx={{position: "relative"}}>
            <Zoom in={!item.delete}>
                <Box
                    onClick={() => onOpen(index)}
                    style={disabled ? {pointerEvents: "none"} : undefined}
                >
                    <Box sx={flipped ? hoverSx : [hoverSx, pressSx]}>
                        <Box sx={getEffectSx(highlight)}>
                            <Box
                                sx={{
                                    ...liftSx,
                                    animation: `${flipped ? liftOpen : liftClose} ${FLIP_TIME}ms ease-in-out`,
                                    [reducedMotion]: {animation: "none"},
                                }}
                            >
                                <Box sx={{...flipperSx, transform: flipped ? "rotateY(-180deg)" : "rotateY(0deg)"}}>
                                    {/* Рубашка: картинка скрыта, нужна только чтобы задать размер карточки */}
                                    <CardFace sx={backFaceSx} item={item} iconSize={iconSize} compact={compact} hidden/>
                                    <CardFace sx={{...frontFaceSx, ...getHighlightSx(highlight)}} item={item} iconSize={iconSize} compact={compact}/>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Zoom>
            {popup && <PointsPopup points={popup.points} streak={popup.streak}/>}
        </Box>
    );
}

export default React.memo(MemoryCard);
