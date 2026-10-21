import React from 'react';
import {useDispatch, useSelector} from "react-redux";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from "@mui/material/Stack";
import Typography from '@mui/material/Typography';
import {startNewRound} from "../store/gameSlice.jsx";
import {resetItems} from "../store/itemsSlice.jsx";
import Helper from "../core/Helper.jsx";
import useTranslation from "../core/useTranslation.js";
import {calculateScore} from "../core/score.js";
import {getRecords} from "../core/storage.js";
import Records from "./Records.jsx";
import Grid from "./Grid.jsx";

/**
 * Строка текста на экране победы.
 * @param {{variant: string, children: React.ReactNode}} props - variant: вариант Typography (h1, h5…)
 */
function WinText({variant, children}) {
    return (
        <Typography sx={{textAlign: "center"}} variant={variant} component="div" gutterBottom color="primary">
            {children}
        </Typography>
    );
}

/**
 * Стартовый экран: результаты последней партии (если она выиграна), рекорды,
 * кнопка «Начать игру» и таблица статистики.
 */
export default function StartGame() {
    const dispatch = useDispatch();
    const {win, count, time, score, bestStreak, hintUsed, newRecords} = useSelector(state => state.game);
    const t = useTranslation();
    const result = calculateScore({score, time, count, hintUsed});
    const records = getRecords();
    const recordLabels = {score: t.bestScore, time: t.bestTime, streak: t.bestStreak};

    const handleStart = () => {
        dispatch(resetItems());
        dispatch(startNewRound());
    };

    return (
        <Box sx={{marginTop: "60px", minWidth: 600}}>
            <Stack spacing={6}>
                {
                    win &&
                    <Stack spacing={1}>
                        <WinText variant="h1">{t.win}</WinText>
                        {
                            newRecords.length > 0 &&
                            <WinText variant="h4">
                                {t.newRecord} ({newRecords.map(key => recordLabels[key]).join(", ")})
                            </WinText>
                        }
                        <WinText variant="h5">{t.userTime}: {Helper.formatTime(time)}</WinText>
                        <WinText variant="h5">{t.userTry}: {count}</WinText>
                        <WinText variant="h5">{t.bestStreak}: {bestStreak}</WinText>
                        <WinText variant="h6">
                            {t.pairsPoints}: {result.pairsPoints} · {t.timeBonus}: {result.timeBonus} · {t.accuracyBonus}: {result.accuracyBonus}
                            {hintUsed && <> · {t.hintPenalty}: −{result.hintPenalty}</>}
                        </WinText>
                        <WinText variant="h3">{t.totalScore}: {result.total}</WinText>
                    </Stack>
                }
                <Records records={records}/>
                <Button variant="contained" size="large" onClick={handleStart}>
                    {t.start}
                </Button>
                <Grid/>
            </Stack>
        </Box>
    );
}
