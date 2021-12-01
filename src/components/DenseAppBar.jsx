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
import {setLanguage} from "../store/gameSlice.jsx";

export default function DenseAppBar() {
    const {language} = useSelector(state => state.game);
    const dispatch = useDispatch();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const isMenuOpen = Boolean(anchorEl);

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = (lang) => () => {
        setAnchorEl(null);
        dispatch(setLanguage(lang));
    };

    const menuId = 'primary-search-account-menu';
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
            onClose={handleMenuClose}
        >
            <MenuItem onClick={handleMenuClose("russian")}>Русский</MenuItem>
            <MenuItem onClick={handleMenuClose("english")}>English</MenuItem>
            <MenuItem onClick={handleMenuClose("chine")}>中國人</MenuItem>
            <MenuItem onClick={handleMenuClose("arabe")}>árabe</MenuItem>
            <MenuItem onClick={handleMenuClose("german")}>German</MenuItem>
            <MenuItem onClick={handleMenuClose("spanish")}>Español</MenuItem>
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
                    <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
                        <Tooltip title={languageList[language].changeLanguage} arrow>
                            <IconButton
                                size="large"
                                edge="end"
                                aria-label="language change"
                                aria-controls={menuId}
                                aria-haspopup="true"
                                onClick={handleProfileMenuOpen}
                                color="inherit"
                            >
                                <LanguageIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Toolbar>
            </AppBar>
            {renderMenu}
        </Box>
    );
}