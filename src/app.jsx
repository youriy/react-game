/**
 * Точка входа приложения: подключает Redux-хранилище и монтирует игру в #root.
 * ErrorBoundary показывает экран ошибки вместо белого экрана, если игра упала при отрисовке.
 */
import React from 'react';
import {createRoot} from 'react-dom/client';
import Game from './components/Game.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import {store} from "./store/store.js";
import { Provider } from 'react-redux'
import './sass/main.scss'

// React 18: корень создаётся через createRoot (ReactDOM.render устарел)
createRoot(document.getElementById('root')).render(
    <Provider store={store}>
      <ErrorBoundary>
        <Game/>
      </ErrorBoundary>
    </Provider>
);

