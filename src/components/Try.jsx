import React from 'react';
import Typography from '@mui/material/Typography';
import { makeStyles } from "@mui/styles";
import {useSelector} from "react-redux";
import {languageList} from "../core/Language";

const useStyles = makeStyles((theme) => ({
    try: {
        textAlign: "center",
        marginTop: "20px!important",
    },
}));

export default function Try() {
    const classes = useStyles();
    const {count, language} = useSelector(state => state.game);

    return (
        <Typography variant="h4" gutterBottom component="div" className={classes.try} color="primary">
            {languageList[language].try}: {count}
        </Typography>
    );
}