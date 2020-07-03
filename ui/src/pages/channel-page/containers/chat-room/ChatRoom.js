import React, { useEffect, useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import Fab from '@material-ui/core/Fab';
import SendIcon from '@material-ui/icons/Send';
import { ListItemAvatar } from '@material-ui/core';
import { useChannelContext } from 'contexts/channel-context';

import { SEND_MESSAGE, RECEIVE_MESSAGE } from 'services/socket';
import socket from 'services/socket';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    height: '100%',
  },
  messageContent: {
    padding: theme.spacing(1),
  },
  headBG: {
    backgroundColor: '#e0e0e0'
  },
  messageArea: {
    overflowY: 'auto'
  },
  myMessage: {
    // background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
    background: theme.palette.primary.main,
  }
}));

const ChatRoom = () => {
  const classes = useStyles();
  const { currentUserId, currentUserDisplayName } = useChannelContext();
  const messagesRef = useRef([]);
  const [messages, setMessages] = useState();
  const [typingMessage, setTypingMessage] = useState();

  const handleTypingMessageChange = (e) => {
    setTypingMessage(e.target.value);
  }

  const handleSendMessage = () => {
    socket.emit(SEND_MESSAGE, { content: typingMessage, time: new Date() });
    setTypingMessage("");
  }

  useEffect(
    () => {
      socket.on(RECEIVE_MESSAGE, (data) => {
        const newMessages = [...messagesRef.current, data];
        messagesRef.current = newMessages;
        setMessages(newMessages);
      });

      return () => {
        socket.off(RECEIVE_MESSAGE);
      }
    },
    [messages]
  );

  return (
    <Grid container component={Paper} className={classes.root}>
      <Grid container item xs={12} direction="column" justify="space-between">
        <List className={classes.messageArea}>
          {(messages || []).map(
            ({ content, time, displayName, id }, idx) =>
              <Message
                key={idx}
                content={content} time={time}
                currentUserId={currentUserId}
                senderId={id}
                senderName={displayName} />
          )}
        </List>
        <div>
          <Divider />
          <Grid container style={{ padding: '20px' }}>
            <Grid item xs={11}>
              <TextField id="outlined-basic-email" label="Type Something" fullWidth
                value={typingMessage} onChange={handleTypingMessageChange} />
            </Grid>
            <Grid xs={1} align="right">
              <Fab color="primary" aria-label="add" onClick={handleSendMessage}><SendIcon /></Fab>
            </Grid>
          </Grid>
        </div>
      </Grid>
    </Grid >
  );
}

export default ChatRoom;

const Message = ({ content, time, senderName, senderId, currentUserId }) => {
  const classes = useStyles();
  const isSender = senderId === currentUserId;

  return (
    <ListItem>
      <Grid xs={12} container justify={isSender ? "flex-end" : "flex-start"}>
        {isSender ? null :
          <ListItemAvatar>
            <Avatar>
              <AccountCircleIcon />
            </Avatar>
          </ListItemAvatar>
        }
        <Grid item align="right">
          <Paper className={`${classes.messageContent} ${isSender ? classes.myMessage : ''}`}>
            <ListItemText primary={content}></ListItemText>
            <ListItemText secondary={`${senderName} at ${_parseTime(time)}`}></ListItemText>
          </Paper>
        </Grid>
      </Grid>
    </ListItem>
  );
}

const _parseTime = (time) => new Date(time).toString().substr(16, 8);
