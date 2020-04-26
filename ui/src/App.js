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

const App = (props) => {
  return (
    <Router>
      <Switch>
        <Route exact path='/test' component={TestPage} />
        <Route exact path='/' component={MainPage} />
        <Route path="*">
          <Redirect to="/" />
        </Route>
      </Switch>
    </Router>
  )
}

export default App;
