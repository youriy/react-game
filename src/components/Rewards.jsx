import React from 'react';
import {useDispatch, useSelector} from "react-redux";
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import {alpha} from '@mui/material/styles';
import LockIcon from '@mui/icons-material/Lock';
import {setCardBack, setPictureSet} from "../store/gameSlice.js";
import {cardBackList, getCardBackStyle, getCardBackTextKey, isCardBackUnlocked} from "../core/cardBacks.js";
import {getPictureSetTextKey, isPictureSetUnlocked, pictureSetList, preloadPictureSet} from "../icons/pictureSets.js";
import {HOVER_MEDIA, PRESS_MS, PRESS_SCALE, TOUCH_MEDIA} from "../core/themes.js";
import useTranslation from "../hooks/useTranslation.js";
import CardPicture from "./CardPicture.jsx";

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
 * Образец набора картинок: открытая карточка с четырьмя картинками набора (cover). Закрытый — бледный, с замком.
 * @param {Object} props
 * @param {{id: string, cover: string[]}} props.set - набор из pictureSetList
 * @param {boolean} props.locked
 */
function PictureSetPreview({set, locked}) {
    return (
        <Box
            aria-hidden
            sx={{
                position: "relative",
                width: "100%",
                aspectRatio: "1",
                borderRadius: "14px",
                bgcolor: "background.paper",
                boxShadow: (theme) => (theme.palette.mode === "dark" ? "none" : "0 2px 8px rgba(31, 42, 68, 0.12)"),
                // Картинки занимают свои клетки целиком: и SVG-файлы, и иконки «Классики» (у тех размер задан в em)
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8%",
                p: "16%",
                color: "primary.main",
                "& > div > *": {width: "100%", height: "100%"},
            }}
        >
            {set.cover.map(picture => (
                <Box key={picture} sx={{minWidth: 0, filter: locked ? "grayscale(0.85)" : "none", opacity: locked ? 0.45 : 1}}>
                    <CardPicture set={set.id} picture={picture} size="100%"/>
                </Box>
            ))}
            {locked && <LockIcon sx={{position: "absolute", inset: 0, m: "auto", fontSize: 30, color: "text.primary"}}/>}
        </Box>
    );
}

/**
 * Плитка награды: образец, название и подпись — «✓ выбрана», порог баллов славы у закрытой или пусто.
 * Открытую выбирают нажатием на плитку; выбранная обведена основным цветом.
 * @param {Object} props
 * @param {React.ReactNode} props.preview - образец награды
 * @param {string} props.name - название
 * @param {number} props.threshold - порог баллов славы
 * @param {boolean} props.locked - ещё не открыта
 * @param {boolean} props.selected
 * @param {boolean} [props.busy] - сейчас выбрать нельзя (набор картинок во время партии); подпись — в заголовке группы
 * @param {string} props.selectedLabel - подпись выбранной («выбрана» / «выбран»)
 * @param {function(): void} props.onSelect
 */
function RewardTile({preview, name, threshold, locked, selected, busy, selectedLabel, onSelect}) {
    const t = useTranslation();
    const inactive = locked || busy;

    let caption = "";
    if (locked) {
        caption = `🏆 ${threshold}`;
    } else if (selected) {
        caption = `✓ ${selectedLabel}`;
    }

    return (
        <ButtonBase
            role="radio"
            aria-checked={selected}
            aria-disabled={inactive}
            aria-label={locked ? `${name}. ${t.cardBackLocked.replace("{n}", threshold)}` : name}
            onClick={() => !inactive && onSelect()}
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                justifyContent: "flex-start",
                gap: 0.75,
                p: 0.75,
                borderRadius: "18px",
                cursor: inactive ? "default" : "pointer",
                outline: "3px solid",
                outlineColor: selected ? "primary.main" : "transparent",
                transition: `transform ${PRESS_MS}ms ease-out`,
                [HOVER_MEDIA]: inactive ? {} : {"&:hover": {bgcolor: "action.hover"}},
                [TOUCH_MEDIA]: inactive ? {} : {"&:active": {transform: PRESS_SCALE}},
                "&.Mui-focusVisible": {bgcolor: "action.focus"},
            }}
        >
            {preview}
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
 * Плитка рубашки.
 * @param {Object} props
 * @param {{id: string, glory: number}} props.item - рубашка из cardBackList
 * @param {number} props.glory - баллы славы игрока
 * @param {boolean} props.selected
 */
