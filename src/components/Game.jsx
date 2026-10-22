import React from 'react';
import {shallowEqual, useSelector} from "react-redux";
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import {ThemeProvider} from '@mui/material/styles';
import AppHeader from './AppHeader.jsx';
import GameArea from "./GameArea.jsx";
import StartGame from "./StartGame.jsx";
import {themes} from "../core/themes.js";

/**
 * Корневой компонент: тема оформления, шапка и либо игровое поле, либо стартовый экран.
 * Игровое поле получает key={round}, чтобы при новой партии создаваться заново.
 */
export default function Game() {
    // Только нужные поля: иначе приложение перерисовывалось бы целиком на каждый тик таймера
    const {gaming, theme, round} = useSelector(state => ({
        gaming: state.game.gaming,
        theme: state.game.theme,
        round: state.game.round,
    }), shallowEqual);

    return (
        <ThemeProvider theme={themes[theme] || themes.indigoTheme}>
            <CssBaseline/>
            <AppHeader/>
            <Container fixed>
                <Box sx={{display: "flex", justifyContent: "center"}}>
                    {/* key={round}: при новой партии поле создаётся заново (показ карточек, таймер) */}
                    {gaming ? <GameArea key={round}/> : <StartGame/>}
                </Box>
            </Container>
        </ThemeProvider>
    );
}
