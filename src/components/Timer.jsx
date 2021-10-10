import React from 'react';
import Typography from '@mui/material/Typography';
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme) => ({
    timer: {
        textAlign: "center",
        marginTop: "20px!important",
    },
}));

export default function Timer() {
    const classes = useStyles();
    const [time, setTime] = React.useState(0);

    React.useEffect(() => {
        let interval = setInterval(() => {
            setTime(prevState => {
                return prevState + 1;
            })
        }, 1000);

        return () => {
            clearInterval(interval);
        }
    }, []);

    const formatTime = (time) => {
        const getSeconds = `0${(time % 60)}`.slice(-2)
        const minutes = `${Math.floor(time / 60)}`
        const getMinutes = `0${minutes % 60}`.slice(-2)
        const getHours = `0${Math.floor(time / 3600)}`.slice(-2)

        return `${getHours} : ${getMinutes} : ${getSeconds}`
    }

    return (
        <Typography variant="h4" gutterBottom component="div" className={classes.timer} color="primary">
            Время: {formatTime(time)}
        </Typography>
    );
}