function CardBackTile({item, glory, selected}) {
    const dispatch = useDispatch();
    const t = useTranslation();
    const locked = !isCardBackUnlocked(item, glory);

    return (
        <RewardTile
            preview={<BackPreview id={item.id} locked={locked}/>}
            name={t[getCardBackTextKey(item.id)]}
            threshold={item.glory}
            locked={locked}
            selected={selected}
            selectedLabel={t.cardBackSelected}
            onSelect={() => dispatch(setCardBack(item.id))}
        />
    );
}

/**
 * Плитка набора картинок. Во время партии набор не поменять: плитки не нажимаются.
 * При выборе картинки набора загружаются заранее, чтобы к партии они уже были в кеше браузера.
 * @param {Object} props
 * @param {{id: string, glory: number, cover: string[]}} props.item - набор из pictureSetList
 * @param {number} props.glory - баллы славы игрока
 * @param {boolean} props.selected
 * @param {boolean} props.busy - идёт партия
 */
function PictureSetTile({item, glory, selected, busy}) {
    const dispatch = useDispatch();
    const t = useTranslation();
    const locked = !isPictureSetUnlocked(item, glory);

    return (
        <RewardTile
            preview={<PictureSetPreview set={item} locked={locked}/>}
            name={t[getPictureSetTextKey(item.id)]}
            threshold={item.glory}
            locked={locked}
            selected={selected}
            busy={busy}
            selectedLabel={t.pictureSetSelected}
            onSelect={() => {
                preloadPictureSet(item.id);
                dispatch(setPictureSet(item.id));
            }}
        />
    );
}

/**
 * Группы наград. Чтобы добавить новый вид наград (например, цвета), — дописать группу:
 * ключ заголовка в словаре, элементы, компонент плитки (получает item, glory, selected, busy), проверку «открыта»,
 * настройку в state.game, где лежит выбранная, и lockedInGame — нельзя менять во время партии.
 */
const rewardGroups = [
    {id: "pictureSets", titleKey: "pictureSets", items: pictureSetList, Tile: PictureSetTile, isUnlocked: isPictureSetUnlocked, setting: "pictureSet", lockedInGame: true},
    {id: "cardBacks", titleKey: "cardBacks", items: cardBackList, Tile: CardBackTile, isUnlocked: isCardBackUnlocked, setting: "cardBack"},
];

/**
 * Вкладка «Награды» окна «Достижения»: награды за баллы славы, сгруппированные по видам (наборы картинок
 * и рубашки карт), в каждой группе — плитки. Набор картинок во время партии не меняется — над плитками подпись. В заголовке группы — сколько открыто. Баллы не тратятся: награда открывается, когда сумма
 * баллов славы дошла до её порога. Выбор сразу сохраняется.
 * @param {Object} props
 * @param {number} props.glory - баллы славы игрока (getTotalGlory)
 */
export default function Rewards({glory}) {
    const t = useTranslation();
    // Выбранные награды по настройкам групп; всё состояние партии не берём — оно меняется каждую секунду
    const selected = {
        cardBack: useSelector(state => state.game.cardBack),
        pictureSet: useSelector(state => state.game.pictureSet),
    };
    const gaming = useSelector(state => state.game.gaming);

    return (
        <>
            {rewardGroups.map(({id, titleKey, items, Tile, isUnlocked, setting, lockedInGame}) => (
                <Box component="section" key={id} aria-labelledby={`rewards-${id}`} sx={{pb: 1}}>
                    <Typography id={`rewards-${id}`} variant="subtitle1" component="h3" sx={{fontWeight: 800, pt: 1, pb: 0.5}}>
                        {t[titleKey]}
                        <Typography component="span" variant="body2" color="text.secondary" sx={{ml: 1}}>
                            {t.rewardsUnlocked
                                .replace("{n}", items.filter(item => isUnlocked(item, glory)).length)
                                .replace("{total}", items.length)}
                        </Typography>
                    </Typography>
                    {lockedInGame && gaming && (
                        <Typography variant="body2" color="text.secondary">{t.pictureSetInGame}</Typography>
                    )}
                    {/* Плитки: на телефоне по три в ряд, шире — по четыре */}
                    <Box
                        role="radiogroup"
                        aria-labelledby={`rewards-${id}`}
                        sx={{display: "grid", gridTemplateColumns: {xs: "repeat(3, minmax(0, 1fr))", sm: "repeat(4, minmax(0, 1fr))"}, gap: {xs: 1, sm: 1.5}, pt: 1}}
                    >
                        {items.map(item => <Tile key={item.id} item={item} glory={glory} selected={item.id === selected[setting]} busy={lockedInGame && gaming}/>)}
                    </Box>
                </Box>
            ))}
            <Typography variant="caption" component="p" color="text.secondary" sx={{py: 1.5, borderTop: 1, borderColor: "divider"}}>
                🏆 {t.rewardsRule}
            </Typography>
        </>
    );
}
