import React from 'react';
import ReactDOM from 'react-dom';
import EntryComponent from "./EntryComponent";
import './index.css';
import './App.css';
import {BrowserRouter, Route} from 'react-router-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <React.StrictMode>
    <h3 className="App">F & A GTTS Entry Application</h3>
    <BrowserRouter>
    <Route exact path='/' component={App}></Route>
    <Route path='/EntryPage' component={EntryComponent}></Route>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
