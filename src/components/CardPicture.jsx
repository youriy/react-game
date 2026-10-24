import React from 'react';
import Box from '@mui/material/Box';
import {cardIcons} from "../icons/icons.js";
import {DEFAULT_PICTURE_SET, getPictureUrl} from "../icons/pictureSets.js";

/**
 * Картинка карточки из набора (icons/pictureSets.js): у «Классики» — иконка MUI в цвет текста,
 * у остальных наборов — цветная SVG-картинка из public/images. Квадрат size×size по центру.
 * Картинка декоративная (alt пустой): пары узнают по виду, подписей у карточек нет.
 * @param {Object} props
 * @param {string} props.set - ключ набора
 * @param {string} props.picture - имя картинки в наборе
 * @param {string} props.size - CSS-размер, например "60px"
 */
export default function CardPicture({set, picture, size}) {
    if (set === DEFAULT_PICTURE_SET) {
        const Icon = cardIcons[picture];

        return <Icon sx={{fontSize: size, display: "block", mx: "auto"}}/>;
    }

    return (
        <Box
            component="img"
            src={getPictureUrl(set, picture)}
            alt=""
            draggable={false}
            sx={{width: size, height: size, display: "block", mx: "auto", userSelect: "none"}}
        />
    );
}
