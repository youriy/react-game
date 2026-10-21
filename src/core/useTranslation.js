import {useSelector} from "react-redux";
import {languageList} from "./Language";

// Возвращает тексты интерфейса на выбранном языке
export default function useTranslation() {
    const language = useSelector(state => state.game.language);

    return languageList[language] || languageList.russian;
}
