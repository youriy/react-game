import React from 'react';
import {useDispatch, useSelector} from "react-redux";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';
import useMediaQuery from "@mui/material/useMediaQuery";
import CloseIcon from '@mui/icons-material/Close';
import {setAchievementsOpen} from "../store/gameSlice.js";
import {getMaxTier, getTextKeys, MEDALS, parseKey} from "../core/achievements.js";
import {getLevel} from "../core/levels.js";
import {playSound} from "../core/sound.js";
import useTranslation from "../hooks/useTranslation.js";

/** Сколько всплывашка видна, мс. */
const SHOW_MS = 8000;
/** Через сколько после победы она появляется (и звучит), мс: чтобы не сливаться со звуком победы. */
const DELAY_MS = 900;

/**
 * Всплывашка «Новое достижение!» на экране победы: какие достижения получены или улучшены этой партией
 * (state.game.newAchievements), со звуком (если он включён) и кнопкой «Все достижения».
 * Во время партии ничего не всплывает: список заполняется в finishGame. Показывается один раз на партию (round).
 */
export default function AchievementToast() {
    const dispatch = useDispatch();
    const {newAchievements, round, sound, achievements} = useSelector(state => state.game);
    const t = useTranslation();
    const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
    const [open, setOpen] = React.useState(false);

    React.useEffect(() => {
        if (newAchievements.length === 0) {
            return undefined;
        }

        const timeout = setTimeout(() => {
            setOpen(true);
            if (sound) {
                playSound("achievement");
            }
        }, DELAY_MS);

        return () => clearTimeout(timeout);
    }, [round]);

    // Окно «Достижения» открыли кнопкой в шапке — всплывашка не должна висеть поверх него
    React.useEffect(() => {
        if (achievements) {
            setOpen(false);
        }
    }, [achievements]);

    const close = (event, reason) => {
        // Клик мимо всплывашки её не закрывает — только крестик, кнопка или время
        if (reason !== "clickaway") {
            setOpen(false);
        }
    };

    const showAll = () => {
        setOpen(false);
        dispatch(setAchievementsOpen(true));
    };

    return (
        <Snackbar
            open={open}
            autoHideDuration={SHOW_MS}
            onClose={close}
            anchorOrigin={{vertical: "bottom", horizontal: "center"}}
            transitionDuration={reducedMotion ? 0 : undefined}
        >
            <Paper elevation={6} role="status" sx={{p: 2, pr: 1, display: "flex", gap: 1, alignItems: "flex-start", minWidth: {xs: 0, sm: 340}}}>
                <Box sx={{flex: 1}}>
                    <Typography variant="subtitle1" color="primary" sx={{fontWeight: 700}}>🏅 {t.newAchievement}</Typography>
                    <Box component="ul" sx={{m: 0, mb: 1, p: 0, listStyle: "none"}}>
                        {newAchievements.map(({key, tier}) => {
                            const {achievement, level} = parseKey(key);

                            return (
                                <Typography component="li" variant="body2" key={key}>
                                    {achievement.icon} {t[getTextKeys(achievement.id).title]}
                                    {level && <> · {t[getLevel(level).labelKey]}</>}
                                    {getMaxTier(achievement) > 1 && <> {MEDALS[tier - 1]}</>}
                                </Typography>
                            );
                        })}
                    </Box>
                    <Button size="small" variant="outlined" onClick={showAll}>{t.showAchievements}</Button>
                </Box>
                <IconButton size="small" aria-label={t.close} onClick={close}>
                    <CloseIcon fontSize="small"/>
                </IconButton>
            </Paper>
        </Snackbar>
    );
}
