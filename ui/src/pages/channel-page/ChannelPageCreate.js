import React, { useState, useEffect, } from 'react';
import { useHistory } from 'react-router-dom';


import Button from 'commons/Button';
import Alert from 'commons/Alert';
import socket from 'services/socket';
import {
  CREATE_CHANNEL, CREATE_CHANNEL_RESP,
  FIND_CHANNEL, FIND_CHANNEL_RESP,
} from 'services/socket';
import { DisplayMessage } from 'utils/constants';

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
import CreateChannelIcon from '@material-ui/icons/AddToQueue';
import JoinChannelIcon from '@material-ui/icons/Airplay';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(1),
    height: '100%',
  },
  createChannelForm: {
    '& > *': {
      margin: theme.spacing(1),
    }
  },
  wrapper: {
    '& > *': {
      margin: theme.spacing(2),
      width: '80%',
    }
  }
}));

const ChannelPageCreate = () => {
  let history = useHistory();
  const classes = useStyles();
  const [message, setMessage] = useState();
  const [channelInfo, setChannelInfo] = useState({});
  const [createChannelDialog, setCreateChannelDialog] = useState(0);
  const [joinChannelDialog, setJoinChannelDialog] = useState(0);

  const handleCreateChannel = () => setCreateChannelDialog(1);
  const handleJoinChannel = () => setJoinChannelDialog(1);

  const updateChannelInfo = (e) =>
    setChannelInfo({ ...channelInfo, [e.target.name]: e.target.value });

  const submitChannelInfo = () => {
    setCreateChannelDialog(-1);
    socket.emit(CREATE_CHANNEL, channelInfo);
  }

  const findChannelByName = () => {
    setJoinChannelDialog(-1);
    socket.emit(FIND_CHANNEL, channelInfo);
  }

  useEffect(
    () => {
      socket.on(CREATE_CHANNEL_RESP, ({ status, error, data }) => {
        if (status === 0) {
          history.push(`/channels/${data.channelId}`);
        } else if (status === 1) {
          setMessage(error);
          setCreateChannelDialog(1);
        }
      });

      socket.on(FIND_CHANNEL_RESP, ({ status, error, data }) => {
        if (status === 0) {
          history.push(`/channels/${data.channelId}`);
        } else if (status === 1) {
          setMessage(error);
          setJoinChannelDialog(1);
        }
      });

      return () => {
        socket.off(CREATE_CHANNEL_RESP);
      }
    },
    [history]
  );

  return (
    <Grid container justify="center">
      <Grid
        className={`${classes.root} ${classes.wrapper}`} container item xs={3}
        direction="column" alignItems="center" justify="center">
        <img className='sheera-logo-primary' />
        <Button
          onClick={handleCreateChannel}
          startIcon={<CreateChannelIcon />}>
          Create new channel
        </Button>
        <Button
          onClick={handleJoinChannel}
          startIcon={<JoinChannelIcon />}>
          Join a channel
        </Button>
        <CreateChannelDialog
          hide={() => setCreateChannelDialog(0)}
          update={updateChannelInfo}
          submit={submitChannelInfo}
          isOpen={createChannelDialog} />
        <JoinChannelDialog
          hide={() => setJoinChannelDialog(0)}
          update={updateChannelInfo}
          submit={findChannelByName}
          isOpen={joinChannelDialog} />
        <Alert
          clear={setMessage} severity="error"
          message={DisplayMessage(message)} />
      </Grid>
    </Grid>
  );
}

export default ChannelPageCreate;

const JoinChannelDialog = ({ isOpen, hide, update, submit }) => {
  const classes = useStyles();

  return (
    <>
      <Dialog open={isOpen !== 0}>
        <DialogTitle>Enter channel name</DialogTitle>
        <Divider />
        <DialogContent className={classes.createChannelForm}>
          <TextField label="Channel's name" name="channelName" onChange={update} />
        </DialogContent>
        <DialogActions>
          <MuiButton color="primary" onClick={submit}>
            Join
          </MuiButton>
          <MuiButton color="primary" onClick={hide}>
            Cancel
          </MuiButton>
        </DialogActions>
        {isOpen === -1 ? <LinearProgress /> : null}
      </Dialog>
    </>
  )
}

const CreateChannelDialog = ({ isOpen, hide, update, submit }) => {
  const classes = useStyles();

  return (
    <>
      <Dialog open={isOpen !== 0}>
        <DialogTitle>Create your own channel</DialogTitle>
        <Divider />
        <DialogContent className={classes.createChannelForm}>
          <TextField label="Your display name" name="displayName" onChange={update} />
          <TextField label="Channel's name" name="channelName" onChange={update} />
        </DialogContent>
        <DialogActions>
          <MuiButton color="primary" onClick={submit}>
            Create
          </MuiButton>
          <MuiButton color="primary" onClick={hide}>
            Cancel
          </MuiButton>
        </DialogActions>
        {isOpen === -1 ? <LinearProgress /> : null}
      </Dialog>
    </>
  )
}
