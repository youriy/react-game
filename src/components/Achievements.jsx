import React from 'react';
import {shallowEqual, useDispatch, useSelector} from "react-redux";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import TrophyIcon from '@mui/icons-material/EmojiEvents';
import {setAchievementsOpen, setPaused} from "../store/gameSlice.js";
import {
    achievementList,
    getAchievementEntries,
    getAchievementTiers,
    getGlory,
    getHistorySummary,
    getTotalGlory,
    getMaxTier,
    getTextKeys,
    MEDALS,
    SINGLE_GLORY,
    TIER_GLORY
} from "../core/achievements.js";
import {getLevel, levelList} from "../core/levels.js";
import useTranslation from "../hooks/useTranslation.js";

/**
 * Порог для показа: время — «м:сс», остальное — числом.
 * @param {import("../core/achievements.js").Achievement} achievement
 * @param {number} value
 * @returns {string} например, "1:20"
 */
const formatThreshold = (achievement, value) => (achievement.unit === "time"
    ? `${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`
    : String(value));

/**
 * Пороги ступеней одной строкой с медалями.
 * @param {string[]} values - уже отформатированные пороги бронзы, серебра и золота
 * @returns {string} например, "🥉 10 · 🥈 50 · 🥇 100"
 */
const formatTierLine = (values) => values.map((value, index) => `${MEDALS[index]} ${value}`).join(" · ");

/**
 * Значок полученной ступени: медаль (у одноступенчатых — ✅) или бледная медаль, если не получено.
 * @param {{tier: number, maxTier: number}} props
 */
function Medal({tier, maxTier}) {
    if (!tier) {
        return <Box component="span" sx={{opacity: 0.3, filter: "grayscale(1)"}}>🏅</Box>;
    }

    return <span>{maxTier === 1 ? "✅" : MEDALS[tier - 1]}</span>;
}

/**
 * Пороги достижения по уровням таблицей: уровень и пороги бронзы, серебра, золота.
 * Достигнутые пороги выделены цветом и жирным.
 * @param {Object} props
 * @param {import("../core/achievements.js").Achievement} props.achievement - достижение с perLevel
 * @param {Object<string, number>} props.tiers - прогресс (getAchievementTiers)
 */
