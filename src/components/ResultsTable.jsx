import React from 'react';
import {useSelector} from "react-redux";
import {styled} from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import useIsMobile from "../hooks/useIsMobile.js";
import useTranslation from "../hooks/useTranslation.js";
import {getResultSeconds, loadSortedResults} from "../core/storage.js";
import {getResultStars} from "../core/progress.js";
import {MAX_STARS} from "../core/score.js";

/** Контейнер заглушки «нет данных» с цветами картинки под светлую/тёмную тему. */
const EmptyOverlay = styled('div')(({theme}) => {
    const light = theme.palette.mode === 'light';

    return {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: theme.spacing(2),
        textAlign: 'center',
        '& .ant-empty-img-1': {
            fill: light ? '#aeb8c2' : '#262626',
        },
        '& .ant-empty-img-2': {
            fill: light ? '#f5f5f7' : '#595959',
        },
        '& .ant-empty-img-3': {
            fill: light ? '#dce0e6' : '#434343',
        },
        '& .ant-empty-img-4': {
            fill: light ? '#fff' : '#1c1c1c',
        },
        '& .ant-empty-img-5': {
            fillOpacity: light ? '0.8' : '0.08',
            fill: light ? '#f5f5f5' : '#fff',
        },
    };
});

/** Заглушка, когда на уровне ещё нет ни одной игры. */
function EmptyResults() {
    const t = useTranslation();

    return (
        <EmptyOverlay>
            <svg
                width="120"
                height="100"
                viewBox="0 0 184 152"
                aria-hidden
                focusable="false"
            >
                <g fill="none" fillRule="evenodd">
                    <g transform="translate(24 31.67)">
                        <ellipse
                            className="ant-empty-img-5"
                            cx="67.797"
                            cy="106.89"
                            rx="67.797"
                            ry="12.668"
                        />
                        <path
                            className="ant-empty-img-1"
                            d="M122.034 69.674L98.109 40.229c-1.148-1.386-2.826-2.225-4.593-2.225h-51.44c-1.766 0-3.444.839-4.592 2.225L13.56 69.674v15.383h108.475V69.674z"
                        />
                        <path
                            className="ant-empty-img-2"
                            d="M33.83 0h67.933a4 4 0 0 1 4 4v93.344a4 4 0 0 1-4 4H33.83a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z"
                        />
                        <path
                            className="ant-empty-img-3"
                            d="M42.678 9.953h50.237a2 2 0 0 1 2 2V36.91a2 2 0 0 1-2 2H42.678a2 2 0 0 1-2-2V11.953a2 2 0 0 1 2-2zM42.94 49.767h49.713a2.262 2.262 0 1 1 0 4.524H42.94a2.262 2.262 0 0 1 0-4.524zM42.94 61.53h49.713a2.262 2.262 0 1 1 0 4.525H42.94a2.262 2.262 0 0 1 0-4.525zM121.813 105.032c-.775 3.071-3.497 5.36-6.735 5.36H20.515c-3.238 0-5.96-2.29-6.734-5.36a7.309 7.309 0 0 1-.222-1.79V69.675h26.318c2.907 0 5.25 2.448 5.25 5.42v.04c0 2.971 2.37 5.37 5.277 5.37h34.785c2.907 0 5.277-2.421 5.277-5.393V75.1c0-2.972 2.343-5.426 5.25-5.426h26.318v33.569c0 .617-.077 1.216-.221 1.789z"
                        />
                    </g>
                    <path
                        className="ant-empty-img-3"
                        d="M149.121 33.292l-6.83 2.65a1 1 0 0 1-1.317-1.23l1.937-6.207c-2.589-2.944-4.109-6.534-4.109-10.408C138.802 8.102 148.92 0 161.402 0 173.881 0 184 8.102 184 18.097c0 9.995-10.118 18.097-22.599 18.097-4.528 0-8.744-1.066-12.28-2.902z"
                    />
                    <g className="ant-empty-img-4" transform="translate(149.65 15.383)">
                        <ellipse cx="20.654" cy="3.167" rx="2.849" ry="2.815" />
                        <path d="M5.698 5.63H0L2.898.704zM9.259.704h4.985V5.63H9.259z" />
                    </g>
                </g>
            </svg>
            <Box sx={{mt: 1}}>{t.info}</Box>
        </EmptyOverlay>
    );
}

/** Сколько результатов на одной странице таблицы. */
const RESULTS_PER_PAGE = 5;
/** Высота таблицы, px: заголовок + RESULTS_PER_PAGE строк + панель страниц (страница помещается без прокрутки). */
const TABLE_HEIGHT = 317;

