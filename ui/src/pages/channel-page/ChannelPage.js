import React from 'react';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

import { makeStyles } from '@material-ui/core/styles';

import ChatRoom from 'containers/chat-room/ChatRoom';
import MediaPlayer from 'containers/media-player/MediaPlayer';
import { withRoomContext } from 'contexts/room-context';

const useStyles = makeStyles(theme => ({
  mediaPlayer: { width: '90%', },
  chatRoom: { marginRight: theme.spacing(1), width: '100%', }
}));

const ChannelPage = (props) => {
  const classes = useStyles();

  const { match: { params: { channelId } } } = props;

  return (
    <>
      <div>Em la channel {channelId}</div>
      <Grid container className={classes.root}>
        <Grid container item xs={3}>
          Channel list
        </Grid>

        <Grid container item xs={6} alignItems="center" justify="center">
          <Paper className={classes.mediaPlayer} elavation={2}>
            <MediaPlayer />
          </Paper>
        </Grid>

        <Grid container item xs={3} spacing={2}>
          <Paper className={classes.chatRoom} elavation={2}>
            <ChatRoom channelId={channelId} />
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}

export default withRoomContext(ChannelPage);
