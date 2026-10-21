import moment from "moment";
import Helper from "./Helper.jsx";

const RESULTS_KEY = "results";

export const loadSetting = (key, defaultValue) => localStorage.getItem(key) || defaultValue;

export const saveSetting = (key, value) => {
    localStorage.setItem(key, value);
};

export const loadResults = () => {
    try {
        return JSON.parse(localStorage.getItem(RESULTS_KEY)) || [];
    } catch (e) {
        return [];
    }
};

export const saveResult = ({count, time}) => {
    const results = loadResults();

    results.push({
        date: moment().format('YYYY-MM-DD HH:mm:ss'),
        try: count,
        time: Helper.formatTime(time)
    });

    localStorage.setItem(RESULTS_KEY, JSON.stringify(results));
};
