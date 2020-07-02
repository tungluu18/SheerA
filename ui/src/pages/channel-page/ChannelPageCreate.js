import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useHistory } from 'react-router-dom';


import Button from 'commons/Button';
import socket from 'services/socket';
import { CREATE_CHANNEL, CREATE_CHANNEL_RESP } from 'services/socket';

import Grid from '@material-ui/core/Grid';
import Alert from '@material-ui/lab/Alert';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import MuiButton from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import LinearProgress from '@material-ui/core/LinearProgress';
import Divider from '@material-ui/core/Divider';
import { makeStyles } from '@material-ui/core/styles';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(1),
    height: '100vh',
  },
  createChannelForm: {
    '& > *': {
      margin: theme.spacing(1),
    }
  }
}));

const ChannelPageCreate = () => {
  let history = useHistory();
  const classes = useStyles();
  const [message, setMessage] = useState();
  const [createChannel, setCreateChannel] = useState(0);
  const [channelInfo, setChannelInfo] = useState({});

  const handleCreateChannel = () => {
    setCreateChannel(1);
  }

  const updateChannelInfo = (e) =>
    setChannelInfo({ ...channelInfo, [e.target.name]: e.target.value });

  const submitChannelInfo = () => {
    setCreateChannel(-1);
    socket.emit(CREATE_CHANNEL, channelInfo);
  }

  useEffect(
    () => {
      socket.on(CREATE_CHANNEL_RESP, ({ status, error, data }) => {
        if (status === 0) {
          history.push(`/channels/${data.channelId}`);
        } else {
          console.log(CREATE_CHANNEL_RESP, error);
          setMessage(error);
          setCreateChannel(1);
        }
      });

      return () => {
        socket.off(CREATE_CHANNEL_RESP);
      }
    },
    [history]
  );

  return (
    <>
      <Grid
        className={classes.root} container
        direction="column" alignItems="center" justify="center">
        <img className='sheera-logo-primary' />
        <br />
        <Button
          onClick={handleCreateChannel}
          startIcon={<AddCircleOutlineIcon />}>
          Create new channel
        </Button>
        <CreateChannelDialog
          hide={() => setCreateChannel(0)}
          update={updateChannelInfo}
          submit={submitChannelInfo}
          isOpen={createChannel} />
        {!!message
          ? <Alert
            severity="error"
            onClose={() => setMessage(undefined)}
          >
            {message}
          </Alert>
          : null
        }
      </Grid>
    </>
  );
}

export default ChannelPageCreate;

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