/**
 * Столбцы таблицы.
 * - id — ключ столбца (для сортировки), labelKey — подпись из languages.js;
 * - getValue(row, level) — что показать в ячейке; getSortValue(row, level) — по чему сортировать;
 * - hideOnMobile — скрыть на узком экране, чтобы таблица помещалась.
 * У старых результатов может не быть очков и звёзд: очков нет — «—» и в конце при сортировке,
 * звёзды считаются по счёту (см. core/progress.js).
 */
const columns = [
    {id: "date", labelKey: "date", getValue: row => row.date, getSortValue: row => row.date},
    {id: "try", labelKey: "try", hideOnMobile: true, getValue: row => row.try, getSortValue: row => row.try ?? 0},
    {
        id: "time", labelKey: "time", hideOnMobile: true,
        getValue: row => row.time, getSortValue: row => getResultSeconds(row) ?? Infinity,
    },
    {id: "score", labelKey: "score", getValue: row => row.score ?? "—", getSortValue: row => row.score ?? -1},
    {
        id: "stars", labelKey: "stars",
        getValue: (row, level) => {
            const stars = getResultStars(row, level);
            return "★".repeat(stars) + "☆".repeat(MAX_STARS - stars);
        },
        getSortValue: (row, level) => getResultStars(row, level),
    },
];

/**
 * Сравнение двух результатов по столбцу (для Array.sort).
 * @param {Object} column - столбец из columns
 * @param {'asc'|'desc'} order - направление сортировки
 * @param {string} level - ключ уровня
 */
const compareBy = (column, order, level) => (a, b) => {
    const x = column.getSortValue(a, level);
    const y = column.getSortValue(b, level);
    const result = x < y ? -1 : x > y ? 1 : 0;

    return order === "asc" ? result : -result;
};

/**
 * Таблица статистики выбранного уровня: дата, попытки, время, очки и звёзды прошлых игр.
 * По умолчанию отсортирована по очкам (лучшие сверху); клик по заголовку меняет сортировку.
 * По RESULTS_PER_PAGE строк на странице. На телефоне столбцы «Попытки» и «Время» скрыты.
 * Сделана на обычных компонентах MUI (Table) — без тяжёлой библиотеки @mui/x-data-grid.
 */
export default function ResultsTable() {
    const t = useTranslation();
    const level = useSelector(state => state.game.level);
    const isMobile = useIsMobile();
    const [sort, setSort] = React.useState({by: "score", order: "desc"});
    const [page, setPage] = React.useState(0);

    // Другой уровень — другая статистика: начинаем с первой страницы
    React.useEffect(() => setPage(0), [level]);

    const visibleColumns = columns.filter(column => !(isMobile && column.hideOnMobile));
    const sortColumn = columns.find(column => column.id === sort.by);
    const rows = React.useMemo(
        () => [...loadSortedResults(level)].sort(compareBy(sortColumn, sort.order, level)),
        [level, sort]
    );
    const pageRows = rows.slice(page * RESULTS_PER_PAGE, (page + 1) * RESULTS_PER_PAGE);

    /** Клик по заголовку: тот же столбец — сменить направление, другой — сортировать по нему (сначала большие). */
    const handleSort = (id) => {
        setSort(current => ({
            by: id,
            order: current.by === id && current.order === "desc" ? "asc" : "desc",
        }));
        setPage(0);
    };

    return (
        <Paper sx={{height: TABLE_HEIGHT, width: "100%", display: "flex", flexDirection: "column", overflow: "hidden"}}>
            {
                rows.length === 0
                    ? <EmptyResults/>
                    : (
                        <TableContainer sx={{flexGrow: 1}}>
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        {
                                            visibleColumns.map(column =>
                                                <TableCell key={column.id} sortDirection={sort.by === column.id ? sort.order : false}>
                                                    <TableSortLabel
                                                        active={sort.by === column.id}
                                                        direction={sort.by === column.id ? sort.order : "desc"}
                                                        onClick={() => handleSort(column.id)}
                                                    >
                                                        {t[column.labelKey]}
                                                    </TableSortLabel>
                                                </TableCell>
                                            )
                                        }
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        pageRows.map(row =>
                                            <TableRow key={row.date} hover>
                                                {
                                                    visibleColumns.map(column =>
                                                        <TableCell key={column.id} sx={{whiteSpace: "nowrap"}}>
                                                            {column.getValue(row, level)}
                                                        </TableCell>
                                                    )
                                                }
                                            </TableRow>
                                        )
                                    }
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )
            }
            <TablePagination
                component="div"
                count={rows.length}
                page={page}
                onPageChange={(event, newPage) => setPage(newPage)}
                rowsPerPage={RESULTS_PER_PAGE}
                rowsPerPageOptions={[]}
                // без слов, чтобы не переводить: «1–5 / 12»
                labelDisplayedRows={({from, to, count}) => `${from}–${to} / ${count}`}
            />
        </Paper>
    );
}
