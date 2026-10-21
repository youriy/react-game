import React from 'react';
import {useDispatch} from "react-redux";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from "@mui/material/Stack";
import Typography from '@mui/material/Typography';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import Timer from "./Timer.jsx";
import Try from "./Try.jsx";
import Score from "./Score.jsx";
import GameControls from "./GameControls.jsx";
import MemoryCard from "./MemoryCard.jsx";
import useMemoryGame from "../core/useMemoryGame.js";
import useTranslation from "../core/useTranslation.js";
import {setPaused} from "../store/gameSlice.jsx";

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

/**
 * Игровой экран: строка статуса (время, попытки, очки), кнопки управления и поле карточек.
 * Логика партии — в хуке useMemoryGame.
 */
export default function GameArea() {
    const {items, preview, hinting, paused, canHint, showHint, openItem, getHighlight} = useMemoryGame();

    return (
        <Stack spacing={1}>
            <Stack sx={statusSx} spacing={6} direction="row">
                {/* Таймер идёт только после показа карточек и не на паузе */}
                <Timer running={!preview && !paused}/>
                <Try/>
                <Score/>
            </Stack>
            <GameControls canPause={!preview && !hinting} canHint={canHint} onHint={showHint}/>
            <Box sx={{position: "relative"}}>
                {/* На паузе поле скрыто (но занимает место), чтобы нельзя было запоминать карточки */}
                <Grid container spacing={2} sx={{visibility: paused ? "hidden" : "visible"}}>
                    {
                        items.map((item, index) =>
                            <Grid item xs={2} key={item.id}>
                                <MemoryCard
                                    item={item}
                                    revealed={item.open || preview || hinting}
                                    disabled={preview || hinting || paused}
                                    highlight={getHighlight(index)}
                                    onClick={() => openItem(index)}
                                />
                            </Grid>
                        )
                    }
                </Grid>
                {paused && <PauseOverlay/>}
            </Box>
        </Stack>
    );
}
