import useMediaQuery from '@mui/material/useMediaQuery';

/**
 * Хук: узкий экран (телефон) — ширина меньше брейкпоинта `sm` темы MUI (600 px).
 * Используется там, где на телефоне меняется не только размер, но и устройство
 * разметки: число колонок поля, вертикальный переключатель уровня, скрытые столбцы таблицы.
 * Простые размеры (отступы, шрифты) задаются прямо в `sx` через брейкпоинты: `{xs: …, sm: …}`.
 * @returns {boolean}
 */
export default function useIsMobile() {
    return useMediaQuery(theme => theme.breakpoints.down("sm"));
}
