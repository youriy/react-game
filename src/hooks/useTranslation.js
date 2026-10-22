import {useSelector} from "react-redux";
import {languageList} from "../dictionary/languages.js";

/**
 * Хук: тексты интерфейса на языке, выбранном в настройках.
 * Если сохранён неизвестный язык, возвращает русский.
 * @returns {Object<string, string>} словарь вида `{win: "Победа!", start: "Начать игру", ...}`
 * @example
 * const t = useTranslation();
 * return <Button>{t.start}</Button>;
 */
export default function useTranslation() {
    const language = useSelector(state => state.game.language);

    return languageList[language] || languageList.russian;
}
