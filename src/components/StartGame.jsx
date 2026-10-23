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
import useTranslation from "../hooks/useTranslation.js";
import useIsMobile from "../hooks/useIsMobile.js";
import useConfetti from "../hooks/useConfetti.js";
import {calculateScore, calculateStars} from "../core/score.js";
import {getRecords} from "../core/storage.js";
import {getLevel, levelList} from "../core/levels.js";
import {getBestStars, getLastUnlockedLevel, isLevelUnlocked} from "../core/progress.js";
import Stars from "./Stars.jsx";
import Records from "./Records.jsx";
import ResultsTable from "./ResultsTable.jsx";

/** Отступ между блоками стартового экрана (spacing у Stack); плашке рекордов он передаётся отдельно. */
const SECTION_SPACING = {xs: 3, sm: 6};

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
 * Размер поля уровня для подписи, «колонки×ряды».
 * @param {import("../core/levels.js").Level} level
 * @param {boolean} isMobile - узкий экран: колонок mobileColumns
 * @returns {string} например, "7×6"
 */
const getFieldSize = (level, isMobile) => {
    const columns = isMobile ? level.mobileColumns : level.columns;

    return `${columns}×${level.pairs * 2 / columns}`;
};

/**
 * Кнопки переключателя стоят сеткой с промежутками (а не слитной полосой, как в ToggleButtonGroup
 * по умолчанию): у каждой своя рамка и скругление.
 */
const levelGridSx = {
    display: "grid",
    gridTemplateColumns: {xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(3, minmax(0, 1fr))"},
    gap: 1,
    width: "100%",
    "& .MuiToggleButtonGroup-grouped, & .MuiToggleButtonGroup-grouped:not(:first-of-type), & .MuiToggleButtonGroup-grouped:not(:last-of-type)": {
        m: 0,
        border: 1,
        borderColor: "divider",
        borderRadius: 1,
    },
};

/**
 * Переключатель уровня сложности: шесть кнопок от «Очень лёгкий 4×3» до «Сложный 7×6» (на телефоне 6×7),
 * сеткой 3×2 (на телефоне 2×3). На кнопке — название, размер поля и лучшие звёзды уровня.
 * Уровни открываются по очереди: закрытый недоступен, на его кнопке замок и подсказка «Пройдите предыдущий».
 * Выбранный уровень сохраняется в state.game.level (и в localStorage).
 */
function LevelSelect() {
    const dispatch = useDispatch();
    const level = useSelector(state => state.game.level);
    const t = useTranslation();
    const isMobile = useIsMobile();

    // Если выбран закрытый уровень (например, сохранён в настройках раньше) — переключаемся на самый сложный из открытых
    React.useEffect(() => {
        if (!isLevelUnlocked(level)) {
            dispatch(setLevel(getLastUnlockedLevel()));
        }
    }, [level]);

    return (
        <Stack spacing={1} sx={{alignItems: "center", textAlign: "center"}}>
            <Typography variant="h6" color="text.secondary">{t.difficulty}</Typography>
            <ToggleButtonGroup
                color="primary"
                exclusive
                sx={levelGridSx}
                value={getLevel(level).key}
                // null приходит при повторном клике по уже выбранной кнопке — уровень не сбрасываем
                onChange={(event, value) => value && dispatch(setLevel(value))}
            >
                {
                    levelList.map(item => {
                        const locked = !isLevelUnlocked(item.key);

                        return (
                            <ToggleButton key={item.key} value={item.key} disabled={locked} sx={{px: 1, flexDirection: "column", lineHeight: 1.3}}>
                                <span>
                                    {locked && <LockIcon fontSize="inherit" sx={{mr: 0.5, verticalAlign: "-2px"}}/>}
                                    {t[item.labelKey]}
                                </span>
                                {/* Размер поля — как на этом экране (на телефоне у сложного 6×7) */}
                                <Typography variant="caption" component="span">{getFieldSize(item, isMobile)}</Typography>
                                {
                                    locked
                                        ? <Typography variant="caption" component="span" sx={{textTransform: "none"}}>{t.unlockHint}</Typography>
                                        : <Stars value={getBestStars(item.key)} size="small"/>
                                }
                            </ToggleButton>
                        );
                    })
                }
            </ToggleButtonGroup>
        </Stack>
    );
}

/**
 * Стартовый экран: результаты последней партии (если она выиграна: конфетти, звёзды, открытые уровни, рекорды,
 * разбивка счёта), выбор уровня, рекорды и статистика выбранного уровня, кнопка «Начать игру».
 */
export default function StartGame() {
    const dispatch = useDispatch();
    const {win, count, time, score, bestStreak, hintUsed, newRecords, newUnlocks, level, roundLevel, round} = useSelector(state => state.game);
    const t = useTranslation();
    // Результат последней партии считается по её уровню, рекорды — по выбранному
    const result = calculateScore({score, time, count, hintUsed, level: roundLevel});
    const stars = calculateStars(result.total, roundLevel);
    const fireConfetti = useConfetti();

    // Конфетти при победе: большой залп — за новый рекорд или 3 звезды. Один раз на партию (round),
    // а не при каждой перерисовке экрана (смена уровня, языка и т. п.)
    React.useEffect(() => {
        if (win) {
            fireConfetti({big: stars === 3 || newRecords.length > 0});
        }
    }, [win, round]);
    const records = getRecords(getLevel(level).key);
    const recordLabels = {score: t.bestScore, time: t.bestTime, streak: t.bestStreak};

    return (
        // На телефоне — во всю ширину экрана, меньше отступы
        <Box sx={{marginTop: {xs: "16px", sm: "30px"}, width: {xs: "100%", sm: "auto"}, minWidth: {xs: 0, sm: 600}}}>
            <Stack spacing={SECTION_SPACING}>
                {/* Итоги партии и выбор уровня — в своей группе, с отступом меньше общего (32 px вместо 48) */}
                <Stack spacing={{xs: 2, sm: 4}}>
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
                <Records records={records} gap={SECTION_SPACING}/>
                <Button variant="contained" size="large" onClick={() => dispatch(startNewGame())}>
                    {t.start}
                </Button>
                <ResultsTable/>
            </Stack>
        </Box>
    );
}
