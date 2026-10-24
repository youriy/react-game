import {cardIcons} from "./icons.js";

/**
 * Наборы картинок для карточек. «Классика» — иконки MUI (icons.js), доступна всегда.
 * Остальные — маленькие SVG-файлы в public/images/<id набора>/<имя>.svg (Fluent Emoji Flat от Microsoft,
 * лицензия MIT — public/images/LICENSE.txt). Файлы грузятся браузером только для выбранного набора.
 *
 * Наборы — награда за достижения, как рубашки (core/cardBacks.js): набор открывается, когда сумма баллов славы
 * (getTotalGlory в core/achievements.js) дойдёт до порога `glory`; баллы не тратятся.
 * Выбранный набор — настройка `pictureSet` (gameSlice, localStorage); во время партии его не поменять.
 * Ключи `id` лежат в настройках у игроков — не переименовывать.
 *
 * Чтобы добавить набор: положить SVG в public/images/<id>/, дописать элемент в pictureSetList
 * (id, порог, имена картинок; их не меньше, чем пар на самом сложном уровне, — сейчас 21)
 * и название `pictures<Id>` во все языки в dictionary/languages.js.
 */

/** Набор по умолчанию и для неизвестного значения в настройках. */
export const DEFAULT_PICTURE_SET = "classic";

/**
 * Все наборы по возрастанию порога. id — ключ (настройка `pictureSet`, название `pictures<Id>` в словаре,
 * папка с картинками); glory — сколько баллов славы нужно; pictures — имена картинок (у «Классики» — имена иконок
 * из cardIcons); cover — четыре картинки для образца набора на плитке выбора.
 * @type {Array<{id: string, glory: number, pictures: string[], cover: string[]}>}
 */
export const pictureSetList = [
    {
        id: "classic",
        glory: 0,
        pictures: Object.keys(cardIcons),
        cover: ["StarIcon", "FavoriteIcon", "PetsIcon", "MusicNoteIcon"],
    },
    {
        id: "animals",
        glory: 30,
        pictures: ["cat", "dog", "fox", "panda", "owl", "rabbit", "bear", "koala", "tiger", "lion", "cow", "pig",
            "frog", "monkey", "penguin", "wolf", "raccoon", "hamster", "hedgehog", "giraffe", "elephant", "zebra", "parrot", "squirrel"],
        cover: ["cat", "fox", "panda", "owl"],
    },
    {
        id: "fruits",
        glory: 80,
        pictures: ["redApple", "greenApple", "pear", "lime", "lemon", "banana", "watermelon", "grapes", "strawberry",
            "blueberries", "cherries", "peach", "mango", "pineapple", "coconut", "kiwi", "melon", "eggplant", "avocado", "olive", "chestnut"],
        cover: ["strawberry", "banana", "watermelon", "cherries"],
    },
    {
        id: "food",
        glory: 130,
        pictures: ["pizza", "burger", "hotDog", "fries", "taco", "sandwich", "croissant", "pretzel", "cheese", "pancakes",
            "waffle", "friedEgg", "popcorn", "donut", "cookie", "cake", "shortcake", "cupcake", "iceCream", "chocolate",
            "candy", "lollipop", "pudding", "honey"],
        cover: ["pizza", "donut", "cupcake", "iceCream"],
    },
    {
        id: "space",
        glory: 200,
        pictures: ["saturn", "earth", "crescent", "sun", "star", "comet", "rocket", "ufo", "satellite", "alien", "galaxy",
            "telescope", "astronaut", "newMoon", "fullMoon", "halfMoon", "shootingStar", "sparkles", "sunFace", "invader",
            "asteroid", "antenna"],
        cover: ["rocket", "saturn", "ufo", "alien"],
    },
    {
        id: "sea",
        glory: 320,
        pictures: ["fish", "tropicalFish", "blowfish", "shark", "whale", "sailboat", "dolphin", "seal", "octopus", "squid",
            "crab", "lobster", "shrimp", "shell", "jellyfish", "turtle", "otter", "coral", "wave", "anchor", "island", "mask"],
        cover: ["octopus", "tropicalFish", "crab", "whale"],
    },
];

/**
 * Набор по ключу; неизвестный ключ — «Классика».
 * @param {string} id
 */
export const getPictureSet = (id) => pictureSetList.find(set => set.id === id) || pictureSetList[0];

/**
 * Открыт ли набор при данной сумме баллов славы.
 * @param {{glory: number}} set
 * @param {number} glory
 * @returns {boolean}
 */
export const isPictureSetUnlocked = (set, glory) => glory >= set.glory;

/**
 * Ключ названия набора в словаре.
 * @param {string} id - например, 'sea'
 * @returns {string} например, 'picturesSea'
 */
export const getPictureSetTextKey = (id) => `pictures${id[0].toUpperCase()}${id.slice(1)}`;

/**
 * Адрес SVG-картинки набора (относительный, как шрифты в index.html, — игра работает и не из корня сайта).
 * @param {string} setId - ключ набора, не 'classic'
 * @param {string} picture - имя картинки
 * @returns {string} например, 'images/sea/crab.svg'
 */
export const getPictureUrl = (setId, picture) => `images/${setId}/${picture}.svg`;

// Наборы, картинки которых уже запрошены (и лежат в кеше браузера)
const preloaded = new Set();

/**
 * Заранее загружает картинки набора, чтобы при первом перевороте карточка не открывалась пустой.
 * Повторный вызов для того же набора ничего не делает.
 * @param {string} setId
 */
export const preloadPictureSet = (setId) => {
    const set = getPictureSet(setId);

    if (set.id === DEFAULT_PICTURE_SET || preloaded.has(set.id) || typeof Image === "undefined") {
        return;
    }

    preloaded.add(set.id);
    set.pictures.forEach(picture => {
        new Image().src = getPictureUrl(set.id, picture);
    });
};
