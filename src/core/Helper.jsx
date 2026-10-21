/**
 * Вспомогательные функции общего назначения.
 * Экспортируется готовый экземпляр: `Helper.shuffle(...)`, `Helper.formatTime(...)`.
 */
class Helper {

    /**
     * Перемешивает массив на месте (алгоритм Фишера — Йетса).
     * @template T
     * @param {T[]} array - массив, который нужно перемешать (будет изменён)
     * @returns {T[]} тот же массив, уже перемешанный
     */
    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }

        return array;
    }

    /**
     * Форматирует длительность в строку вида «ЧЧ : ММ : СС».
     * @param {number} time - длительность в секундах
     * @returns {string} например, `formatTime(75)` → "00 : 01 : 15"
     */
    formatTime(time) {
        const getSeconds = `0${(time % 60)}`.slice(-2)
        const minutes = `${Math.floor(time / 60)}`
        const getMinutes = `0${minutes % 60}`.slice(-2)
        const getHours = `0${Math.floor(time / 3600)}`.slice(-2)

        return `${getHours} : ${getMinutes} : ${getSeconds}`
    }
}

export default new Helper()