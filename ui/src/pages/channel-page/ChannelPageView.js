import React, { useEffect, useState } from 'react';

import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import MuiButton from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import LinearProgress from '@material-ui/core/LinearProgress';
import Divider from '@material-ui/core/Divider';
import { makeStyles } from '@material-ui/core/styles';

import Alert from 'commons/Alert';
import { withRoomContext } from 'contexts/room-context';
import { useChannelContext } from 'contexts/channel-context';
import socket from 'services/socket';
import { JOIN_CHANNEL_RESP } from 'services/socket';
import { DisplayMessage } from 'utils/constants';

import ChatRoom from './containers/chat-room/ChatRoom';
import MediaPlayer from './containers/media-player/MediaPlayer';

const useStyles = makeStyles(theme => ({
  root: { padding: theme.spacing(1), },
  mediaPlayer: { marginRight: theme.spacing(1), width: '100%', },
  chatRoom: { marginRight: theme.spacing(1), width: '100%', height: '560px' },
  joinChannelForm: { '& > *': { margin: theme.spacing(1), } },
}));

const ChannelPageView = (props) => {
  const classes = useStyles();
  const { role, joinChannel } = useChannelContext();
  const { match: { params: { channelId } } } = props;
  const [displayName, setDisplayName] = useState();
  const [openJoinChannelDialog, setOpenJoinChannelDialog] = useState(!role ? 1 : 0);
  const [errorMessage, setErrorMessage] = useState();

  const submitJoinChannel = () => {
    setOpenJoinChannelDialog(-1);
    joinChannel({ channelId, displayName });
  }

  const updateDisplayName = (e) => setDisplayName(e.target.value);

  useEffect(
    () => {
      socket.on(JOIN_CHANNEL_RESP, ({ status, error }) => {
        if (status === 0) {
          setOpenJoinChannelDialog(0);
        } else {
          setErrorMessage(error);
          setOpenJoinChannelDialog(1);
        }
      })
    }
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
      <JoinChannelDialog
        isOpen={openJoinChannelDialog}
        submit={submitJoinChannel}
        update={updateDisplayName} />
      <Alert
        clear={setErrorMessage} severity="error"
        message={DisplayMessage(errorMessage)} />
    </Grid>
  );
}

export default withRoomContext(ChannelPageView);

const JoinChannelDialog = ({ isOpen, update, submit }) => {
  const classes = useStyles();

  return (
    <>
      <Dialog open={isOpen !== 0}>
        <DialogTitle>How should we call you?</DialogTitle>
        <Divider />
        <DialogContent className={classes.joinChannelForm}>
          <TextField label="Your display name" name="displayName" onChange={update} />
        </DialogContent>
        <DialogActions>
          <MuiButton color="primary" onClick={submit}>
            Join
          </MuiButton>
        </DialogActions>
        {isOpen === -1 ? <LinearProgress /> : null}
      </Dialog>
    </>
  );
}
