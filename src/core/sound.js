/**
 * Звуки игры (Web Audio API) — синтезируются в коде, без звуковых файлов: бандл не растёт,
 * а звук можно подстроить числами в SOUNDS.
 *
 * Браузеры разрешают звук только после того, как игрок нажал на страницу (autoplay-политика),
 * поэтому AudioContext создаётся при первом звуке, а первый звук в игре всегда раздаётся по клику
 * (переворот карточки). Если браузер приостановил звук (свернули вкладку, iPhone прервал звук
 * звонком), контекст возобновляется при следующем звуке. На iPhone звук не слышен при включённом
 * беззвучном режиме — это решение Safari, не игры.
 *
 * Если Web Audio нет или он выдал ошибку, вызовы молча ничего не делают — звук не важнее игры.
 */

/** Общая громкость всех звуков, 0…1. */
const VOLUME = 0.25;

/**
 * Через сколько после открытия второй карточки звучит звук пары, мс: когда её лицо уже видно.
 * В этот же момент начинаются встряска / вспышка карточек (MemoryCard.jsx) — звук и анимация вместе.
 */
export const PAIR_SOUND_DELAY = 250;
const PAIR_T = PAIR_SOUND_DELAY / 1000;

/**
 * Ноты звука.
 * @typedef {Object} Note
 * @property {number} f - частота, Гц
 * @property {number} [to] - частота в конце ноты (плавный переход), Гц
 * @property {number} t - начало от момента вызова, с
 * @property {number} d - длительность, с
 * @property {OscillatorType} [type] - форма волны, по умолчанию 'sine'
 * @property {number} [gain] - громкость ноты, 0…1, по умолчанию 1
 */

/**
 * Звуки: короткие и негромкие, чтобы не надоедали.
 * Звуки пары начинаются через PAIR_SOUND_DELAY — вместе со встряской / вспышкой карточек
 * и не сливаясь со щелчком второй карточки.
 * @type {Object<string, Note[]>}
 */
export const SOUNDS = {
    // Переворот карточки — короткий щелчок
    flip: [
        {f: 700, to: 1100, t: 0, d: 0.05, type: "triangle", gain: 0.6},
    ],
    // Угаданная пара — две ноты вверх
    match: [
        {f: 660, t: PAIR_T, d: 0.1},
        {f: 990, t: PAIR_T + 0.09, d: 0.16},
    ],
    // Неугаданная пара — две ноты вниз, ниже и мягче
    mismatch: [
        {f: 330, t: PAIR_T, d: 0.12, type: "triangle"},
        {f: 247, t: PAIR_T + 0.12, d: 0.18, type: "triangle"},
    ],
    // Подсказка — «волшебное» скольжение вверх
    hint: [
        {f: 500, to: 1300, t: 0, d: 0.35, gain: 0.5},
        {f: 750, to: 1950, t: 0.05, d: 0.35, gain: 0.3},
    ],
    // Победа — аккорд до мажор по нотам
    win: [
        {f: 523, t: 0, d: 0.14},
        {f: 659, t: 0.12, d: 0.14},
        {f: 784, t: 0.24, d: 0.14},
        {f: 1047, t: 0.36, d: 0.45},
        {f: 784, t: 0.36, d: 0.45, gain: 0.5},
    ],
};

/** На сколько полутонов выше звучит угаданная пара с каждой следующей парой серии, и предел подъёма. */
const STREAK_STEP = 2;
const STREAK_MAX_STEPS = 6;

let context = null;

/** @returns {boolean} есть ли в браузере Web Audio API */
export const canPlaySound = () =>
    typeof window !== "undefined" && Boolean(window.AudioContext || window.webkitAudioContext);

/**
 * AudioContext игры: создаётся при первом звуке и возобновляется, если браузер его приостановил.
 * @returns {AudioContext|null}
 */
const getContext = () => {
    if (!context) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        context = new AudioContextClass();
    }
    if (context.state !== "running") {
        // resume возвращает Promise; отказ браузера не должен попасть в консоль как необработанная ошибка
        Promise.resolve(context.resume()).catch(() => {});
    }

    return context;
};

/**
 * Играет одну ноту: осциллятор с быстрой атакой и затуханием (без щелчков в начале и конце).
 * @param {AudioContext} ctx
 * @param {Note} note
 * @param {number} pitch - множитель частоты (сдвиг высоты)
 */
const playNote = (ctx, {f, to, t, d, type = "sine", gain = 1}, pitch) => {
    const start = ctx.currentTime + t;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(f * pitch, start);
    if (to) {
        osc.frequency.exponentialRampToValueAtTime(to * pitch, start + d);
    }

    amp.gain.setValueAtTime(0.0001, start);
    amp.gain.exponentialRampToValueAtTime(VOLUME * gain, start + 0.01);
    amp.gain.exponentialRampToValueAtTime(0.0001, start + d);

    osc.connect(amp).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + d + 0.02);
};

/**
 * Играет звук. Выключен ли звук в настройках, проверяет вызывающий код (useMemoryGame).
 * @param {keyof SOUNDS} name - один из SOUNDS
 * @param {number} [streak] - для 'match': серия угаданных пар; чем длиннее, тем выше звук
 *   (на STREAK_STEP полутонов за пару, не больше STREAK_MAX_STEPS шагов)
 */
export const playSound = (name, streak = 1) => {
    if (!canPlaySound()) {
        return;
    }

    try {
        const ctx = getContext();
        const steps = Math.min(Math.max(streak - 1, 0), STREAK_MAX_STEPS);
        const pitch = Math.pow(2, steps * STREAK_STEP / 12);

        SOUNDS[name].forEach(note => playNote(ctx, note, pitch));
    } catch (e) {
        // Браузер отказал в звуке — играем без него
    }
};
