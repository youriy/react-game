import React from 'react';
import {useDispatch} from "react-redux";
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import LanguageIcon from '@mui/icons-material/Language';
import PaletteIcon from '@mui/icons-material/Palette';
import {setLanguage, setTheme} from "../store/gameSlice.jsx";
import {languageOptions} from "../core/Language";
import {themeList} from "../core/themes.js";
import useTranslation from "../core/useTranslation.js";

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

/** Шапка: название игры, выбор языка и выбор темы. */
export default function DenseAppBar() {
    const dispatch = useDispatch();
    const t = useTranslation();

    return (
        <Box sx={{flexGrow: 1}}>
            <AppBar position="static">
                <Toolbar variant="dense">
                    <Typography variant="h6" color="inherit" component="div">
                        {t.title}
                    </Typography>
                    <Box sx={{flexGrow: 1}}/>
                    <Box sx={{display: {md: 'flex'}}}>
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
                    </Box>
                </Toolbar>
            </AppBar>
        </Box>
    );
}
