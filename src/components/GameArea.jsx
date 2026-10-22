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
import useMemoryGame from "../core/useMemoryGame.js";
import useTranslation from "../core/useTranslation.js";
import {setPaused} from "../store/gameSlice.js";

const statusSx = {
    justifyContent: "center",
    "& .MuiTypography-root": {
        minWidth: 260,
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

/**
 * Игровой экран: строка статуса (время, попытки, очки), кнопки управления и поле карточек.
 * Число колонок поля зависит от уровня. Логика партии — в хуке useMemoryGame.
 */
export default function GameArea() {
    const {items, level, preview, hinting, paused, canHint, showHint, openItem, getHighlight} = useMemoryGame();

    return (
        <Stack spacing={1}>
            <Stack sx={statusSx} spacing={6} direction="row">
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
                        gridTemplateColumns: `repeat(${level.columns}, minmax(0, 1fr))`,
                        gap: 2,
                        width: level.columns * CARD_WIDTH,
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
                                revealed={item.open || preview || hinting}
                                disabled={preview || hinting || paused}
                                highlight={getHighlight(index)}
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
