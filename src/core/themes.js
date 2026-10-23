import {alpha, createTheme, responsiveFontSizes} from '@mui/material/styles';

/**
 * Цветовые темы оформления.
 * Чтобы добавить тему, достаточно дописать элемент в themeList — она появится в меню.
 * @type {Array<{name: string, light: string, dark: string, label: string}>}
 * name — ключ темы (хранится в настройках), light / dark — основной цвет в светлом и тёмном режиме,
 * label — подпись в меню.
 *
 * Цвета подобраны по контрасту WCAG AA: основной цвет как текст — не меньше 4,5:1 на фоне страницы (#eef3fb),
 * на белом окне и на контурной кнопке (подложка 6% основного цвета); текст на кнопке с заливкой
 * (и на выбранной кнопке уровня) — тоже не меньше 4,5:1. В светлом режиме это тёмные оттенки (подпись на кнопке
 * белая), в тёмном — светлые оттенки палитры MUI 200–300 (подпись чёрная), проверены на фоне #121826 и на окне #1c2333.
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
 * Устройство с мышью (или тачпадом): эффекты наведения (`:hover`) — только под этим медиазапросом.
 * На телефоне «наведение» залипает после касания, и кнопка или карточка остаётся подсвеченной.
 */
export const HOVER_MEDIA = "@media (hover: hover) and (pointer: fine)";

/**
 * Сенсорный экран — ровно противоположный HOVER_MEDIA запрос. Здесь вместо наведения отклик на нажатие
 * (`:active`, PRESS_SCALE) и сброс подсветок наведения, которые MUI ставит сам.
 */
export const TOUCH_MEDIA = "@media not all and (hover: hover) and (pointer: fine)";

/** Отклик на нажатие на сенсорном экране: элемент чуть «вдавливается» и сразу возвращается. */
export const PRESS_SCALE = "scale(0.96)";

/** Время «вдавливания» при нажатии, мс. */
export const PRESS_MS = 100;

/**
 * Медиазапрос тёмной темы системы или null, если браузер его не поддерживает.
 * @returns {MediaQueryList|null}
 */
export const getSystemDarkQuery = () => (
    typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-color-scheme: dark)")
        : null
);

/**
 * Включена ли тёмная тема в системе (prefers-color-scheme). Нужна, пока игрок сам не выбрал режим.
 * @returns {boolean}
 */
export const systemPrefersDark = () => Boolean(getSystemDarkQuery()?.matches);

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

/** Шрифт игры: Nunito (круглый, с кириллицей) лежит в public/fonts и подключается в public/index.html. */
const FONT_FAMILY = '"Nunito Variable", "Nunito", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

/**
 * Цвета, которые отличаются в светлом и тёмном режиме, кроме основного.
 * Фон — мягкий голубоватый (в тёмном — тёмно-синий), окна и плашки — белые (в тёмном — чуть светлее фона).
 * warning и error заменены на более тёмные (в тёмном режиме error — на более светлый): их текст на кнопках
 * с подложкой (подсказка, «Сдаться») должен читаться с контрастом не меньше 4,5:1.
 * Только коды цветов: названия MUI не понимает (ошибка MUI #9).
 */
const modeColors = {
    light: {
        palette: {
            background: {default: "#eef3fb", paper: "#ffffff"},
            warning: {main: "#9a4a00"},
            error: {main: "#b71c1c"},
        },
        shadow: "0 6px 24px rgba(31, 42, 68, 0.08)",
        dialogShadow: "0 20px 50px rgba(31, 42, 68, 0.25)",
    },
    dark: {
        palette: {
            background: {default: "#121826", paper: "#1c2333"},
            error: {main: "#e57373"},
        },
        shadow: "0 6px 24px rgba(0, 0, 0, 0.35)",
        dialogShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
    },
};

/**
 * Размеры шрифта на телефоне (уже 600 px, брейкпоинт `sm`). На широких экранах размеры не меняются.
 * Основной текст — 14 px вместо 16, заголовки — примерно на 20–25% меньше, чем дал бы `responsiveFontSizes`
 * (h1 56 → 44 px, h4 25 → 20 px, h5 20 → 16 px). Не мельче 14 px для текста и 12 px для подписей (caption).
 * body2, button и caption на телефоне такие же, как на компьютере (14, 14 и 12 px).
 */
const mobileFontSizes = {
    h1: "2.75rem",
    h2: "1.875rem",
    h3: "1.5rem",
    h4: "1.25rem",
    h5: "1rem",
    h6: "0.9375rem",
    subtitle1: "0.9375rem",
    body1: "0.875rem",
};

/**
 * Дописывает в типографику темы размеры шрифта для телефона (mobileFontSizes).
 * Вызывается после `responsiveFontSizes`, чтобы её размеры для узкого экрана заменить своими.
 * Правило с max-width не пересекается с её правилами min-width, так что на широких экранах всё как раньше.
 * @param {import('@mui/material/styles').Theme} theme
 * @returns {import('@mui/material/styles').Theme} та же тема
 */
