import {createSlice} from "@reduxjs/toolkit";
import Helper from "../core/Helper.jsx";

const nps = [
    { id: 0, type: 1, icon: 'AcUnitIcon', open: false, delete: false},
    { id: 1, type: 1, icon: 'AcUnitIcon', open: false, delete: false},
    { id: 2, type: 2, icon: 'AdbIcon', open: false, delete: false},
    { id: 3, type: 2, icon: 'AdbIcon', open: false, delete: false},
    { id: 4, type: 3, icon: 'AirplanemodeActiveIcon', open: false, delete: false},
    { id: 5, type: 3, icon: 'AirplanemodeActiveIcon', open: false, delete: false},
    { id: 6, type: 4, icon: 'Brightness7Icon', open: false, delete: false},
    { id: 7, type: 4, icon: 'Brightness7Icon', open: false, delete: false},
    { id: 8, type: 5, icon: 'BuildIcon', open: false, delete: false},
    { id: 9, type: 5, icon: 'BuildIcon', open: false, delete: false},
    { id: 10, type: 6, icon: 'CloudIcon', open: false, delete: false},
    { id: 11, type: 6, icon: 'CloudIcon', open: false, delete: false},
    { id: 12, type: 7, icon: 'ComputerIcon', open: false, delete: false},
    { id: 13, type: 7, icon: 'ComputerIcon', open: false, delete: false},
    { id: 14, type: 8, icon: 'DirectionsCarIcon', open: false, delete: false},
    { id: 15, type: 8, icon: 'DirectionsCarIcon', open: false, delete: false},
    { id: 16, type: 9, icon: 'DirectionsBoatIcon', open: false, delete: false},
    { id: 17, type: 9, icon: 'DirectionsBoatIcon', open: false, delete: false},
    { id: 18, type: 10, icon: 'ExtensionIcon', open: false, delete: false},
    { id: 19, type: 10, icon: 'ExtensionIcon', open: false, delete: false},
    { id: 20, type: 11, icon: 'FlashOnIcon', open: false, delete: false},
    { id: 21, type: 11, icon: 'FlashOnIcon', open: false, delete: false},
    { id: 22, type: 12, icon: 'LocalFireDepartmentIcon', open: false, delete: false},
    { id: 23, type: 12, icon: 'LocalFireDepartmentIcon', open: false, delete: false},
    { id: 24, type: 13, icon: 'LocalFloristIcon', open: false, delete: false},
    { id: 25, type: 13, icon: 'LocalFloristIcon', open: false, delete: false},
    { id: 26, type: 14, icon: 'LocalPostOfficeIcon', open: false, delete: false},
    { id: 27, type: 14, icon: 'LocalPostOfficeIcon', open: false, delete: false},
    { id: 28, type: 15, icon: 'MoodIcon', open: false, delete: false},
    { id: 29, type: 15, icon: 'MoodIcon', open: false, delete: false},
    { id: 30, type: 16, icon: 'NotificationsIcon', open: false, delete: false},
    { id: 31, type: 16, icon: 'NotificationsIcon', open: false, delete: false},
    { id: 32, type: 17, icon: 'ParkIcon', open: false, delete: false},
    { id: 33, type: 17, icon: 'ParkIcon', open: false, delete: false},
    { id: 34, type: 18, icon: 'SchoolIcon', open: false, delete: false},
    { id: 35, type: 18, icon: 'SchoolIcon', open: false, delete: false},
];

const itemsSlice = createSlice({
    name: "items",
    initialState: {
        items: Helper.shuffle([...nps])
    },
    reducers: {
        setOpen(state, action) {
            state.items[action.payload].open = true;
        },
        setClose(state, action) {
            state.items[action.payload].open = false;
        },
        setDelete(state, action) {
            state.items[action.payload].delete = true;
            state.items[action.payload].open = false;
        },
        resetItems(state) {
            state.items = Helper.shuffle([...nps]);
        }
    }
});

export default itemsSlice.reducer
export const {setOpen, setClose, setDelete, resetItems} = itemsSlice.actions