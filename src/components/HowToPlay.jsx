import React from 'react';
import {shallowEqual, useDispatch, useSelector} from "react-redux";
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import HelpIcon from '@mui/icons-material/HelpOutline';
import {setHowToPlay, setPaused} from "../store/gameSlice.js";
import {saveSetting} from "../core/storage.js";
import {HINT_PENALTY} from "../core/score.js";
import useTranslation from "../hooks/useTranslation.js";

/** Ключи шагов в languageList, по порядку. */
const STEPS = ["howToPlayStep1", "howToPlayStep2", "howToPlayStep3", "howToPlayStep4"];

/**
 * Окно «Как играть»: четыре коротких шага с правилами.
 * Открывается само при первом запуске (пока в localStorage нет `howToPlaySeen`) и кнопкой «?» в шапке.
 * При закрытии ставится `howToPlaySeen`, и само окно больше не появляется.
 * Если окно открыли во время партии, партия встаёт на паузу, а после закрытия продолжается
 * (если до этого паузы не было) — как с окнами подтверждения в GameControls.
 */
export default function HowToPlay() {
    const dispatch = useDispatch();
    const {open, gaming, paused} = useSelector(state => ({
        open: state.game.howToPlay,
        gaming: state.game.gaming,
        paused: state.game.paused,
    }), shallowEqual);
    const t = useTranslation();
    // Пауза поставлена этим окном — значит, при закрытии её надо снять
    const pausedByDialog = React.useRef(false);

    React.useEffect(() => {
        if (open && gaming && !paused) {
            pausedByDialog.current = true;
            dispatch(setPaused(true));
        }
    }, [open]);

    const close = () => {
        dispatch(setHowToPlay(false));
        saveSetting("howToPlaySeen", "true");

        if (pausedByDialog.current) {
            pausedByDialog.current = false;
            dispatch(setPaused(false));
        }
    };

    return (
        <Dialog open={open} onClose={close} fullWidth maxWidth="xs" aria-labelledby="how-to-play-title">
            <DialogTitle id="how-to-play-title" sx={{display: "flex", alignItems: "center", gap: 1}}>
                <HelpIcon color="primary"/>
                {t.howToPlay}
            </DialogTitle>
            <DialogContent>
                <Box component="ol" sx={{m: 0, p: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 2}}>
                    {STEPS.map((key, index) =>
                        <Box component="li" key={key} sx={{display: "flex", alignItems: "flex-start", gap: 1.5}}>
                            <Avatar sx={{bgcolor: "primary.main", color: "primary.contrastText", width: 28, height: 28, fontSize: 15, flexShrink: 0}}>
                                {index + 1}
                            </Avatar>
                            <Typography variant="body1">
                                {t[key].replace("{penalty}", HINT_PENALTY)}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </DialogContent>
            <DialogActions sx={{px: 3, pb: 2}}>
                <Button variant="contained" onClick={close} autoFocus>
                    {t.howToPlayOk}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