const applyMobileFontSizes = (theme) => {
    const mobile = theme.breakpoints.down("sm");

    Object.entries(mobileFontSizes).forEach(([variant, fontSize]) => {
        theme.typography[variant] = {...theme.typography[variant], [mobile]: {fontSize}};
    });

    return theme;
};

/**
 * Основной цвет кнопки по её color: primary, error, warning… Для color="inherit" — цвет текста.
 * @param {import('@mui/material/styles').Theme} theme
 * @param {string} color - ownerState.color кнопки
 * @returns {string} код цвета
 */
const getButtonColor = (theme, color) => theme.palette[color]?.main ?? theme.palette.text.primary;

/**
 * Переход для кнопки: её обычные переходы MUI плюс быстрый transform для отклика на нажатие.
 * @param {import('@mui/material/styles').Theme} theme
 * @param {string[]} properties - свойства, которые MUI плавно меняет у этой кнопки
 * @param {number} duration - их длительность, мс (как у MUI)
 * @returns {string} значение transition
 */
const pressTransition = (theme, properties, duration) => [
    theme.transitions.create(properties, {duration}),
    theme.transitions.create("transform", {duration: PRESS_MS, easing: theme.transitions.easing.easeOut}),
].join(", ");

/** Отклик на нажатие для кнопок темы — только на сенсорном экране. */
const pressStyle = {"&:active": {transform: PRESS_SCALE}};

/**
 * Полоса прокрутки в цвет темы для всей игры (окна, списки, страница): тонкая «таблетка» 6 px
 * без стрелок, бегунок — основной цвет темы с прозрачностью 40%, при наведении мышью 75%, дорожка прозрачная.
 * Ширина полосы 10 px, из них по 2 px с каждой стороны — прозрачная рамка, поэтому бегунок виден на 6 px.
 * Chrome, Edge, Яндекс Браузер и Safari берут ::-webkit-scrollbar; Firefox (нет ::-webkit-scrollbar) —
 * тонкую системную полосу того же цвета через scrollbar-color. На телефоне остаётся системная полоса.
 * @param {import('@mui/material/styles').Theme} theme
 * @returns {object} стили для MuiCssBaseline
 */
const scrollbarStyles = (theme) => {
    const thumb = alpha(theme.palette.primary.main, 0.4);
    return {
        "*::-webkit-scrollbar": {width: 10, height: 10},
        "*::-webkit-scrollbar-track, *::-webkit-scrollbar-corner": {background: "transparent"},
        "*::-webkit-scrollbar-button": {display: "none", width: 0, height: 0},
        "*::-webkit-scrollbar-thumb": {
            backgroundColor: thumb,
            backgroundClip: "padding-box",
            border: "2px solid transparent",
            borderRadius: 999,
        },
        [HOVER_MEDIA]: {
            "*::-webkit-scrollbar-thumb:hover": {backgroundColor: alpha(theme.palette.primary.main, 0.75)},
        },
        "@supports not selector(::-webkit-scrollbar)": {
            "*": {scrollbarWidth: "thin", scrollbarColor: `${thumb} transparent`},
        },
    };
};

/**
 * Создаёт тему MUI в мягком стиле: основной цвет из themeList (свой оттенок для каждого режима),
 * светлый или тёмный режим, шрифт Nunito, скругления, мягкие тени.
 * Почти весь стиль игры задаётся здесь, а не в компонентах:
 * - кнопки-«таблетки» без капслока; с заливкой — с цветной мягкой тенью; контурные (outlined) —
 *   без рамки, на светлой подложке своего цвета (6%, при наведении 12%: контраст текста остаётся ≥ 4,5:1);
 * - наведение — только для мыши (HOVER_MEDIA); на сенсорном экране подсветки наведения MUI сняты, а кнопки
 *   (Button, IconButton, ToggleButton) при нажатии чуть уменьшаются (TOUCH_MEDIA, PRESS_SCALE);
 * - плашки (Paper, Card) скруглены на 20 px с мягкой тенью, окна (Dialog) — на 24 px, меню — на 16 px;
 * - заголовки жирные (800);
 * - полоса прокрутки — тонкая, в цвет темы (scrollbarStyles).
 * Цвет подписи на кнопках с заливкой (contrastText) MUI выбирает сам: белый в светлом режиме, чёрный в тёмном.
 * `responsiveFontSizes` уменьшает крупные заголовки (h1–h6) на узких экранах,
 * на широких размеры остаются стандартными. На телефоне шрифты ещё мельче — см. mobileFontSizes;
 * там же кнопки ниже и с меньшими отступами, большая кнопка — 16 px вместо 18.
 * Маленькая кнопка (size="small") — 14 px на всех экранах: стандартные 13 px мельче нашего минимума.
 * @param {string} name - имя темы из themeList, например 'greenTheme'
 * @param {boolean} darkMode - тёмный режим
 * @returns {import('@mui/material/styles').Theme}
 */
