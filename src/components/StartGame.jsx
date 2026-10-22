import React from 'react';
import {useDispatch, useSelector} from "react-redux";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from "@mui/material/Stack";
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import {setLevel, startNewRound} from "../store/gameSlice.jsx";
import {resetItems} from "../store/itemsSlice.jsx";
import Helper from "../core/Helper.jsx";
import useTranslation from "../core/useTranslation.js";
import {calculateScore} from "../core/score.js";
import {getRecords} from "../core/storage.js";
import {getLevel, levelList} from "../core/levels.js";
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
 * Переключатель уровня сложности: «Лёгкий 4×4», «Средний 6×6», «Сложный 8×6».
 * Выбранный уровень сохраняется в state.game.level (и в localStorage).
 */
function LevelSelect() {
    const dispatch = useDispatch();
    const level = useSelector(state => state.game.level);
    const t = useTranslation();

    return (
        <Stack spacing={1} sx={{alignItems: "center"}}>
            <Typography variant="h6" color="text.secondary">{t.difficulty}</Typography>
            <ToggleButtonGroup
                color="primary"
                exclusive
                value={getLevel(level).key}
                // null приходит при повторном клике по уже выбранной кнопке — уровень не сбрасываем
                onChange={(event, value) => value && dispatch(setLevel(value))}
            >
                {
                    levelList.map(item =>
                        <ToggleButton key={item.key} value={item.key} sx={{px: 3}}>
                            {t[item.labelKey]} {item.columns}×{item.pairs * 2 / item.columns}
                        </ToggleButton>
                    )
                }
            </ToggleButtonGroup>
        </Stack>
    );
}

/**
 * Стартовый экран: результаты последней партии (если она выиграна), выбор уровня,
 * рекорды и статистика выбранного уровня, кнопка «Начать игру».
 */
export default function StartGame() {
    const dispatch = useDispatch();
    const {win, count, time, score, bestStreak, hintUsed, newRecords, level, roundLevel} = useSelector(state => state.game);
    const t = useTranslation();
    // Результат последней партии считается по её уровню, рекорды — по выбранному
    const result = calculateScore({score, time, count, hintUsed, level: roundLevel});
    const records = getRecords(getLevel(level).key);
    const recordLabels = {score: t.bestScore, time: t.bestTime, streak: t.bestStreak};

    const handleStart = () => {
        dispatch(resetItems(level));
        dispatch(startNewRound());
    };

    return (
        <Box sx={{marginTop: "60px", minWidth: 600}}>
            <Stack spacing={6}>
                {
                    win &&
                    <Stack spacing={1}>
                        <WinText variant="h1">{t.win}</WinText>
                        <WinText variant="h5">{t.difficulty}: {t[getLevel(roundLevel).labelKey]}</WinText>
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
                            {result.multiplier !== 1 && <> · ×{result.multiplier}</>}
                        </WinText>
                        <WinText variant="h3">{t.totalScore}: {result.total}</WinText>
                    </Stack>
                }
                <LevelSelect/>
                <Records records={records}/>
                <Button variant="contained" size="large" onClick={handleStart}>
                    {t.start}
                </Button>
                <Grid/>
            </Stack>
        </Box>
    );
}
