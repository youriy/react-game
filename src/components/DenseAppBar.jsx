import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import LanguageIcon from '@mui/icons-material/Language';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Tooltip from '@mui/material/Tooltip';
import {useSelector, useDispatch} from "react-redux";
import {languageList} from "../core/Language";
import {setLanguage, setTheme} from "../store/gameSlice.jsx";
import PaletteIcon from '@mui/icons-material/Palette';
import Avatar from '@mui/material/Avatar';
import { green, orange, purple, blue, yellow, deepOrange, indigo } from '@mui/material/colors';

export default function DenseAppBar() {
    const {language} = useSelector(state => state.game);
    const dispatch = useDispatch();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const isMenuOpen = Boolean(anchorEl);
    const [anchorTheme, setAnchorTheme] = React.useState(null);
    const isThemeMenuOpen = Boolean(anchorTheme);

    const handleLanguageMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleLanguageMenuClose = (lang) => () => {
        setAnchorEl(null);
        dispatch(setLanguage(lang));
    };

    const handleLanguageMenuCloseBackdrop = () => {
        setAnchorEl(null);
    };

    const handleThemeMenuOpen = (event) => {
        setAnchorTheme(event.currentTarget);
    };

    const handleThemeMenuClose = (color) => () => {
        setAnchorTheme(null);
        dispatch(setTheme(color));
    };

    const handleThemeMenuCloseBackdrop = () => {
        setAnchorTheme(null);
    };

    const menuId = 'primary-language-menu';
    const renderMenu = (
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            id={menuId}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={isMenuOpen}
            onClose={handleLanguageMenuCloseBackdrop}
        >
            <MenuItem onClick={handleLanguageMenuClose("russian")}>Русский</MenuItem>
            <MenuItem onClick={handleLanguageMenuClose("english")}>English</MenuItem>
            <MenuItem onClick={handleLanguageMenuClose("chine")}>中國人</MenuItem>
            <MenuItem onClick={handleLanguageMenuClose("arabe")}>árabe</MenuItem>
            <MenuItem onClick={handleLanguageMenuClose("german")}>German</MenuItem>
            <MenuItem onClick={handleLanguageMenuClose("spanish")}>Español</MenuItem>
        </Menu>
    );

    const themeId = 'primary-theme-menu';
    const themeMenu = (
        <Menu
            anchorEl={anchorTheme}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            id={themeId}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={isThemeMenuOpen}
            onClose={handleThemeMenuCloseBackdrop}
        >
            <MenuItem onClick={handleThemeMenuClose("orangeTheme")}><Avatar sx={{ bgcolor: orange[500] }}>O</Avatar></MenuItem>
            <MenuItem onClick={handleThemeMenuClose("greenTheme")}><Avatar sx={{ bgcolor: green[500] }}>G</Avatar></MenuItem>
            <MenuItem onClick={handleThemeMenuClose("purpleTheme")}><Avatar sx={{ bgcolor: purple[500] }}>P</Avatar></MenuItem>
            <MenuItem onClick={handleThemeMenuClose("blueTheme")}><Avatar sx={{ bgcolor: blue[500] }}>B</Avatar></MenuItem>
            <MenuItem onClick={handleThemeMenuClose("yellowTheme")}><Avatar sx={{ bgcolor: yellow[500] }}>Y</Avatar></MenuItem>
            <MenuItem onClick={handleThemeMenuClose("deepOrangeTheme")}><Avatar sx={{ bgcolor: deepOrange[500] }}>DO</Avatar></MenuItem>
            <MenuItem onClick={handleThemeMenuClose("indigoTheme")}><Avatar sx={{ bgcolor: indigo[500] }}>I</Avatar></MenuItem>
        </Menu>
    );

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar variant="dense">
                    <Typography variant="h6" color="inherit" component="div">
                        {languageList[language].title}
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Box sx={{ display: { md: 'flex' } }}>
                        <Tooltip title={languageList[language].changeLanguage} arrow>
                            <IconButton
                                size="large"
                                edge="end"
                                aria-label="language change"
                                aria-controls={menuId}
                                aria-haspopup="true"
                                onClick={handleLanguageMenuOpen}
                                color="inherit"
                            >
                                <LanguageIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={languageList[language].theme} arrow>
                            <IconButton
                                size="large"
                                edge="end"
                                aria-label="language change"
                                aria-controls={themeId}
                                aria-haspopup="true"
                                onClick={handleThemeMenuOpen}
                                color="inherit"
                            >
                                <PaletteIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Toolbar>
            </AppBar>
            {renderMenu}
            {themeMenu}
        </Box>
    );
}