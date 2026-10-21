import React from 'react';
import {useDispatch, useSelector} from "react-redux";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from "@mui/material/Stack";
import Typography from '@mui/material/Typography';
import {resetGame, setGaming, setWin} from "../store/gameSlice.jsx";
import {resetItems} from "../store/itemsSlice.jsx";
import Helper from "../core/Helper.jsx";
import useTranslation from "../core/useTranslation.js";
import Grid from "./Grid.jsx";

function WinText({variant, children}) {
    return (
        <Typography sx={{textAlign: "center"}} variant={variant} component="div" gutterBottom color="primary">
            {children}
        </Typography>
    );
}

export default function StartGame() {
    const dispatch = useDispatch();
    const {win, count, time} = useSelector(state => state.game);
    const t = useTranslation();

    const handleStart = () => {
        if (win) {
            dispatch(resetItems());
            dispatch(resetGame());
        }

        dispatch(setGaming(true));
        dispatch(setWin(false));
    };

    return (
        <Box sx={{marginTop: "60px", minWidth: 600}}>
            <Stack spacing={6}>
                {
                    win &&
                    <Stack spacing={1}>
                        <WinText variant="h1">{t.win}</WinText>
                        <WinText variant="h5">{t.userTime}: {Helper.formatTime(time)}</WinText>
                        <WinText variant="h5">{t.userTry}: {count}</WinText>
                    </Stack>
                }
                <Button variant="contained" size="large" onClick={handleStart}>
                    {t.start}
                </Button>
                <Grid/>
            </Stack>
        </Box>
    );
}
