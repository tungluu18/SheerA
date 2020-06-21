import React, { useRef, useEffect, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { useChannelRTCContext, withChannelRTCContext } from 'contexts/channel-rtc-context';

const useStyles = makeStyles(() => ({
  stretch: { height: '100%', width: '100%', }
}));

const MediaPlayerViewer = () => {
  const classes = useStyles();
  const videoRef = useRef();

  const { localStream } = useChannelRTCContext();

  useEffect(
    () => {
      videoRef.current.srcObject = localStream;
    },
    [localStream]
  );

  return (
    <video ref={videoRef} autoPlay muted controls className={classes.stretch} />
  );
}

export default withChannelRTCContext(MediaPlayerViewer);
