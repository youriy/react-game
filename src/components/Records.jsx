import React, {useRef} from 'react';
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Fade from "@mui/material/Fade";
import Paper from '@mui/material/Paper';
import Stack from "@mui/material/Stack";
import Typography from '@mui/material/Typography';
import useMediaQuery from "@mui/material/useMediaQuery";
import {formatTime} from "../core/utils.js";
import useTranslation from "../hooks/useTranslation.js";

/** Длительность появления и исчезания плашки, мс. */
const ANIMATION_MS = 300;

/**
 * Один показатель в плашке рекордов.
 * @param {{label: string, value: (string|number)}} props
 */
function RecordItem({label, value}) {
    return (
        <Stack sx={{alignItems: "center", minWidth: {xs: 0, sm: 150}, textAlign: "center"}}>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
            <Typography variant="h5" color="primary">{value}</Typography>
        </Stack>
    );
}

/**
 * Плашка «Рекорды» на стартовом экране: лучший счёт, время и серия.
 * Не показывается, пока нет ни одного сохранённого результата. При смене уровня плавно появляется
 * и исчезает (раскрытие по высоте + прозрачность, 0,3 с); при первом показе экрана и при системной
 * настройке «уменьшить движение» — без анимации.
 * Отступ сверху (gap) задаётся внутри анимации: если отдать его родительскому Stack, он появлялся бы рывком.
 * @param {Object} props
 * @param {ReturnType<typeof import("../core/storage.js").getRecords>} props.records - результат getRecords()
 * @param {Object|number} props.gap - отступ сверху, как spacing у Stack; родитель должен убрать свой
 */
export default function Records({records, gap}) {
    const t = useTranslation();
    const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
    const timeout = reducedMotion ? 0 : ANIMATION_MS;
    const visible = Object.values(records).some(value => value !== undefined);

    // Пока плашка исчезает, показываем последние непустые рекорды, а не прочерки
    const lastRecords = useRef(records);
    if (visible) {
        lastRecords.current = records;
    }
    const {score, time, streak} = lastRecords.current;

    const show = (value, format = (v) => v) => (value === undefined ? "—" : format(value));

    return (
        <Collapse in={visible} timeout={timeout} appear={false} unmountOnExit sx={{mt: "0 !important"}}>
            <Fade in={visible} timeout={timeout} appear={false}>
                <Box sx={{pt: gap}}>
                    <Paper sx={{p: 2}}>
                        <Typography variant="h6" sx={{textAlign: "center", mb: 1}}>🏆 {t.records}</Typography>
                        <Stack direction="row" spacing={{xs: 2, sm: 4}} sx={{justifyContent: "center"}}>
                            <RecordItem label={t.bestScore} value={show(score)}/>
                            <RecordItem label={t.bestTime} value={show(time, formatTime)}/>
                            <RecordItem label={t.bestStreak} value={show(streak)}/>
                        </Stack>
                    </Paper>
                </Box>
            </Fade>
        </Collapse>
    );
}
