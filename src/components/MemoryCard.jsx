import React from 'react';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grow from '@mui/material/Grow';
import Zoom from '@mui/material/Zoom';
import {cardIcons} from "../core/icons.js";

const cardSx = {
    "&:hover": {
        transform: "scale(1.07)!important",
    }
};

// Одна карточка игрового поля
export default function MemoryCard({item, revealed, disabled, onClick}) {
    const Icon = cardIcons[item.icon];

    return (
        <Zoom in={!item.delete}>
            <Card
                sx={cardSx}
                onClick={onClick}
                style={disabled ? {pointerEvents: "none"} : undefined}
            >
                <CardActionArea>
                    <CardContent>
                        <Grow in={revealed}>
                            <Typography textAlign="center" variant="body1" color="text.secondary">
                                <Icon sx={{fontSize: 60}}/>
                            </Typography>
                        </Grow>
                    </CardContent>
                </CardActionArea>
            </Card>
        </Zoom>
    );
}
