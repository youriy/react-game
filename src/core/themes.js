import {createTheme, responsiveFontSizes} from '@mui/material/styles';

/**
 * Цветовые темы оформления.
 * Чтобы добавить тему, достаточно дописать элемент в themeList — она появится в меню.
 * @type {Array<{name: string, light: string, dark: string, label: string}>}
 * name — ключ темы (хранится в настройках), light / dark — основной цвет в светлом и тёмном режиме,
 * label — подпись в меню.
 *
 * Цвета подобраны по контрасту WCAG AA: основной цвет как текст — не меньше 4,5:1 на фоне страницы,
 * на белом окне и на выбранной кнопке уровня (подложка 8% основного цвета); текст на кнопке с заливкой —
 * тоже не меньше 4,5:1. В светлом режиме это тёмные оттенки (подпись на кнопке белая), в тёмном — светлые
 * оттенки палитры MUI 200–300 (подпись чёрная), проверены на фоне #121212 и на окне #3a3a3a.
 * Насыщенные «пятисотые» цвета MUI на светло-сером фоне не читаются (жёлтый #ffeb3b — 1,1:1).
 * Цвета — только кодами (см. «Темы оформления» в README). Таблица контрастов — в CHANGELOG.
 */
export const themeList = [
    {name: "orangeTheme", light: "#965a00", dark: "#ffb74d", label: "O"},
    {name: "greenTheme", light: "#337435", dark: "#81c784", label: "G"},
    {name: "purpleTheme", light: "#9c27b0", dark: "#ce93d8", label: "P"},
    {name: "blueTheme", light: "#1565c0", dark: "#64b5f6", label: "B"},
    {name: "yellowTheme", light: "#736700", dark: "#fff176", label: "Y"},
    {name: "deepOrangeTheme", light: "#bf360c", dark: "#ff8a65", label: "DO"},
    {name: "indigoTheme", light: "#3f51b5", dark: "#9fa8da", label: "I"},
];

/** Цвет оформления по умолчанию, если сохранённого нет в списке. */
export const DEFAULT_THEME = "indigoTheme";

/**
 * Основной цвет темы для режима: светлый или тёмный оттенок из themeList.
 * Неизвестное имя — цвет темы по умолчанию.
 * @param {string} name - имя темы из themeList
 * @param {boolean} darkMode - тёмный режим
 * @returns {string} код цвета
 */
export const getThemeColor = (name, darkMode) => {
    const item = themeList.find(theme => theme.name === name)
        || themeList.find(theme => theme.name === DEFAULT_THEME);

    return darkMode ? item.dark : item.light;
};

/**
 * Создаёт тему MUI: основной цвет из themeList (свой оттенок для каждого режима) + светлый или тёмный режим.
 * Цвет подписи на кнопках с заливкой (contrastText) MUI выбирает сам: белый в светлом режиме, чёрный в тёмном.
 * `responsiveFontSizes` уменьшает крупные заголовки (h1–h6) на узких экранах,
 * на широких размеры остаются стандартными.
 * @param {string} name - имя темы из themeList, например 'greenTheme'
 * @param {boolean} darkMode - тёмный режим
 * @returns {import('@mui/material/styles').Theme}
 */
export const createAppTheme = (name, darkMode) => responsiveFontSizes(createTheme({
    palette: {
        mode: darkMode ? "dark" : "light",
        primary: {
            main: getThemeColor(name, darkMode),
        },
        // Фон страницы: в светлом режиме светло-серый #f5f5f5 (как было всегда), в тёмном — стандартный тёмный MUI.
        // Только код цвета: названия вроде "whitesmoke" MUI не понимает и падает при запуске (ошибка MUI #9)
        ...(darkMode ? {} : {background: {default: "#f5f5f5"}}),
    },
}));
