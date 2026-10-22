import React from 'react';
import {useDispatch} from "react-redux";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from "@mui/material/Stack";
import Typography from '@mui/material/Typography';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Timer from "./Timer.jsx";
import Attempts from "./Attempts.jsx";
import Score from "./Score.jsx";
import GameControls from "./GameControls.jsx";
import MemoryCard from "./MemoryCard.jsx";
import useMemoryGame from "../hooks/useMemoryGame.js";
import useTranslation from "../hooks/useTranslation.js";
import useIsMobile from "../hooks/useIsMobile.js";
import {setPaused} from "../store/gameSlice.js";

// На телефоне надписи статуса переносятся и не держат фиксированную ширину
const statusSx = {
    justifyContent: "center",
    flexWrap: "wrap",
    "& .MuiTypography-root": {
        minWidth: {xs: 0, sm: 260},
    }
};

/** Экран паузы поверх скрытого поля: надпись «Пауза» и кнопка «Продолжить». */
function PauseOverlay() {
    const dispatch = useDispatch();
    const t = useTranslation();

    return (
        <Stack
            spacing={3}
            sx={{position: "absolute", inset: 0, alignItems: "center", justifyContent: "center"}}
        >
            <Typography variant="h2" color="primary">{t.pause}</Typography>
            <Button variant="contained" size="large" startIcon={<PlayArrowIcon/>} onClick={() => dispatch(setPaused(false))}>
                {t.resume}
            </Button>
        </Stack>
    );
}

/** Ширина одной колонки поля, px: поле уровня занимает columns × CARD_WIDTH, но не шире экрана. */
const CARD_WIDTH = 150;
/** Размер иконки на карточке на широком экране, px. */
const ICON_SIZE = 60;
/** Отступы страницы по бокам на телефоне (Container), px — учитываются при расчёте размера иконки. */
const MOBILE_PAGE_PADDING = 32;
/** Промежуток между карточками на телефоне, px (theme.spacing(0.75)). */
const MOBILE_GAP = 6;

/**
 * Размер иконки на телефоне: примерно половина ширины карточки, но не больше ICON_SIZE.
 * Считается в CSS от ширины экрана (100vw), поэтому подстраивается под любой телефон.
 * @param {number} columns - колонок на поле
 * @returns {string} CSS-значение для fontSize иконки
 */
const getMobileIconSize = (columns) =>
    `min(${ICON_SIZE}px, calc((100vw - ${MOBILE_PAGE_PADDING + MOBILE_GAP * (columns - 1)}px) / ${columns} * 0.5))`;

/**
 * Игровой экран: строка статуса (время, попытки, очки), кнопки управления и поле карточек.
 * Число колонок поля зависит от уровня и ширины экрана (на телефоне — mobileColumns уровня,
 * мельче промежутки и иконки). Логика партии — в хуке useMemoryGame.
 */
export default function GameArea() {
    const {items, level, preview, hinting, paused, canHint, showHint, openItem, getHighlight, getPopup} = useMemoryGame();
    const isMobile = useIsMobile();
    const columns = isMobile ? level.mobileColumns : level.columns;
    const iconSize = isMobile ? getMobileIconSize(columns) : `${ICON_SIZE}px`;

    return (
        // width: 100% — иначе экран сжимается по содержимому, и поле (columns × CARD_WIDTH)
        // на узком экране вылезает за край вместо того, чтобы ужаться до maxWidth: 100%
        <Stack spacing={1} sx={{width: "100%"}}>
            <Stack sx={statusSx} spacing={{xs: 2, sm: 6}} direction="row">
                {/* Таймер идёт только после показа карточек и не на паузе */}
                <Timer running={!preview && !paused}/>
                <Attempts/>
                <Score/>
            </Stack>
            <GameControls canPause={!preview && !hinting} canHint={canHint} onHint={showHint}/>
            <Box sx={{position: "relative"}}>
                {/* На паузе поле скрыто (но занимает место), чтобы нельзя было запоминать карточки */}
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                        gap: isMobile ? `${MOBILE_GAP}px` : 2,
                        width: columns * CARD_WIDTH,
                        maxWidth: "100%",
                        mx: "auto",
                        visibility: paused ? "hidden" : "visible",
                    }}
                >
                    {
                        items.map((item, index) =>
                            <MemoryCard
                                key={item.id}
                                item={item}
                                index={index}
                                iconSize={iconSize}
                                compact={isMobile}
                                revealed={item.open || preview || hinting}
                                disabled={preview || hinting || paused}
                                highlight={getHighlight(index)}
                                popup={getPopup(index)}
                                onOpen={openItem}
                            />
                        )
                    }
                </Box>
                {paused && <PauseOverlay/>}
            </Box>
        </Stack>
    );
}
