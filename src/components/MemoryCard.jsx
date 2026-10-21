import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Zoom from '@mui/material/Zoom';
import {cardIcons} from "../core/icons.js";

/** Длительность переворота карточки, мс. */
const FLIP_TIME = 400;

const sceneSx = {
    perspective: "800px",
    "&:hover": {
        transform: "scale(1.07)!important",
    }
};

const flipperSx = {
    position: "relative",
    transformStyle: "preserve-3d",
    transition: `transform ${FLIP_TIME}ms ease-in-out`,
};

const faceSx = {
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    transition: "background-color 150ms ease-out, box-shadow 150ms ease-out",
};

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
 * @param {React.ComponentType} props.Icon - компонент иконки
 * @param {boolean} [props.hidden] - скрыть иконку, сохранив размер (для рубашки)
 */
function CardFace({sx, Icon, hidden}) {
    return (
        <Card sx={sx}>
            <CardActionArea>
                <CardContent>
                    <Typography
                        textAlign="center"
                        variant="body1"
                        color="text.secondary"
                        sx={hidden ? {visibility: "hidden"} : undefined}
                    >
                        <Icon sx={{fontSize: 60}}/>
                    </Typography>
                </CardContent>
            </CardActionArea>
        </Card>
    );
}

/**
 * Одна карточка игрового поля.
 *
 * Состоит из двух сторон (рубашка и лицо с иконкой) в 3D-контейнере.
 * При открытии переворачивается справа налево (rotateY до -180°), при закрытии — обратно.
 * Угаданная карточка исчезает через Zoom, оставаясь открытой.
 *
 * @param {Object} props
 * @param {import("../store/itemsSlice.jsx").CardItem} props.item - данные карточки
 * @param {boolean} props.revealed - показывать лицевую сторону
 * @param {boolean} props.disabled - отключить клики и эффект наведения
 * @param {'match'|'mismatch'|null} props.highlight - подсветка пары
 * @param {function(): void} props.onClick - обработчик клика
 */
export default function MemoryCard({item, revealed, disabled, highlight, onClick}) {
    const Icon = cardIcons[item.icon];
    // Угаданная пара исчезает открытой, не переворачиваясь обратно
    const flipped = revealed || item.delete;

    return (
        <Zoom in={!item.delete}>
            <Box
                sx={sceneSx}
                onClick={onClick}
                style={disabled ? {pointerEvents: "none"} : undefined}
            >
                <Box sx={{...flipperSx, transform: flipped ? "rotateY(-180deg)" : "rotateY(0deg)"}}>
                    {/* Рубашка: иконка скрыта, нужна только чтобы задать размер карточки */}
                    <CardFace sx={faceSx} Icon={Icon} hidden/>
                    <CardFace sx={{...frontFaceSx, ...getHighlightSx(highlight)}} Icon={Icon}/>
                </Box>
            </Box>
        </Zoom>
    );
}
