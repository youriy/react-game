/**
 * Точка входа приложения: подключает Redux-хранилище и монтирует игру в #root.
 * ErrorBoundary показывает экран ошибки вместо белого экрана, если игра упала при отрисовке.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import Game from './components/Game.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import {store} from "./store/store.js";
import { Provider } from 'react-redux'
import './sass/main.scss'

ReactDOM.render(
    <Provider store={store}>
      <ErrorBoundary>
        <Game/>
      </ErrorBoundary>
    </Provider>,
    document.getElementById('root')
);

