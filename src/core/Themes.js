import {createTheme} from '@mui/material/styles';
import {green, orange, purple, blue, yellow, deepOrange, indigo} from '@mui/material/colors';

// Список тем: название, основной цвет и подпись в меню выбора темы
export const themeList = [
    {name: "orangeTheme", color: orange[500], label: "O"},
    {name: "greenTheme", color: green[500], label: "G"},
    {name: "purpleTheme", color: purple[500], label: "P"},
    {name: "blueTheme", color: blue[500], label: "B"},
    {name: "yellowTheme", color: yellow[500], label: "Y"},
    {name: "deepOrangeTheme", color: deepOrange[500], label: "DO"},
    {name: "indigoTheme", color: indigo[500], label: "I"},
];

export const themes = Object.fromEntries(themeList.map(({name, color}) => [
    name,
    createTheme({
        palette: {
            primary: {
                main: color,
            },
        },
    }),
]));
