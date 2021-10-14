import React from 'react';
import DenseAppBar from './DenseAppBar.jsx'
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { makeStyles } from "@mui/styles";
import GameArea from "./GameArea.jsx";
import {useSelector} from "react-redux";
import StartGame from "./StartGame.jsx";

const useStyles = makeStyles((theme) => ({
    box: {
        display: "flex",
        justifyContent: "center",
    },
}));

export default function Game() {
    const classes = useStyles();
    const game = useSelector(state => state.game);

    return (
        <div>
            <DenseAppBar/>
            <CssBaseline />
            <Container fixed>
                <Box className={classes.box}>
                    {
                        game.gaming ? (
                            <GameArea/>
                        ) : (
                            <StartGame/>
                        )
                    }
                </Box>
            </Container>
        </div>
    );
}