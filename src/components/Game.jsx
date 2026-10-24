import React from 'react';
import {shallowEqual, useSelector} from "react-redux";
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import {ThemeProvider} from '@mui/material/styles';
import {keyframes} from '@emotion/react';
import AppHeader from './AppHeader.jsx';
import GameArea from "./GameArea.jsx";
import StartGame from "./StartGame.jsx";
import HowToPlay from "./HowToPlay.jsx";
import Achievements from "./Achievements.jsx";
import {createAppTheme} from "../core/themes.js";

/** Длительность появления экрана, мс. */
const SCREEN_FADE_TIME = 300;

/** Появление экрана: проявляется из прозрачного с лёгким приближением. */
const screenAppear = keyframes`
    from {
        opacity: 0;
        transform: scale(0.98);
    }
    to {
        opacity: 1;
        transform: none;
    }
`;

/**
 * Обёртка экрана с анимацией появления. Без анимации, если в системе включено «уменьшить движение».
 * Только появление: старый экран исчезает сразу, чтобы не задерживать начало игры.
 */
const screenSx = {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    animation: `${screenAppear} ${SCREEN_FADE_TIME}ms ease-out`,
    "@media (prefers-reduced-motion: reduce)": {
        animation: "none",
    },
};

/**
 * Корневой компонент: тема оформления (цвет + светлый/тёмный режим), шапка и либо игровое поле, либо стартовый экран.
 * Поверх них — окно «Как играть» (HowToPlay), открывается при первом запуске и кнопкой «?» в шапке,
 * и окно «Достижения» (Achievements, с вкладкой «Награды»), открывается кнопкой-кубком в шапке.
 * Игровое поле получает key={round}, чтобы при новой партии создаваться заново.
 * При смене экрана (старт ↔ игра, новая партия) новый экран плавно появляется (screenAppear).
 */
export default function Game() {
    // Только нужные поля: иначе приложение перерисовывалось бы целиком на каждый тик таймера
    const {gaming, theme, darkMode, round} = useSelector(state => ({
        gaming: state.game.gaming,
        theme: state.game.theme,
        darkMode: state.game.darkMode,
        round: state.game.round,
    }), shallowEqual);
    // Тема пересоздаётся только при смене цвета или режима
    const muiTheme = React.useMemo(() => createAppTheme(theme, darkMode), [theme, darkMode]);

    return (
        <ThemeProvider theme={muiTheme}>
            <CssBaseline/>
            <AppHeader/>
            <Container fixed>
                <Box sx={{display: "flex", justifyContent: "center"}}>
                    {/* key у обёртки меняется при смене экрана — React создаёт её заново, и анимация появления
                        проигрывается снова; key={round} у поля — при новой партии оно создаётся заново (показ карточек, таймер) */}
                    <Box key={gaming ? `game-${round}` : `start-${round}`} sx={screenSx}>
                        {gaming ? <GameArea key={round}/> : <StartGame/>}
                    </Box>
                </Box>
            </Container>
            <HowToPlay/>
            <Achievements/>
        </ThemeProvider>
    );
}
