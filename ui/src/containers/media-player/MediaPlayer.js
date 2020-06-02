import React from 'react';

import MediaPlayerSeeder from './players/MediaPlayerSeeder';
import MediaPlayerViewer from './players/MediaPlayerViewer';

const MediaPlayer = (props) => {
  const { role } = props;

  return (
    role === 'seeder'
      ? <MediaPlayerSeeder {...props} />
      : <MediaPlayerViewer {...props} />
  );
}

export default MediaPlayer;
