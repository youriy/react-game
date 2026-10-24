import React from 'react';
import {useDispatch, useSelector} from "react-redux";
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import {alpha} from '@mui/material/styles';
import LockIcon from '@mui/icons-material/Lock';
import {setCardBack} from "../store/gameSlice.js";
import {cardBackList, getCardBackStyle, getCardBackTextKey, isCardBackUnlocked} from "../core/cardBacks.js";
import {HOVER_MEDIA, PRESS_MS, PRESS_SCALE, TOUCH_MEDIA} from "../core/themes.js";
import useTranslation from "../hooks/useTranslation.js";

/**
 * Образец рубашки: квадратная карточка с узором, как на поле. Закрытая — бледная, с замком.
 * @param {Object} props
 * @param {string} props.id - ключ рубашки
 * @param {boolean} props.locked
 */
function BackPreview({id, locked}) {
    return (
        <Box
            aria-hidden
            sx={[{
                position: "relative",
                width: "100%",
                aspectRatio: "1",
                borderRadius: "14px",
                overflow: "hidden",
                bgcolor: "background.paper",
                boxShadow: (theme) => (theme.palette.mode === "dark" ? "none" : "0 2px 8px rgba(31, 42, 68, 0.12)"),
                filter: locked ? "grayscale(0.85)" : "none",
                opacity: locked ? 0.45 : 1,
            }, (theme) => getCardBackStyle(id, theme.palette.primary.main, theme.palette.mode === "dark") || {
                backgroundImage: `linear-gradient(${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.primary.main, 0.2)})`,
            }]}
        >
            {locked && <LockIcon sx={{position: "absolute", inset: 0, m: "auto", fontSize: 30, color: "text.primary"}}/>}
        </Box>
    );
}

/**
 * Плитка награды «рубашка»: образец, название и подпись — «✓ выбрана», порог баллов славы у закрытой
 * или пусто. Открытую выбирают нажатием на плитку; выбранная обведена основным цветом.
 * @param {Object} props
 * @param {{id: string, glory: number}} props.item - рубашка из cardBackList
 * @param {number} props.glory - баллы славы игрока
 * @param {boolean} props.selected
 */
function CardBackTile({item, glory, selected}) {
    const dispatch = useDispatch();
    const t = useTranslation();
    const locked = !isCardBackUnlocked(item, glory);
    const name = t[getCardBackTextKey(item.id)];

    let caption = "";
    if (locked) {
        caption = `🏆 ${item.glory}`;
    } else if (selected) {
        caption = `✓ ${t.cardBackSelected}`;
    }

    return (
        <ButtonBase
            role="radio"
            aria-checked={selected}
            aria-disabled={locked}
            aria-label={locked ? `${name}. ${t.cardBackLocked.replace("{n}", item.glory)}` : name}
            onClick={() => !locked && dispatch(setCardBack(item.id))}
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                justifyContent: "flex-start",
                gap: 0.75,
                p: 0.75,
                borderRadius: "18px",
                cursor: locked ? "default" : "pointer",
                outline: "3px solid",
                outlineColor: selected ? "primary.main" : "transparent",
                transition: `transform ${PRESS_MS}ms ease-out`,
                [HOVER_MEDIA]: locked ? {} : {"&:hover": {bgcolor: "action.hover"}},
                [TOUCH_MEDIA]: locked ? {} : {"&:active": {transform: PRESS_SCALE}},
                "&.Mui-focusVisible": {bgcolor: "action.focus"},
            }}
        >
            <BackPreview id={item.id} locked={locked}/>
            <Typography variant="body2" sx={{fontWeight: 700, lineHeight: 1.2, textAlign: "center", color: locked ? "text.secondary" : "text.primary"}}>
                {name}
            </Typography>
            <Typography
                variant="caption"
                sx={{lineHeight: 1.2, textAlign: "center", minHeight: "1.2em", ...(selected
                    ? {color: "primary.main", fontWeight: 800}
                    : {color: "text.secondary"})}}
            >
                {caption}
            </Typography>
        </ButtonBase>
    );
}

/**
 * Группы наград. Чтобы добавить новый вид наград (например, цвета), — дописать группу:
 * ключ заголовка в словаре, элементы и компонент плитки (получает item, glory, selected).
 */
const rewardGroups = [
    {id: "cardBacks", titleKey: "cardBacks", items: cardBackList, Tile: CardBackTile, isUnlocked: isCardBackUnlocked},
];

/**
 * Вкладка «Награды» окна «Достижения»: награды за баллы славы, сгруппированные по видам (пока одна группа —
 * рубашки карт), в каждой группе — плитки. В заголовке группы — сколько открыто. Баллы не тратятся: награда открывается, когда сумма
 * баллов славы дошла до её порога. Выбор сразу сохраняется.
 * @param {Object} props
 * @param {number} props.glory - баллы славы игрока (getTotalGlory)
 */
export default function Rewards({glory}) {
    const t = useTranslation();
    const cardBack = useSelector(state => state.game.cardBack);

    return (
        <>
            {rewardGroups.map(({id, titleKey, items, Tile, isUnlocked}) => (
                <Box component="section" key={id} aria-labelledby={`rewards-${id}`} sx={{pb: 1}}>
                    <Typography id={`rewards-${id}`} variant="subtitle1" component="h3" sx={{fontWeight: 800, pt: 1, pb: 0.5}}>
                        {t[titleKey]}
                        <Typography component="span" variant="body2" color="text.secondary" sx={{ml: 1}}>
                            {t.rewardsUnlocked
                                .replace("{n}", items.filter(item => isUnlocked(item, glory)).length)
                                .replace("{total}", items.length)}
                        </Typography>
                    </Typography>
                    {/* Плитки: на телефоне по три в ряд, шире — по четыре */}
                    <Box
                        role="radiogroup"
                        aria-labelledby={`rewards-${id}`}
                        sx={{display: "grid", gridTemplateColumns: {xs: "repeat(3, minmax(0, 1fr))", sm: "repeat(4, minmax(0, 1fr))"}, gap: {xs: 1, sm: 1.5}, pt: 1}}
                    >
                        {items.map(item => <Tile key={item.id} item={item} glory={glory} selected={item.id === cardBack}/>)}
                    </Box>
                </Box>
            ))}
            <Typography variant="caption" component="p" color="text.secondary" sx={{py: 1.5, borderTop: 1, borderColor: "divider"}}>
                🏆 {t.rewardsRule}
            </Typography>
        </>
    );
}
