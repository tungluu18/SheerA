import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from 'react-router-dom';
import './App.css';

import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';

import MainPage from 'pages/main-page/MainPage';
import TestPage from 'pages/test-page/TestPage';
import DataTransferPage from 'pages/data-transfer-page/DataTransferPage';
import ChannelPage from 'pages/channel-page/ChannelPage';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  root: { flexGrow: 1 },
  appBar: {
    background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
    height: '3rem',
  },
}));

const App = (props) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <AppBar position="static" className={classes.appBar} />
      <Router>
        <Switch>
          <Route exact path='/data-transfer' component={DataTransferPage} />
          <Route exact path='/test' component={TestPage} />
          <Route path='/channels' component={ChannelPage} />
          <Route path='/' component={ChannelPage} />
        </Switch>
      </Router>
    </div>
  )
}

export default App;
