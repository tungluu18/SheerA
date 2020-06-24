import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';

import UserCard from 'commons/UserCard';
import PeerGraph from 'commons/PeerGraph';
import { useChannelContext } from 'contexts/channel-context';
import { hashUserId } from 'utils/common';

import MediaPlayerSeeder from './players/MediaPlayerSeeder';
import MediaPlayerViewer from './players/MediaPlayerViewer';

const useStyles = makeStyles((theme) => ({
  channelInfo: {
    padding: theme.spacing(1),
  }
}));

const MediaPlayer = (props) => {
  const classes = useStyles();
  let { role, parent, children, currentUserId } = useChannelContext();

  currentUserId = hashUserId(currentUserId);
  parent = hashUserId(parent);
  children = hashUserId(children);

  return (
    <>
      {role === 'seeder'
        ? <MediaPlayerSeeder {...{ ...props, children, currentUserId }} />
        : <MediaPlayerViewer {...{ ...props, parent, children, currentUserId }} />}

      <Paper className={classes.channelInfo} elevation={1}>
        <UserCard userId={currentUserId} role={role} />
        <PeerGraph
          parent={parent}
          children={children}
          currentUserId={currentUserId} />
      </Paper>
    </>
  );
}

export default MediaPlayer;
