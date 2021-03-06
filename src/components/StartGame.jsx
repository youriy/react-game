import React from 'react';
import {useDispatch, useSelector} from "react-redux";
import Button from '@mui/material/Button';
import Stack from "@mui/material/Stack";
import Typography from '@mui/material/Typography';
import {resetGame, setGaming, setWin} from "../store/gameSlice.jsx";
import {resetItems} from "../store/itemsSlice.jsx";
import Helper from "../core/Helper.jsx"
import { makeStyles } from "@mui/styles";
import Grid from "./Grid.jsx";
import {languageList} from "../core/Language";

const useStyles = makeStyles((theme) => ({
    root: {
        marginTop:60,
        minWidth: 600
    },
    text: {
        textAlign: "center"
    }
}));

export default function StartGame() {
    const classes = useStyles();
    const dispatch = useDispatch();
    const {win, count, time, language} = useSelector(state => state.game);

    const handleChangeGaming = () => {
        if (win) {
            dispatch(resetItems());
            dispatch(resetGame());
        }

        dispatch(setGaming(true));
        dispatch(setWin(false));
    };

    return (
        <div className={classes.root}>
            <Stack spacing={6}>
                {
                    win &&
                    <Stack spacing={1}>
                        <Typography className={classes.text} variant="h1" component="div" gutterBottom color="primary">
                            {languageList[language].win}
                        </Typography>
                        <Typography className={classes.text} variant="h5" component="div" gutterBottom color="primary">
                            {languageList[language].userTime}: {Helper.formatTime(time)}
                        </Typography>
                        <Typography className={classes.text} variant="h5" component="div" gutterBottom color="primary">
                            {languageList[language].userTry}: {count}
                        </Typography>
                    </Stack>
                }
                <Button variant="contained" size="large" onClick={handleChangeGaming}>
                    {languageList[language].start}
                </Button>
                <Grid/>
            </Stack>
        </div>
    );
}