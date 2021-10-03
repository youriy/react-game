import React from 'react';
import Typography from '@mui/material/Typography';
import { makeStyles } from "@mui/styles";
import Helper from "../core/Helper.jsx";

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

    return (
        <Typography variant="h4" gutterBottom component="div" className={classes.timer} color="primary">
            {time}
        </Typography>
    );
}