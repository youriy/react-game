import {createTheme} from '@mui/material/styles';
import {green, orange, purple, blue, yellow, deepOrange, indigo} from '@mui/material/colors';

/**
 * Цветовые темы оформления.
 * Чтобы добавить тему, достаточно дописать элемент в themeList — она появится в меню.
 * @type {Array<{name: string, color: string, label: string}>}
 * name — ключ темы (хранится в настройках), color — основной цвет, label — подпись в меню.
 */
export const themeList = [
    {name: "orangeTheme", color: orange[500], label: "O"},
    {name: "greenTheme", color: green[500], label: "G"},
    {name: "purpleTheme", color: purple[500], label: "P"},
    {name: "blueTheme", color: blue[500], label: "B"},
    {name: "yellowTheme", color: yellow[500], label: "Y"},
    {name: "deepOrangeTheme", color: deepOrange[500], label: "DO"},
    {name: "indigoTheme", color: indigo[500], label: "I"},
];

/**
 * Готовые темы MUI по имени: `themes.greenTheme` и т. д.
 * @type {Object<string, import('@mui/material/styles').Theme>}
 */
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
