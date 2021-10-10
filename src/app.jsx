import React from 'react';
import ReactDOM from 'react-dom';
import Game from './components/Game.jsx'
import {store} from "./store/store.jsx";
import { Provider } from 'react-redux'
import './sass/main.scss'

ReactDOM.render(
    <Provider store={store}>
      <Game/>
    </Provider>,
    document.getElementById('root')
);