export const createAppTheme = (name, darkMode) => {
    const mode = darkMode ? "dark" : "light";
    const {palette, shadow, dialogShadow} = modeColors[mode];

    return applyMobileFontSizes(responsiveFontSizes(createTheme({
        palette: {
            mode,
            primary: {
                main: getThemeColor(name, darkMode),
            },
            ...palette,
        },
        shape: {borderRadius: 12},
        typography: {
            fontFamily: FONT_FAMILY,
            h1: {fontWeight: 800},
            h2: {fontWeight: 800},
            h3: {fontWeight: 800},
            h4: {fontWeight: 800},
            h5: {fontWeight: 700},
            h6: {fontWeight: 700},
            button: {textTransform: "none", fontWeight: 800},
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: (theme) => scrollbarStyles(theme),
            },
            MuiButton: {
                styleOverrides: {
                    root: ({theme}) => ({
                        borderRadius: 999,
                        paddingLeft: 20,
                        paddingRight: 20,
                        [theme.breakpoints.down("sm")]: {paddingLeft: 16, paddingRight: 16},
                        transition: pressTransition(
                            theme,
                            ["background-color", "box-shadow", "border-color", "color"],
                            theme.transitions.duration.short,
                        ),
                        [TOUCH_MEDIA]: pressStyle,
                    }),
                    sizeSmall: {fontSize: "0.875rem"},
                    text: {[TOUCH_MEDIA]: {"&:hover": {backgroundColor: "transparent"}}},
                    sizeLarge: ({theme}) => ({
                        minHeight: 56,
                        paddingLeft: 32,
                        paddingRight: 32,
                        fontSize: "1.125rem",
                        [theme.breakpoints.down("sm")]: {minHeight: 48, fontSize: "1rem"},
                    }),
                    contained: ({theme, ownerState}) => {
                        const shadow = `0 6px 16px ${alpha(getButtonColor(theme, ownerState.color), 0.3)}`;
                        const main = theme.palette[ownerState.color]?.main;

                        return {
                            boxShadow: shadow,
                            [HOVER_MEDIA]: {
                                "&:hover": {boxShadow: `0 8px 20px ${alpha(getButtonColor(theme, ownerState.color), 0.4)}`},
                            },
                            // MUI при наведении затемняет фон и меняет тень — на сенсорном экране это залипает после касания
                            [TOUCH_MEDIA]: {
                                "&:hover": {boxShadow: shadow, ...(main && {backgroundColor: main})},
                            },
                            "&.Mui-disabled": {boxShadow: "none"},
                        };
                    },
                    outlined: ({theme, ownerState}) => ({
                        // Рамка прозрачная, а не убрана: так размер кнопки не меняется
                        borderColor: "transparent",
                        backgroundColor: alpha(getButtonColor(theme, ownerState.color), 0.06),
                        // На сенсорном экране подложка при «наведении» не меняется, с мышью — темнее
                        "&:hover": {
                            borderColor: "transparent",
                            backgroundColor: alpha(getButtonColor(theme, ownerState.color), 0.06),
                        },
                        [HOVER_MEDIA]: {
                            "&:hover": {backgroundColor: alpha(getButtonColor(theme, ownerState.color), 0.12)},
                        },
                        "&.Mui-disabled": {borderColor: "transparent", backgroundColor: theme.palette.action.disabledBackground},
                    }),
                },
            },
            MuiIconButton: {
                styleOverrides: {
                    root: ({theme}) => ({
                        transition: pressTransition(theme, ["background-color"], theme.transitions.duration.shortest),
                        [TOUCH_MEDIA]: {"&:hover": {backgroundColor: "transparent"}, ...pressStyle},
                    }),
                },
            },
            MuiToggleButton: {
                styleOverrides: {
                    root: ({theme}) => ({
                        transition: theme.transitions.create("transform", {
                            duration: PRESS_MS,
                            easing: theme.transitions.easing.easeOut,
                        }),
                        [TOUCH_MEDIA]: pressStyle,
                    }),
                },
            },
            MuiCardActionArea: {
                styleOverrides: {
                    root: {
                        [TOUCH_MEDIA]: {"&:hover .MuiCardActionArea-focusHighlight": {opacity: 0}},
                    },
                },
            },
            MuiTableRow: {
                styleOverrides: {
                    // У строки с hover MUI не снимает подсветку на сенсорном экране — после касания она залипает
                    root: {
                        [TOUCH_MEDIA]: {"&.MuiTableRow-hover:hover": {backgroundColor: "transparent"}},
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    rounded: {borderRadius: 20},
                    elevation1: {boxShadow: shadow},
                },
            },
            MuiDialog: {
                styleOverrides: {
                    paper: {borderRadius: 24, boxShadow: dialogShadow},
                },
            },
            MuiDialogTitle: {
                styleOverrides: {
                    root: {fontWeight: 800, paddingTop: 24},
                },
            },
            MuiDialogActions: {
                styleOverrides: {
                    root: {padding: "8px 24px 20px"},
                },
            },
            MuiMenu: {
                styleOverrides: {
                    paper: {borderRadius: 16},
                },
            },
        },
    })));
};
