/**
 * Вибрация телефона (Vibration API).
 *
 * Работает в браузерах Android (Chrome, Яндекс Браузер, Firefox). На iPhone (Safari) и на компьютерах
 * API нет или нет вибромотора — тогда вызов просто ничего не делает. Браузер разрешает вибрацию
 * только после того, как игрок хотя бы раз нажал на страницу; в игре это всегда так.
 */

/**
 * Узоры вибрации: число — длительность, мс; массив — вибрация, пауза, вибрация…
 * Короткие, чтобы не надоедали: угаданная пара — лёгкий толчок, ошибка — двойной, победа — три.
 */
export const VIBRATION = {
    match: 30,
    mismatch: [40, 60, 40],
    win: [80, 60, 80, 60, 160],
};

/**
 * Есть ли смысл предлагать вибрацию: браузер поддерживает Vibration API и у устройства сенсорный экран.
 * Проверка экрана нужна, потому что Chrome на компьютере тоже «умеет» vibrate, но вибромотора там нет.
 * @returns {boolean}
 */
export const canVibrate = () =>
    typeof navigator !== "undefined" && typeof navigator.vibrate === "function" &&
    typeof window !== "undefined" && typeof window.matchMedia === "function" &&
    window.matchMedia("(any-pointer: coarse)").matches;

/**
 * Вибрирует, если устройство умеет. Выключена ли вибрация в настройках, проверяет вызывающий код
 * (useMemoryGame).
 * @param {number|number[]} pattern - один из VIBRATION
 */
export const vibrate = (pattern) => {
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
        try {
            navigator.vibrate(pattern);
        } catch (e) {
            // Некоторые браузеры бросают ошибку вместо отказа — вибрация не важнее игры
        }
    }
};
