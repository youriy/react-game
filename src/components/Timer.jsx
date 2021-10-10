import React from 'react';
import Typography from '@mui/material/Typography';
import { makeStyles } from "@mui/styles";
import {useDispatch, useSelector} from "react-redux";
import Helper from "../core/Helper.jsx";
import {incrementTime} from "../store/gameSlice.jsx";

const useStyles = makeStyles((theme) => ({
    timer: {
        textAlign: "center",
        marginTop: "20px!important",
    },
}));

export default function Timer() {
    const dispatch = useDispatch();
    const time = useSelector(state => state.game.time);
    const classes = useStyles();

    React.useEffect(() => {
        let interval = setInterval(() => {
            dispatch(incrementTime());
        }, 1000);

        return () => {
            clearInterval(interval);
        }
    }, []);

    return (
        <Typography variant="h4" gutterBottom component="div" className={classes.timer} color="primary">
            Время: {Helper.formatTime(time)}
        </Typography>
    );
}