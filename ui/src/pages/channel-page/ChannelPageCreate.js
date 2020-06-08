import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import Grid from '@material-ui/core/Grid';
import Alert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';

import Button from 'commons/Button';
import socket from 'services/socket';
import { CREATE_CHANNEL, CREATE_CHANNEL_RESP } from 'services/socket';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(1),
  }
}));

const ChannelPageCreate = () => {
  let history = useHistory();
  const classes = useStyles();
  const [message, setMessage] = useState();

  const handleCreateChannel = () => {
    socket.emit(CREATE_CHANNEL);
  }

  useEffect(
    () => {
      socket.on(CREATE_CHANNEL_RESP, ({status, error, data}) => {
        if (status === 0) {
          history.push(`/channels/${data.channelId}`);
        } else {
          console.log(CREATE_CHANNEL_RESP, error);
          setMessage(error);
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
      <Grid container direction="column" alignItems="center" className={classes.root}>
        <Button onClick={handleCreateChannel}>Create new channel</Button>
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