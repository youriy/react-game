import React from 'react';
import Grid from '@mui/material/Grid';
import Stack from "@mui/material/Stack";
import Timer from "./Timer.jsx";
import Try from "./Try.jsx";
import MemoryCard from "./MemoryCard.jsx";
import useMemoryGame from "../core/useMemoryGame.js";

const statusSx = {
    justifyContent: "center",
    "& .MuiTypography-root": {
        width: 380,
    }
};

export default function GameArea() {
    const {items, preview, openItem} = useMemoryGame();

    return (
        <Stack spacing={1}>
            <Stack sx={statusSx} spacing={15} direction="row">
                {/* Таймер запускается только после того, как карточки закроются */}
                <Timer running={!preview}/>
                <Try/>
            </Stack>
            <Grid container spacing={2}>
                {
                    items.map((item, index) =>
                        <Grid item xs={2} key={item.id}>
                            <MemoryCard
                                item={item}
                                revealed={item.open || preview}
                                disabled={preview}
                                onClick={() => openItem(index)}
                            />
                        </Grid>
                    )
                }
            </Grid>
        </Stack>
    );
}
