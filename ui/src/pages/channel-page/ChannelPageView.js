import React, { useEffect } from 'react';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';

import { useChannelContext } from 'contexts/channel-context';
import { withRoomContext } from 'contexts/room-context';

import ChatRoom from './containers/chat-room/ChatRoom';
import MediaPlayer from './containers/media-player/MediaPlayer';

const useStyles = makeStyles(theme => ({
  root: { padding: theme.spacing(1), },
  mediaPlayer: { marginRight: theme.spacing(1), width: '100%', },
  chatRoom: { marginRight: theme.spacing(1), width: '100%', }
}));

const ChannelPageView = (props) => {
  const classes = useStyles();
  const { role, joinChannel } = useChannelContext();
  const { match: { params: { channelId } } } = props;

  useEffect(
    () => {
      if (!role) { joinChannel(channelId); }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <Grid container className={classes.root} justify="space-around">
      <Grid container item xs={8} alignItems="center" justify="center">
        <div className={classes.mediaPlayer}>
          <MediaPlayer />
        </div>
      </Grid>
      <Grid container item xs={3}>
        <Paper className={classes.chatRoom} elavation={0}>
          <ChatRoom channelId={channelId} />
        </Paper>
      </Grid>
    </Grid>

  );
}

export default withRoomContext(ChannelPageView);
