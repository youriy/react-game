import React from 'react';
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
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import {CardActionArea, Fade} from '@mui/material';
import Grow from '@mui/material/Grow';


const nps = [
    { id: 0, type: 1, icon: <AcUnitIcon sx={{ fontSize: 60 }}/>, open: false, delete: false},
    { id: 1, type: 1, icon: <AcUnitIcon sx={{ fontSize: 60 }}/>, open: false, delete: false},
    { id: 2, type: 2, icon: <AdbIcon sx={{ fontSize: 60 }}/>, open: false, delete: false},
    { id: 3, type: 2, icon: <AdbIcon sx={{ fontSize: 60 }}/>, open: false, delete: false},
    { id: 4, type: 3, icon: <AirplanemodeActiveIcon sx={{ fontSize: 60 }}/>, open: false, delete: false},
    { id: 5, type: 3, icon: <AirplanemodeActiveIcon sx={{ fontSize: 60 }}/>, open: false, delete: false},
    { id: 6, type: 4, icon: <Brightness7Icon sx={{ fontSize: 60 }}/>, open: false, delete: false},
    { id: 7, type: 4, icon: <Brightness7Icon sx={{ fontSize: 60 }}/>, open: false, delete: false},
    { id: 8, type: 5, icon: <BuildIcon sx={{ fontSize: 60 }}/>, open: false, delete: false},
    { id: 9, type: 5, icon: <BuildIcon sx={{ fontSize: 60 }}/>, open: false, delete: false},
    { id: 10, type: 6, icon: <CloudIcon sx={{ fontSize: 60 }}/>, open: false, delete: false},
    { id: 11, type: 6, icon: <CloudIcon sx={{ fontSize: 60 }}/>, open: false, delete: false},
    { id: 12, type: 7, icon: <ComputerIcon sx={{ fontSize: 60 }}/>, open: false, delete: false},
    { id: 13, type: 7, icon: <ComputerIcon sx={{ fontSize: 60 }}/>, open: false, delete: false},
    { id: 14, type: 8, icon: <DirectionsCarIcon sx={{ fontSize: 60 }}/>, open: false, delete: false},
    { id: 15, type: 8, icon: <DirectionsCarIcon sx={{ fontSize: 60 }}/>, open: false, delete: false},
    { id: 16, type: 9, icon: <DirectionsBoatIcon sx={{ fontSize: 60 }}/>, open: false, delete: false},
    { id: 17, type: 9, icon: <DirectionsBoatIcon sx={{ fontSize: 60 }}/>, open: false, delete: false},
    { id: 18, type: 10, icon: <ExtensionIcon sx={{ fontSize: 60 }}/>, open: false, delete: false},
    { id: 19, type: 10, icon: <ExtensionIcon sx={{ fontSize: 60 }}/>, open: false, delete: false},
    { id: 20, type: 11, icon: <FlashOnIcon sx={{ fontSize: 60 }}/>, open: false, delete: false},
    { id: 21, type: 11, icon: <FlashOnIcon sx={{ fontSize: 60 }}/>, open: false, delete: false},
    { id: 22, type: 12, icon: <LocalFireDepartmentIcon sx={{ fontSize: 60 }}/>, open: false, delete: false},
    { id: 23, type: 12, icon: <LocalFireDepartmentIcon sx={{ fontSize: 60 }}/>, open: false, delete: false},
    { id: 24, type: 13, icon: <LocalFloristIcon sx={{ fontSize: 60 }}/>, open: false, delete: false},
    { id: 25, type: 13, icon: <LocalFloristIcon sx={{ fontSize: 60 }}/>, open: false, delete: false},
    { id: 26, type: 14, icon: <LocalPostOfficeIcon sx={{ fontSize: 60 }}/>, open: false, delete: false},
    { id: 27, type: 14, icon: <LocalPostOfficeIcon sx={{ fontSize: 60 }}/>, open: false, delete: false},
    { id: 28, type: 15, icon: <MoodIcon sx={{ fontSize: 60 }}/>, open: false, delete: false},
    { id: 29, type: 15, icon: <MoodIcon sx={{ fontSize: 60 }}/>, open: false, delete: false},
    { id: 30, type: 16, icon: <NotificationsIcon sx={{ fontSize: 60 }}/>, open: false, delete: false},
    { id: 31, type: 16, icon: <NotificationsIcon sx={{ fontSize: 60 }}/>, open: false, delete: false},
    { id: 32, type: 17, icon: <ParkIcon sx={{ fontSize: 60 }}/>, open: false, delete: false},
    { id: 33, type: 17, icon: <ParkIcon sx={{ fontSize: 60 }}/>, open: false, delete: false},
    { id: 34, type: 18, icon: <SchoolIcon sx={{ fontSize: 60 }}/>, open: false, delete: false},
    { id: 35, type: 18, icon: <SchoolIcon sx={{ fontSize: 60 }}/>, open: false, delete: false},
];

export default function GameArea() {
    const [items, setItems] = React.useState(shuffle(nps));

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }

        return array;
    }

    const handleClickOpenItem = (id) => () => {
        setItems(prevState => {
            prevState[id].open = true;
            return [...prevState]
        });
    }

    React.useEffect(() => {
      let arr = items.filter(it => it.open === true);

      if (arr.length === 2) {
          let index1 = items.indexOf(arr[0]);
          let index2 = items.indexOf(arr[1]);

          if (items[index1].type === items[index2].type) {
              setItems(prevState => {
                  prevState[index1].open = false;
                  prevState[index1].delete = true
                  prevState[index2].open = false;
                  prevState[index2].delete = true
                  return [...prevState]
              });
          } else {
              setItems(prevState => {
                  prevState[index1].open = false;
                  prevState[index2].open = false;
                  return [...prevState]
              });
          }
      }
    }, [items])

    return (
        <Grid container spacing={2}>
            {
                items.map((it, index) =>
                    <Grid item xs={2} key={it.id}>
                        <Fade in={!it.delete}>
                            <Card onClick={handleClickOpenItem(index)}>
                                <CardActionArea>
                                    <CardContent>
                                        <Grow in={it.open}>
                                            <Typography textAlign="center" variant="body1" color="text.secondary">
                                                {it.icon}
                                            </Typography>
                                        </Grow>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Fade>
                    </Grid>
                )
            }
        </Grid>
    );
}