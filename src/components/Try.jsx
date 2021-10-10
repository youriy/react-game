import React from 'react';
import Typography from '@mui/material/Typography';
import { makeStyles } from "@mui/styles";
import {useSelector} from "react-redux";

const useStyles = makeStyles((theme) => ({
    try: {
        textAlign: "center",
        marginTop: "20px!important",
    },
}));

export default function Try() {
    const classes = useStyles();
    const count = useSelector(state => state.try.count);

    return (
        <Typography variant="h4" gutterBottom component="div" className={classes.try} color="primary">
            Попытки: {count}
        </Typography>
    );
}