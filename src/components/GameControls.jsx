import React from 'react';
import {useDispatch, useSelector} from "react-redux";
import Button from '@mui/material/Button';
import Stack from "@mui/material/Stack";
import ReplayIcon from '@mui/icons-material/Replay';
import FlagIcon from '@mui/icons-material/Flag';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import {giveUp, setPaused, startNewRound} from "../store/gameSlice.jsx";
import {resetItems} from "../store/itemsSlice.jsx";
import useTranslation from "../core/useTranslation.js";
import {HINT_PENALTY} from "../core/score.js";

/**
 * Кнопки управления партией: «Пауза», «Подсказка», «Заново», «Сдаться».
 * Также: пауза по Esc, автопауза при скрытии вкладки, окно подтверждения перед «Заново» и «Сдаться»
 * (пока окно открыто, партия на паузе).
 *
 * @param {Object} props
 * @param {boolean} props.canPause - можно ли ставить паузу (false, пока карточки показываются)
 * @param {boolean} props.canHint - доступна ли подсказка
 * @param {function(): void} props.onHint - взять подсказку
 */
export default function GameControls({canPause, canHint, onHint}) {
    const dispatch = useDispatch();
    const paused = useSelector(state => state.game.paused);
    const level = useSelector(state => state.game.level);
    const t = useTranslation();
    // Окно подтверждения: open — показано ли, action — для какой кнопки,
    // wasPaused — стояла ли игра на паузе до открытия окна.
    // action не сбрасывается при закрытии, чтобы текст не пропадал во время анимации.
    const [confirm, setConfirm] = React.useState({open: false, action: "giveUp", wasPaused: false});

    /**
     * Открывает окно подтверждения и ставит партию на паузу (таймер стоит, поле скрыто).
     * @param {'restart'|'giveUp'} action - для какой кнопки окно
     */
    const askConfirm = (action) => {
        setConfirm({open: true, action, wasPaused: paused});

        if (!paused) {
            dispatch(setPaused(true));
        }
    };

    /** «Отмена»: закрывает окно и возвращает паузу в состояние до его открытия. */
    const cancelConfirm = () => {
        setConfirm(prev => ({...prev, open: false}));

        if (!confirm.wasPaused) {
            dispatch(setPaused(false));
        }
    };

    /** Новая партия на том же уровне: свежая колода и обнулённые счётчики. */
    const handleRestart = () => {
        dispatch(resetItems(level));
        dispatch(startNewRound());
    };

    /** Что показывать и делать в окне подтверждения для каждой кнопки. */
    const confirmActions = {
        restart: {
            title: t.restartConfirm,
            label: t.restart,
            icon: <ReplayIcon/>,
            color: "primary",
            onConfirm: handleRestart,
        },
        giveUp: {
            title: t.giveUpConfirm,
            label: t.giveUp,
            icon: <FlagIcon/>,
            color: "error",
            onConfirm: () => dispatch(giveUp()),
        },
    };
    const current = confirmActions[confirm.action];

    // Esc ставит/снимает паузу
    React.useEffect(() => {
        if (!canPause) {
            return;
        }

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                dispatch(setPaused(!paused));
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [canPause, paused]);

    // Автопауза, когда вкладку скрыли или окно свернули
    React.useEffect(() => {
        if (!canPause) {
            return;
        }

        const handleVisibilityChange = () => {
            if (document.hidden) {
                dispatch(setPaused(true));
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [canPause]);

    return (
        <Stack direction="row" spacing={2} sx={{justifyContent: "center", pb: 2}}>
            <Button
                variant="outlined"
                startIcon={paused ? <PlayArrowIcon/> : <PauseIcon/>}
                onClick={() => dispatch(setPaused(!paused))}
                disabled={!canPause}
            >
                {paused ? t.resume : t.pause}
            </Button>
            <Tooltip title={`${t.hintPenalty}: −${HINT_PENALTY}`} arrow>
                {/* span нужен, чтобы подсказка показывалась и у неактивной кнопки */}
                <span>
                    <Button variant="outlined" color="warning" startIcon={<LightbulbIcon/>} onClick={onHint} disabled={!canHint}>
                        {t.hint}
                    </Button>
                </span>
            </Tooltip>
            <Button variant="outlined" startIcon={<ReplayIcon/>} onClick={() => askConfirm("restart")}>
                {t.restart}
            </Button>
            <Button variant="outlined" color="error" startIcon={<FlagIcon/>} onClick={() => askConfirm("giveUp")}>
                {t.giveUp}
            </Button>
            {/* Подтверждение, чтобы не потерять партию случайным кликом */}
            <Dialog open={confirm.open} onClose={cancelConfirm}>
                <DialogTitle>{current.title}</DialogTitle>
                <DialogActions>
                    <Button onClick={cancelConfirm} autoFocus>
                        {t.cancel}
                    </Button>
                    <Button
                        color={current.color}
                        variant="contained"
                        startIcon={current.icon}
                        onClick={() => {
                            // «Заново» и «Сдаться» сами снимают паузу
                            setConfirm(prev => ({...prev, open: false}));
                            current.onConfirm();
                        }}
                    >
                        {current.label}
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
}
