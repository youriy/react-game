import React from 'react';
import DenseAppBar from './DenseAppBar.jsx'
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { makeStyles } from "@mui/styles";
import GameArea from "./GameArea.jsx";
import {useSelector} from "react-redux";
import StartGame from "./StartGame.jsx";
import { ThemeProvider } from '@mui/material/styles';
import { themes} from "../core/Themes"

const useStyles = makeStyles((theme) => ({
    box: {
        display: "flex",
        justifyContent: "center",
    },
}));

export default function Game() {
    const classes = useStyles();
    const {gaming, theme} = useSelector(state => state.game);

    return (
        <div>
            <ThemeProvider theme={themes[theme]}>
                <DenseAppBar/>
                <CssBaseline />
                <Container fixed>
                    <Box className={classes.box}>
                        {
                            gaming ? (
                                <GameArea/>
                            ) : (
                                <StartGame/>
                            )
                        }
                    </Box>
                </Container>
            </ThemeProvider>
        </div>
    );
}