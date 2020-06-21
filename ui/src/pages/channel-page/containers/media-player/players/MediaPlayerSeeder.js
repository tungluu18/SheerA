import React, { useRef, useEffect, } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { useChannelRTCContext, withChannelRTCContext } from 'contexts/channel-rtc-context'

const useStyles = makeStyles(() => ({
  stretch: { height: '100%', width: '100%', }
}));

const _screenCapture = async () => {
  if (navigator.getDisplayMedia) {
    return navigator.getDisplayMedia({ video: true, audio: true, });
  } else if (navigator.mediaDevices.getDisplayMedia) {
    return navigator.mediaDevices.getDisplayMedia({ video: true, audio: true, });
  } else {
    return navigator.mediaDevices.getUserMedia({
      video: { mediaSource: 'screen' },
      audio: { mediaSource: 'screen' },
    });
  }
}

const MediaPlayerSeeder = () => {
  const classes = useStyles();
  const videoRef = useRef();
  const { setLocalStream } = useChannelRTCContext();

  const handleLoadedVideo = () => {
    const stream = videoRef.current.captureStream();
    setLocalStream(stream);
  }

  // useEffect(
  //   () => {
  //     _screenCapture()
  //       .then(stream => {
  //         console.log('Em lay duoc roi', stream);
  //         videoRef.current.srcObject = stream;
  //       });
  //   },
  //   []
  // );

  return (
    <video
      ref={videoRef}
      autoPlay muted controls loop
      className={classes.stretch}
      onPlay={handleLoadedVideo}>
      <source src="/video/frag_bunny.mp4" />
    </video>
  );
}

export default withChannelRTCContext(MediaPlayerSeeder);
