import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect
} from 'react-router-dom';
import './App.css';

import MainPage from 'pages/main-page/MainPage';
import TestPage from 'pages/test-page/TestPage';
import DataTransferPage from 'pages/data-transfer-page/DataTransferPage';

import { RoomProvider } from 'contexts/room-context';

const App = (props) => {
  return (
    <RoomProvider>
      <Router>
        <Switch>
          <Route exact path='/data-transfer' component={DataTransferPage} />
          <Route exact path='/test' component={TestPage} />
          <Route exact path='/' component={MainPage} />
          <Route path="*">
            <Redirect to="/" />
          </Route>
        </Switch>
      </Router>
    </RoomProvider>
  )
}

export default App;
