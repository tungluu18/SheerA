import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';

import UserCard from 'commons/UserCard';
import PeerGraph from 'commons/PeerGraph';
import { useChannelContext } from 'contexts/channel-context';

import MediaPlayerSeeder from './players/MediaPlayerSeeder';
import MediaPlayerViewer from './players/MediaPlayerViewer';

const useStyles = makeStyles((theme) => ({
  channelInfo: {
    padding: theme.spacing(1),
  }
}));

const MediaPlayer = (props) => {
  const classes = useStyles();
  let { role, parent, children, currentUserId, currentUserDisplayName, } = useChannelContext();

  return (
    <>
      {role === 'seeder'
        ? <MediaPlayerSeeder {...{ ...props, children, currentUserId }} />
        : <MediaPlayerViewer {...{ ...props, parent, children, currentUserId }} />}

      <Paper className={classes.channelInfo} elevation={1}>
        <UserCard username={currentUserDisplayName} role={role} />
        <PeerGraph
          parent={parent}
          children={children}
          currentUserId={currentUserId}
          currentUserDisplayName={currentUserDisplayName} />
      </Paper>
    </>
  );
}

export default MediaPlayer;
