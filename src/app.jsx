/**
 * Точка входа приложения: подключает Redux-хранилище и монтирует игру в #root.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import Game from './components/Game.jsx'
import {store} from "./store/store.js";
import { Provider } from 'react-redux'
import './sass/main.scss'

ReactDOM.render(
    <Provider store={store}>
      <Game/>
    </Provider>,
    document.getElementById('root')
);