function LevelTable({achievement, tiers}) {
    const t = useTranslation();

    return (
        <Box
            role="table"
            sx={{display: "grid", gridTemplateColumns: "minmax(0, 1fr) repeat(3, auto)", columnGap: {xs: 1, sm: 2}, rowGap: 0.25, mt: 0.75, typography: "body2"}}
        >
            <Box role="row" sx={{display: "contents"}}>
                <span role="columnheader"/>
                {/* Над столбцом — медаль и сколько баллов славы даёт ступень */}
                {MEDALS.map((medal, index) =>
                    <Box role="columnheader" key={medal} sx={{textAlign: "right", whiteSpace: "nowrap"}}>
                        {medal}
                        <Typography component="span" variant="caption" color="text.secondary"> +{TIER_GLORY[index]}</Typography>
                    </Box>
                )}
            </Box>
            {levelList.map(level => {
                const tier = tiers[`${achievement.id}.${level.key}`];

                return (
                    <Box role="row" key={level.key} sx={{display: "contents"}}>
                        <Box role="cell" sx={{overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>{t[level.labelKey]}</Box>
                        {achievement.perLevel[level.key].map((value, index) =>
                            <Box
                                role="cell"
                                key={index}
                                sx={{textAlign: "right", whiteSpace: "nowrap", ...(index < tier
                                    ? {color: "primary.main", fontWeight: 800}
                                    : {color: "text.secondary"})}}
                            >
                                {formatThreshold(achievement, value)}
                            </Box>
                        )}
                    </Box>
                );
            })}
        </Box>
    );
}

/**
 * Одна строка списка: значок, название с баллами славы («🏆 получено / всего»), условие и пороги;
 * справа — полученная ступень.
 * У достижений по уровням вместо значка справа — таблица порогов по уровням (LevelTable).
 * @param {Object} props
 * @param {import("../core/achievements.js").Achievement} props.achievement
 * @param {Object<string, number>} props.tiers - прогресс (getAchievementTiers)
 * @param {import("../core/achievements.js").HistorySummary} props.history - сводка по истории (для подписи прогресса)
 */
function AchievementRow({achievement, tiers, history}) {
    const t = useTranslation();
    const {title, description} = getTextKeys(achievement.id);
    const maxTier = getMaxTier(achievement);
    const tier = achievement.perLevel
        ? Math.max(...levelList.map(level => tiers[`${achievement.id}.${level.key}`]))
        : tiers[achievement.id];

    let tierLine = null;
    if (achievement.tiers) {
        tierLine = formatTierLine(achievement.tiers.map(value => formatThreshold(achievement, value)));
    } else if (achievement.levels) {
        tierLine = formatTierLine(achievement.levels.map(key => `«${t[getLevel(key).labelKey]}»`));
    }
    // Подпись «сейчас / следующий порог» (у «Ветерана» и «Коллекционера»), пока не взято золото
    const progress = achievement.progress && achievement.progress(history);
    // Баллы славы: сколько уже получено и сколько можно получить всего (у достижений по уровням — по всем уровням)
    const keys = achievement.perLevel ? levelList.map(level => `${achievement.id}.${level.key}`) : [achievement.id];
    const glory = keys.reduce((sum, key) => sum + getGlory(achievement, tiers[key]), 0);
    const maxGlory = keys.length * getGlory(achievement, maxTier);
    const nextTier = achievement.progress ? achievement.tiers.find(value => value > progress) : undefined;

    return (
        <Box component="li" sx={{display: "flex", alignItems: "flex-start", gap: 1.5, py: 1.5, borderTop: 1, borderColor: "divider"}}>
            {/* Значок не полученного достижения — бледный */}
            <Box sx={{fontSize: 28, lineHeight: 1.2, flexShrink: 0, opacity: tier ? 1 : 0.4, filter: tier ? "none" : "grayscale(1)"}} aria-hidden>
                {achievement.icon}
            </Box>
            <Box sx={{flex: 1, minWidth: 0}}>
                <Typography variant="subtitle1" sx={{fontWeight: 700, lineHeight: 1.3}}>
                    {t[title]}
                    <Typography
                        component="span"
                        variant="caption"
                        title={t.glory}
                        sx={{ml: 1, whiteSpace: "nowrap", fontWeight: 700, color: glory ? "primary.main" : "text.secondary"}}
                    >
                        🏆 {glory} / {maxGlory}
                    </Typography>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {t[description]}
                    {tierLine && <> {tierLine}</>}
                </Typography>
                {achievement.noHint && <Typography variant="caption" color="text.secondary">💡 {t.achNoHint}</Typography>}
                {achievement.perLevel && <LevelTable achievement={achievement} tiers={tiers}/>}
            </Box>
            {
                !achievement.perLevel &&
                <Box sx={{flexShrink: 0, textAlign: "center", fontSize: 24, lineHeight: 1.2}}>
                    <Medal tier={tier} maxTier={maxTier}/>
                    {nextTier && <Typography variant="caption" component="div" color="text.secondary">{progress} / {nextTier}</Typography>}
                </Box>
            }
        </Box>
    );
}

/**
 * Окно «Достижения»: сколько получено, сумма баллов славы и список всех достижений с условиями, порогами
 * и полученными ступенями; внизу — сколько баллов славы даёт каждая ступень.
 * Открывается кнопкой-кубком в шапке и кнопкой во всплывашке после победы (AchievementToast).
 * Прогресс читается при открытии окна. Как и «Как играть», ставит партию на паузу и снимает её при закрытии.
 */
export default function Achievements() {
    const dispatch = useDispatch();
    const {open, gaming, paused} = useSelector(state => ({
        open: state.game.achievements,
        gaming: state.game.gaming,
        paused: state.game.paused,
    }), shallowEqual);
    const t = useTranslation();
    const pausedByDialog = React.useRef(false);
    // Прогресс и сводка по истории — один раз при открытии, а не на каждую перерисовку
    const {tiers, history} = React.useMemo(
        () => (open ? {tiers: getAchievementTiers(), history: getHistorySummary()} : {tiers: {}, history: {}}),
        [open]
    );
    const entries = getAchievementEntries();
    const earned = entries.filter(({key}) => tiers[key] > 0).length;

    React.useEffect(() => {
        if (open && gaming && !paused) {
            pausedByDialog.current = true;
            dispatch(setPaused(true));
        }
    }, [open]);

    const close = () => {
        dispatch(setAchievementsOpen(false));

        if (pausedByDialog.current) {
            pausedByDialog.current = false;
            dispatch(setPaused(false));
        }
    };

    return (
        <Dialog
            open={open}
            onClose={close}
            fullWidth
            maxWidth="sm"
            scroll="paper"
            aria-labelledby="achievements-title"
            // На телефоне поля вокруг окна меньше (16 px вместо 32), чтобы таблицы порогов поместились
            sx={{"& .MuiDialog-paper": {m: {xs: 2, sm: 4}, width: {xs: "calc(100% - 32px)", sm: "calc(100% - 64px)"}}}}
        >
            <DialogTitle id="achievements-title" sx={{pb: 1}}>
                <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                    <TrophyIcon color="primary"/>
                    {t.achievements}
                </Box>
                <Typography variant="body2" color="text.secondary">
                    {t.achievementsCount.replace("{n}", earned).replace("{total}", entries.length)}
                    {" · "}
                    <Box component="span" sx={{color: "primary.main", fontWeight: 800}}>🏆 {t.glory}: {getTotalGlory(tiers)}</Box>
                </Typography>
            </DialogTitle>
            <DialogContent sx={{py: 0}}>
                <Box component="ul" sx={{m: 0, p: 0, listStyle: "none"}}>
                    {achievementList.map(achievement =>
                        <AchievementRow key={achievement.id} achievement={achievement} tiers={tiers} history={history}/>
                    )}
                </Box>
                <Typography variant="caption" component="p" color="text.secondary" sx={{py: 1.5, borderTop: 1, borderColor: "divider"}}>
                    🏆 {t.gloryRule
                        .replace("{tiers}", formatTierLine(TIER_GLORY.map(String)))
                        .replace("{single}", SINGLE_GLORY)}
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={close} autoFocus>
                    {t.close}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
