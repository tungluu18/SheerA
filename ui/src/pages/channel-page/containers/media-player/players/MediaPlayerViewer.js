import React, { useRef, useEffect, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { useChannelRTCContext, withChannelRTCContext } from 'contexts/channel-rtc-context';

const useStyles = makeStyles(() => ({
  stretch: { height: '100%', width: '100%', }
}));

const MediaPlayerViewer = ({ currentUserId, parent, children }) => {
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
    <div>
      <p>Viewer: {currentUserId}</p>
      <video ref={videoRef} autoPlay muted controls className={classes.stretch} />

      <>
        <p>Receive from:</p>
        <li>{parent}</li>
      </>

      {(children || []).length
        ? <>
          <p>Forward to:</p>
          <ul>
            {(children || []).map((e, index) => <li key={index}>{e}</li>)}
          </ul>
        </>
        : null}
    </div>
  );
}

export default withChannelRTCContext(MediaPlayerViewer);
