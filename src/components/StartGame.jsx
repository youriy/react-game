import React from 'react';
import {useDispatch, useSelector} from "react-redux";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from "@mui/material/Stack";
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import LockIcon from '@mui/icons-material/Lock';
import {setLevel} from "../store/gameSlice.js";
import {startNewGame} from "../store/thunks.js";
import {formatTime} from "../core/utils.js";
import useTranslation from "../core/useTranslation.js";
import {calculateScore, calculateStars} from "../core/score.js";
import {getRecords} from "../core/storage.js";
import {DEFAULT_LEVEL, getLevel, levelList} from "../core/levels.js";
import {getBestStars, isLevelUnlocked} from "../core/progress.js";
import Stars from "./Stars.jsx";
import Records from "./Records.jsx";
import ResultsTable from "./ResultsTable.jsx";

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
 * На кнопке — лучшие звёзды уровня; закрытый уровень недоступен, под переключателем написано,
 * как его открыть. Выбранный уровень сохраняется в state.game.level (и в localStorage).
 */
function LevelSelect() {
    const dispatch = useDispatch();
    const level = useSelector(state => state.game.level);
    const t = useTranslation();
    const lockedLevels = levelList.filter(item => !isLevelUnlocked(item.key));

    // Если выбран закрытый уровень (например, сохранён в настройках раньше) — переключаемся на уровень по умолчанию
    React.useEffect(() => {
        if (!isLevelUnlocked(level)) {
            dispatch(setLevel(DEFAULT_LEVEL));
        }
    }, [level]);

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
                    levelList.map(item => {
                        const locked = lockedLevels.includes(item);

                        return (
                            <ToggleButton key={item.key} value={item.key} disabled={locked} sx={{px: 3, flexDirection: "column"}}>
                                <span>
                                    {locked && <LockIcon fontSize="inherit" sx={{mr: 0.5, verticalAlign: "-2px"}}/>}
                                    {t[item.labelKey]} {item.columns}×{item.pairs * 2 / item.columns}
                                </span>
                                <Stars value={getBestStars(item.key)} size="small"/>
                            </ToggleButton>
                        );
                    })
                }
            </ToggleButtonGroup>
            {
                lockedLevels.map(item =>
                    <Typography key={item.key} variant="body2" color="text.secondary">
                        🔒 {t[item.labelKey]} — {t.unlockAfter} «{t[getLevel(item.unlockedBy).labelKey]}»
                    </Typography>
                )
            }
        </Stack>
    );
}

/**
 * Стартовый экран: результаты последней партии (если она выиграна: звёзды, открытые уровни, рекорды,
 * разбивка счёта), выбор уровня, рекорды и статистика выбранного уровня, кнопка «Начать игру».
 */
export default function StartGame() {
    const dispatch = useDispatch();
    const {win, count, time, score, bestStreak, hintUsed, newRecords, newUnlocks, level, roundLevel} = useSelector(state => state.game);
    const t = useTranslation();
    // Результат последней партии считается по её уровню, рекорды — по выбранному
    const result = calculateScore({score, time, count, hintUsed, level: roundLevel});
    const stars = calculateStars(result.total, roundLevel);
    const records = getRecords(getLevel(level).key);
    const recordLabels = {score: t.bestScore, time: t.bestTime, streak: t.bestStreak};

    return (
        <Box sx={{marginTop: "30px", minWidth: 600}}>
            <Stack spacing={6}>
                {/* Итоги партии и выбор уровня — в своей группе, с отступом меньше общего (32 px вместо 48) */}
                <Stack spacing={4}>
                    {
                        win &&
                        <Stack spacing={1}>
                            <WinText variant="h1">{t.win}</WinText>
                            <Box sx={{display: "flex", justifyContent: "center"}}>
                                <Stars value={stars} size="large"/>
                            </Box>
                            {
                                newUnlocks.length > 0 &&
                                <WinText variant="h5">
                                    {t.levelUnlocked}: {newUnlocks.map(key => `«${t[getLevel(key).labelKey]}»`).join(", ")}
                                </WinText>
                            }
                            <WinText variant="h5">{t.difficulty}: {t[getLevel(roundLevel).labelKey]}</WinText>
                            {
                                newRecords.length > 0 &&
                                <WinText variant="h4">
                                    {t.newRecord} ({newRecords.map(key => recordLabels[key]).join(", ")})
                                </WinText>
                            }
                            <WinText variant="h5">{t.userTime}: {formatTime(time)}</WinText>
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
                </Stack>
                <Records records={records}/>
                <Button variant="contained" size="large" onClick={() => dispatch(startNewGame())}>
                    {t.start}
                </Button>
                <ResultsTable/>
            </Stack>
        </Box>
    );
}
