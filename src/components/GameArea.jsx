import React from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import {CardActionArea} from '@mui/material';
import Grow from '@mui/material/Grow';
import Timer from "./Timer.jsx";
import Try from "./Try.jsx";
import Stack from "@mui/material/Stack";
import {useDispatch, useSelector} from "react-redux";
import {setClose, setDelete, setOpen} from "../store/itemsSlice.jsx";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import AdbIcon from "@mui/icons-material/Adb";
import AirplanemodeActiveIcon from "@mui/icons-material/AirplanemodeActive";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import BuildIcon from "@mui/icons-material/Build";
import CloudIcon from "@mui/icons-material/Cloud";
import ComputerIcon from "@mui/icons-material/Computer";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import ExtensionIcon from "@mui/icons-material/Extension";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import LocalPostOfficeIcon from "@mui/icons-material/LocalPostOffice";
import MoodIcon from "@mui/icons-material/Mood";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ParkIcon from "@mui/icons-material/Park";
import SchoolIcon from "@mui/icons-material/School";
import {incrementTry} from "../store/gameSlice.jsx";
import { makeStyles } from "@mui/styles";
import Zoom from '@mui/material/Zoom';

const useStyles = makeStyles((theme) => ({
    status: {
        justifyContent: "center",
        "& .MuiTypography-root": {
            width: 380,
        }
    },
    card:{
        "&:hover": {
            transform: "scale(1.07)!important",
        }
    }
}));

const icons = {
    AcUnitIcon: <AcUnitIcon sx={{ fontSize: 60 }}/>,
    AdbIcon: <AdbIcon sx={{ fontSize: 60 }}/>,
    AirplanemodeActiveIcon: <AirplanemodeActiveIcon sx={{ fontSize: 60 }}/>,
    Brightness7Icon: <Brightness7Icon sx={{ fontSize: 60 }}/>,
    BuildIcon: <BuildIcon sx={{ fontSize: 60 }}/>,
    CloudIcon: <CloudIcon sx={{ fontSize: 60 }}/>,
    ComputerIcon: <ComputerIcon sx={{ fontSize: 60 }}/>,
    DirectionsCarIcon: <DirectionsCarIcon sx={{ fontSize: 60 }}/>,
    DirectionsBoatIcon: <DirectionsBoatIcon sx={{ fontSize: 60 }}/>,
    ExtensionIcon: <ExtensionIcon sx={{ fontSize: 60 }}/>,
    FlashOnIcon: <FlashOnIcon sx={{ fontSize: 60 }}/>,
    LocalFireDepartmentIcon: <LocalFireDepartmentIcon sx={{ fontSize: 60 }}/>,
    LocalFloristIcon: <LocalFloristIcon sx={{ fontSize: 60 }}/>,
    LocalPostOfficeIcon: <LocalPostOfficeIcon sx={{ fontSize: 60 }}/>,
    MoodIcon: <MoodIcon sx={{ fontSize: 60 }}/>,
    NotificationsIcon: <NotificationsIcon sx={{ fontSize: 60 }}/>,
    ParkIcon: <ParkIcon sx={{ fontSize: 60 }}/>,
    SchoolIcon: <SchoolIcon sx={{ fontSize: 60 }}/>,
};

const as = () => {
    return async dispatch => {
        setTimeout(() => {
            dispatch(setOpen(5));
            console.log("test");
        }, 2000);
    }
}


export default function GameArea() {
    const classes = useStyles();
    const dispatch = useDispatch();
    const items = useSelector(state => state.items);
    let clickable = true;

    const handleClickOpenItem = (id) => () => {
        dispatch(as());
        if (clickable) {
            dispatch(setOpen(id))
        }
    }

    React.useEffect(() => {
        let arr = items.filter(it => it.open === true);

        if (arr.length === 2) {
            // eslint-disable-next-line react-hooks/exhaustive-deps
            clickable = false;
            let index1 = items.indexOf(arr[0]);
            let index2 = items.indexOf(arr[1]);

            if (items[index1].type === items[index2].type) {
                setTimeout(() => {
                    dispatch(setDelete(index1));
                    dispatch(setDelete(index2));
                    clickable = true;
                    }, 600);
            } else {
                setTimeout(() => {
                    dispatch(setClose(index1));
                    dispatch(setClose(index2));
                    clickable = true;
                    }, 600);
            }

            dispatch(incrementTry())
        }

        let arrClose = items.filter(it => it.delete === false);

        if (arrClose.length === 0) {
            console.log("Победа")
        }

    }, [items])

    return (
        <Stack spacing={1}>
            <Stack className={classes.status} spacing={15} direction="row">
                <Timer/>
                <Try/>
            </Stack>
            <Grid container spacing={2}>
                {
                    items.map((it, index) =>
                        <Grid item xs={2} key={it.id}>
                            <Zoom in={!it.delete}>
                                <Card className={classes.card} onClick={handleClickOpenItem(index)}>
                                    <CardActionArea>
                                        <CardContent>
                                            <Grow in={it.open}>
                                                <Typography textAlign="center" variant="body1" color="text.secondary">
                                                    {icons[it.icon]}
                                                </Typography>
                                            </Grow>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Zoom>
                        </Grid>
                    )
                }
            </Grid>
        </Stack>
    );
}