import React from 'react';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import AdbIcon from '@mui/icons-material/Adb';
import AirplanemodeActiveIcon from '@mui/icons-material/AirplanemodeActive';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import BuildIcon from '@mui/icons-material/Build';
import CloudIcon from '@mui/icons-material/Cloud';
import ComputerIcon from '@mui/icons-material/Computer';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import ExtensionIcon from '@mui/icons-material/Extension';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import LocalPostOfficeIcon from '@mui/icons-material/LocalPostOffice';
import MoodIcon from '@mui/icons-material/Mood';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ParkIcon from '@mui/icons-material/Park';
import SchoolIcon from '@mui/icons-material/School';


const Item = styled(Paper)(({ theme }) => ({
    ...theme.typography.body2,
    padding: theme.spacing(1),
    display: "flex",
    alignItems: "center",
    height: 100,
    justifyContent: "center",
    color: theme.palette.text.secondary,
}));

const nps = [
    { id: 0, type: 1, icon: <AcUnitIcon sx={{ fontSize: 60 }}/>},
    { id: 1, type: 1, icon: <AcUnitIcon sx={{ fontSize: 60 }}/>},
    { id: 2, type: 2, icon: <AdbIcon sx={{ fontSize: 60 }}/>},
    { id: 3, type: 2, icon: <AdbIcon sx={{ fontSize: 60 }}/>},
    { id: 4, type: 3, icon: <AirplanemodeActiveIcon sx={{ fontSize: 60 }}/>},
    { id: 5, type: 3, icon: <AirplanemodeActiveIcon sx={{ fontSize: 60 }}/>},
    { id: 6, type: 4, icon: <Brightness7Icon sx={{ fontSize: 60 }}/>},
    { id: 7, type: 4, icon: <Brightness7Icon sx={{ fontSize: 60 }}/>},
    { id: 8, type: 5, icon: <BuildIcon sx={{ fontSize: 60 }}/>},
    { id: 9, type: 5, icon: <BuildIcon sx={{ fontSize: 60 }}/>},
    { id: 10, type: 6, icon: <CloudIcon sx={{ fontSize: 60 }}/>},
    { id: 11, type: 6, icon: <CloudIcon sx={{ fontSize: 60 }}/>},
    { id: 12, type: 7, icon: <ComputerIcon sx={{ fontSize: 60 }}/>},
    { id: 13, type: 7, icon: <ComputerIcon sx={{ fontSize: 60 }}/>},
    { id: 14, type: 8, icon: <DirectionsCarIcon sx={{ fontSize: 60 }}/>},
    { id: 15, type: 8, icon: <DirectionsCarIcon sx={{ fontSize: 60 }}/>},
    { id: 16, type: 9, icon: <DirectionsBoatIcon sx={{ fontSize: 60 }}/>},
    { id: 17, type: 9, icon: <DirectionsBoatIcon sx={{ fontSize: 60 }}/>},
    { id: 18, type: 10, icon: <ExtensionIcon sx={{ fontSize: 60 }}/>},
    { id: 19, type: 10, icon: <ExtensionIcon sx={{ fontSize: 60 }}/>},
    { id: 20, type: 11, icon: <FlashOnIcon sx={{ fontSize: 60 }}/>},
    { id: 21, type: 11, icon: <FlashOnIcon sx={{ fontSize: 60 }}/>},
    { id: 22, type: 12, icon: <LocalFireDepartmentIcon sx={{ fontSize: 60 }}/>},
    { id: 23, type: 12, icon: <LocalFireDepartmentIcon sx={{ fontSize: 60 }}/>},
    { id: 24, type: 13, icon: <LocalFloristIcon sx={{ fontSize: 60 }}/>},
    { id: 25, type: 13, icon: <LocalFloristIcon sx={{ fontSize: 60 }}/>},
    { id: 26, type: 14, icon: <LocalPostOfficeIcon sx={{ fontSize: 60 }}/>},
    { id: 27, type: 14, icon: <LocalPostOfficeIcon sx={{ fontSize: 60 }}/>},
    { id: 28, type: 15, icon: <MoodIcon sx={{ fontSize: 60 }}/>},
    { id: 29, type: 15, icon: <MoodIcon sx={{ fontSize: 60 }}/>},
    { id: 30, type: 16, icon: <NotificationsIcon sx={{ fontSize: 60 }}/>},
    { id: 31, type: 16, icon: <NotificationsIcon sx={{ fontSize: 60 }}/>},
    { id: 32, type: 17, icon: <ParkIcon sx={{ fontSize: 60 }}/>},
    { id: 33, type: 17, icon: <ParkIcon sx={{ fontSize: 60 }}/>},
    { id: 34, type: 18, icon: <SchoolIcon sx={{ fontSize: 60 }}/>},
    { id: 35, type: 18, icon: <SchoolIcon sx={{ fontSize: 60 }}/>},
];

export default function GameArea() {

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }

        return array;
    }

    return (
        <Grid container spacing={2}>
            {shuffle(nps).map((it) =>
                    <Grid item xs={2}>
                        <Item>{it.icon}</Item>
                    </Grid>
                )}
        </Grid>
    );
}