import AcUnitIcon from "@mui/icons-material/AcUnit";
import AdbIcon from "@mui/icons-material/Adb";
import AirplanemodeActiveIcon from "@mui/icons-material/AirplanemodeActive";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import BuildIcon from "@mui/icons-material/Build";
import CloudIcon from "@mui/icons-material/Cloud";
import ComputerIcon from "@mui/icons-material/Computer";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import ExtensionIcon from "@mui/icons-material/Extension";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import LocalFloristIcon from "@mui/icons-material/LocalFlorist";
import LocalPostOfficeIcon from "@mui/icons-material/LocalPostOffice";
import MoodIcon from "@mui/icons-material/Mood";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ParkIcon from "@mui/icons-material/Park";
import SchoolIcon from "@mui/icons-material/School";
import PetsIcon from "@mui/icons-material/Pets";
import StarIcon from "@mui/icons-material/Star";
import FavoriteIcon from "@mui/icons-material/Favorite";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import LocalCafeIcon from "@mui/icons-material/LocalCafe";

/**
 * Иконки для карточек: имя → компонент иконки MUI.
 * Каждая иконка в колоде — одна пара (две карточки). Для партии берётся столько случайных
 * иконок, сколько пар на выбранном уровне (core/levels.js), поэтому иконок должно быть
 * не меньше, чем пар на самом сложном уровне (сейчас 24).
 * @type {Object<string, React.ComponentType>}
 */
export const cardIcons = {
    AcUnitIcon,
    AdbIcon,
    AirplanemodeActiveIcon,
    Brightness7Icon,
    BuildIcon,
    CloudIcon,
    ComputerIcon,
    DirectionsCarIcon,
    DirectionsBoatIcon,
    ExtensionIcon,
    FlashOnIcon,
    LocalFireDepartmentIcon,
    LocalFloristIcon,
    LocalPostOfficeIcon,
    MoodIcon,
    NotificationsIcon,
    ParkIcon,
    SchoolIcon,
    PetsIcon,
    StarIcon,
    FavoriteIcon,
    MusicNoteIcon,
    SportsSoccerIcon,
    LocalCafeIcon,
};
