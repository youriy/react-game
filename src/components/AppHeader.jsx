import React from 'react';
import {useDispatch, useSelector} from "react-redux";
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import HelpIcon from '@mui/icons-material/HelpOutline';
import LanguageIcon from '@mui/icons-material/Language';
import PaletteIcon from '@mui/icons-material/Palette';
// Brightness4 — «луна» (включить тёмную тему), Brightness7 — «солнце» (включить светлую)
import DarkModeIcon from '@mui/icons-material/Brightness4';
import LightModeIcon from '@mui/icons-material/Brightness7';
// Иконка вибрации показывает текущее состояние: телефон с волнами — включена, перечёркнутый — выключена
import VibrationIcon from '@mui/icons-material/Vibration';
import VibrationOffIcon from '@mui/icons-material/MobileOff';
// Иконка звука тоже показывает текущее состояние: динамик с волнами — включён, перечёркнутый — выключен
import SoundIcon from '@mui/icons-material/VolumeUp';
import SoundOffIcon from '@mui/icons-material/VolumeOff';
import {setHowToPlay, setLanguage, setTheme, toggleDarkMode, toggleSound, toggleVibration} from "../store/gameSlice.js";
import {canVibrate} from "../core/vibration.js";
import {canPlaySound} from "../core/sound.js";
import {languageOptions} from "../dictionary/languages.js";
import {themeList} from "../core/themes.js";
import useTranslation from "../hooks/useTranslation.js";

const menuOrigin = {
    vertical: 'top',
    horizontal: 'right',
};

/**
 * Кнопка-иконка в шапке, открывающая меню выбора.
 * @param {Object} props
 * @param {string} props.id - id меню (для aria-controls)
 * @param {string} props.title - всплывающая подсказка
 * @param {string} props.ariaLabel - подпись для экранных дикторов
 * @param {React.ReactNode} props.icon - иконка кнопки
 * @param {Array<{value: string, label: React.ReactNode}>} props.options - пункты меню
 * @param {function(string): void} props.onSelect - вызывается со значением выбранного пункта
 */
function MenuButton({id, title, ariaLabel, icon, options, onSelect}) {
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleSelect = (value) => () => {
        setAnchorEl(null);
        onSelect(value);
    };

    return (
        <>
            <Tooltip title={title} arrow>
                <IconButton
                    size="large"
                    edge="end"
                    aria-label={ariaLabel}
                    aria-controls={id}
                    aria-haspopup="true"
                    onClick={(event) => setAnchorEl(event.currentTarget)}
                    color="inherit"
                >
                    {icon}
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                anchorOrigin={menuOrigin}
                id={id}
                keepMounted
                transformOrigin={menuOrigin}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
            >
                {
                    options.map(option =>
                        <MenuItem key={option.value} onClick={handleSelect(option.value)}>
                            {option.label}
                        </MenuItem>
                    )
                }
            </Menu>
        </>
    );
}

const languageMenuOptions = languageOptions.map(({code, label}) => ({value: code, label}));

const themeMenuOptions = themeList.map(({name, color, label}) => ({
    value: name,
    label: <Avatar sx={{bgcolor: color}}>{label}</Avatar>,
}));

/**
 * Шапка без полосы и названия: кнопки прижаты вправо прямо над фоном страницы.
 * Высота и отступы как у прежнего Toolbar variant="dense", чтобы поле не сдвинулось.
 * Иконки — основного цвета темы, чтобы были видны и на светлом, и на тёмном фоне.
 */
const headerSx = {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    // Небольшой зазор между кнопками (у IconButton с edge="end" отрицательный отступ справа)
    gap: "2px",
    minHeight: 48,
    px: {xs: 2, sm: 3},
    color: "primary.main",
};

/**
 * Шапка: кнопка «?» (окно «Как играть»), выбор языка, цвета, светлой/тёмной темы, звука и вибрации.
 * Выбранный здесь язык сохраняется и важнее языка браузера (см. detectBrowserLanguage в dictionary/languages.js).
 * Кнопка звука видна, если браузер умеет Web Audio (см. canPlaySound) — то есть почти всегда.
 * Кнопка вибрации видна только там, где вибрация возможна (телефон/планшет с Vibration API, см. canVibrate).
 */
export default function AppHeader() {
    const dispatch = useDispatch();
    const darkMode = useSelector(state => state.game.darkMode);
    const vibration = useSelector(state => state.game.vibration);
    const sound = useSelector(state => state.game.sound);
    const showVibration = React.useMemo(canVibrate, []);
    const showSound = React.useMemo(canPlaySound, []);
    const t = useTranslation();

    return (
        <Box component="header" sx={headerSx}>
            <Tooltip title={t.howToPlay} arrow>
                <IconButton
                    size="large"
                    edge="end"
                    aria-label="how to play"
                    onClick={() => dispatch(setHowToPlay(true))}
                    color="inherit"
                >
                    <HelpIcon/>
                </IconButton>
            </Tooltip>
            <MenuButton
                id="primary-language-menu"
                title={t.changeLanguage}
                ariaLabel="language change"
                icon={<LanguageIcon/>}
                options={languageMenuOptions}
                onSelect={(lang) => dispatch(setLanguage(lang))}
            />
            <MenuButton
                id="primary-theme-menu"
                title={t.theme}
                ariaLabel="theme change"
                icon={<PaletteIcon/>}
                options={themeMenuOptions}
                onSelect={(theme) => dispatch(setTheme(theme))}
            />
            <Tooltip title={darkMode ? t.lightMode : t.darkMode} arrow>
                <IconButton
                    size="large"
                    edge="end"
                    aria-label="dark mode toggle"
                    onClick={() => dispatch(toggleDarkMode())}
                    color="inherit"
                >
                    {darkMode ? <LightModeIcon/> : <DarkModeIcon/>}
                </IconButton>
            </Tooltip>
            {showSound &&
                <Tooltip title={sound ? t.soundOff : t.soundOn} arrow>
                    <IconButton
                        size="large"
                        edge="end"
                        aria-label="sound toggle"
                        aria-pressed={sound}
                        onClick={() => dispatch(toggleSound())}
                        color="inherit"
                    >
                        {sound ? <SoundIcon/> : <SoundOffIcon/>}
                    </IconButton>
                </Tooltip>
            }
            {showVibration &&
                <Tooltip title={vibration ? t.vibrationOff : t.vibrationOn} arrow>
                    <IconButton
                        size="large"
                        edge="end"
                        aria-label="vibration toggle"
                        aria-pressed={vibration}
                        onClick={() => dispatch(toggleVibration())}
                        color="inherit"
                    >
                        {vibration ? <VibrationIcon/> : <VibrationOffIcon/>}
                    </IconButton>
                </Tooltip>
            }
        </Box>
    );
}
