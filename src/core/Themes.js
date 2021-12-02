import { createTheme } from '@mui/material/styles';
import { green, orange, purple, blue, yellow, deepOrange, indigo } from '@mui/material/colors';

export const themes = {
    orangeTheme: createTheme({
        palette: {
            primary: {
                main: orange[500],
            },
        },
    }),
    greenTheme: createTheme({
        palette: {
            primary: {
                main: green[500],
            },
        },
    }),
    purpleTheme: createTheme({
        palette: {
            primary: {
                main: purple[500],
            },
        },
    }),
    blueTheme: createTheme({
        palette: {
            primary: {
                main: blue[500],
            },
        },
    }),
    yellowTheme: createTheme({
        palette: {
            primary: {
                main: yellow[500],
            },
        },
    }),
    deepOrangeTheme: createTheme({
        palette: {
            primary: {
                main: deepOrange[500],
            },
        },
    }),
    indigoTheme: createTheme({
        palette: {
            primary: {
                main: indigo[500],
            },
        },
    })
};