import {createTheme, lighten, responsiveFontSizes} from '@mui/material/styles';
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
 * Насколько осветлять основной цвет в тёмном режиме: насыщенные цвета (500) плохо читаются
 * на тёмном фоне, поэтому в тёмной теме берём более светлый оттенок (примерно как 300 в палитре MUI).
 */
const DARK_MODE_LIGHTEN = 0.3;

/** Цвет оформления по умолчанию, если сохранённого нет в списке. */
export const DEFAULT_THEME = "indigoTheme";

/**
 * Создаёт тему MUI: основной цвет из themeList + светлый или тёмный режим
 * (в тёмном основной цвет осветляется — см. DARK_MODE_LIGHTEN).
 * `responsiveFontSizes` уменьшает крупные заголовки (h1–h6) на узких экранах,
 * на широких размеры остаются стандартными.
 * @param {string} name - имя темы из themeList, например 'greenTheme'
 * @param {boolean} darkMode - тёмный режим
 * @returns {import('@mui/material/styles').Theme}
 */
export const createAppTheme = (name, darkMode) => {
    const {color} = themeList.find(item => item.name === name)
        || themeList.find(item => item.name === DEFAULT_THEME);

    return responsiveFontSizes(createTheme({
        palette: {
            mode: darkMode ? "dark" : "light",
            primary: {
                main: darkMode ? lighten(color, DARK_MODE_LIGHTEN) : color,
            },
            // Фон страницы: в светлом режиме светло-серый #f5f5f5 (как было всегда), в тёмном — стандартный тёмный MUI.
            // Только код цвета: названия вроде "whitesmoke" MUI не понимает и падает при запуске (ошибка MUI #9)
            ...(darkMode ? {} : {background: {default: "#f5f5f5"}}),
        },
    }));
};
