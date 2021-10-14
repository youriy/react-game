import React from 'react';
import {useDispatch, useSelector} from "react-redux";
import Button from '@mui/material/Button';
import Stack from "@mui/material/Stack";
import Typography from '@mui/material/Typography';
import {setGaming, setWin} from "../store/gameSlice.jsx";
import {resetItems} from "../store/itemsSlice.jsx";

export default function StartGame() {
    const dispatch = useDispatch();
    const game = useSelector(state => state.game);

    const handleChangeGaming = () => {
        if (game.win) {
            dispatch(resetItems());
        }

        dispatch(setGaming(true));
        dispatch(setWin(false));
        console.log(game.gaming);
    };

    return (
        <div>
            <Stack spacing={3}>
                {
                    game.win &&
                    <Typography variant="h1" component="div" gutterBottom color="primary">
                        Победа!
                    </Typography>
                }
                <Button variant="contained" size="large" onClick={handleChangeGaming}>
                    Начать игру
                </Button>
            </Stack>
        </div>
    );
}