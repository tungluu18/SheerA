import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';

import { withChannelContext } from 'contexts/channel-context';

import ChannelPageView from './ChannelPageView';
import ChannelPageCreate from './ChannelPageCreate';

const ChannelPage = ({ match }) => {
  return (
    <Router>
      <Switch>
        <Route exact path={`${match.path}/join`} component={ChannelPageCreate} />
        <Route exact path={`${match.path}/:channelId`} component={ChannelPageView} />
        <Route path="/">
          <Redirect to={`${match.path}/join`} />
        </Route>
      </Switch>
    </Router>
  );
}

export default withChannelContext(ChannelPage);
