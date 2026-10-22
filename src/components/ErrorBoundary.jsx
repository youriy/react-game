import React from 'react';
import {useSelector} from "react-redux";
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import {createTheme, ThemeProvider} from '@mui/material/styles';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ReplayIcon from '@mui/icons-material/Replay';
import {createAppTheme} from "../core/themes.js";
import useTranslation from "../hooks/useTranslation.js";

/**
 * Тема для экрана ошибки: та же, что у игры. Если её не удалось создать (например, ошибка
 * как раз в теме — MUI #9), берётся стандартная тема MUI, чтобы экран ошибки точно отрисовался.
 * @param {string} name - имя темы из themeList
 * @param {boolean} darkMode - тёмный режим
 * @returns {import('@mui/material/styles').Theme}
 */
const createSafeTheme = (name, darkMode) => {
    try {
        return createAppTheme(name, darkMode);
    } catch (e) {
        return createTheme({palette: {mode: darkMode ? "dark" : "light"}});
    }
};

/**
 * Экран ошибки: «Что-то пошло не так» и кнопка «Начать заново» на языке и в теме игрока.
 * Кнопка перезагружает страницу: партия начинается с нуля, сохранённые результаты и настройки остаются.
 */
function ErrorScreen() {
    const t = useTranslation();
    const {theme, darkMode} = useSelector(state => ({
        theme: state.game.theme,
        darkMode: state.game.darkMode,
    }));
    const muiTheme = React.useMemo(() => createSafeTheme(theme, darkMode), [theme, darkMode]);

    return (
        <ThemeProvider theme={muiTheme}>
            <CssBaseline/>
            <Box
                role="alert"
                sx={{
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                    px: 2,
                    textAlign: "center",
                }}
            >
                <ErrorOutlineIcon color="primary" sx={{fontSize: 64}}/>
                <Typography variant="h4" component="h1" color="primary">{t.errorTitle}</Typography>
                <Typography color="text.secondary" sx={{maxWidth: 420}}>{t.errorText}</Typography>
                <Button
                    variant="contained"
                    size="large"
                    startIcon={<ReplayIcon/>}
                    onClick={() => window.location.reload()}
                >
                    {t.errorRestart}
                </Button>
            </Box>
        </ThemeProvider>
    );
}

/**
 * Перехватывает ошибки при отрисовке компонентов внутри себя и вместо белого экрана показывает ErrorScreen.
 * Ловит только ошибки отрисовки (render, хуки, жизненный цикл); ошибки в обработчиках кликов и таймерах
 * React сюда не передаёт — они не ломают экран, только пишутся в консоль.
 * Класс, а не функция: перехват ошибок в React есть только у классовых компонентов.
 */
export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {hasError: false};
    }

    static getDerivedStateFromError() {
        return {hasError: true};
    }

    componentDidCatch(error, info) {
        // Чтобы ошибку можно было найти в консоли браузера (в том числе у игрока)
        console.error("Ошибка в игре:", error, info.componentStack);
    }

    render() {
        return this.state.hasError ? <ErrorScreen/> : this.props.children;
    }
}
