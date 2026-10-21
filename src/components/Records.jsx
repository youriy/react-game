import React from 'react';
import Paper from '@mui/material/Paper';
import Stack from "@mui/material/Stack";
import Typography from '@mui/material/Typography';
import Helper from "../core/Helper.jsx";
import useTranslation from "../core/useTranslation.js";

/**
 * Один показатель в плашке рекордов.
 * @param {{label: string, value: (string|number)}} props
 */
function RecordItem({label, value}) {
    return (
        <Stack sx={{alignItems: "center", minWidth: 150}}>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
            <Typography variant="h5" color="primary">{value}</Typography>
        </Stack>
    );
}

/**
 * Плашка «Рекорды» на стартовом экране: лучший счёт, время и серия.
 * Не показывается, пока нет ни одного сохранённого результата.
 * @param {Object} props
 * @param {ReturnType<typeof import("../core/storage.js").getRecords>} props.records - результат getRecords()
 */
export default function Records({records}) {
    const t = useTranslation();
    const {score, time, streak} = records;

    if (score === undefined && time === undefined && streak === undefined) {
        return null;
    }

    const show = (value, format = (v) => v) => (value === undefined ? "—" : format(value));

    return (
        <Paper sx={{p: 2}}>
            <Typography variant="h6" sx={{textAlign: "center", mb: 1}}>🏆 {t.records}</Typography>
            <Stack direction="row" spacing={4} sx={{justifyContent: "center"}}>
                <RecordItem label={t.bestScore} value={show(score)}/>
                <RecordItem label={t.bestTime} value={show(time, Helper.formatTime)}/>
                <RecordItem label={t.bestStreak} value={show(streak)}/>
            </Stack>
        </Paper>
    );
}
