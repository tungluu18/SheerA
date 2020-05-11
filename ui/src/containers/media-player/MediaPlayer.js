import React from 'react';
import { useRoomContext } from 'contexts/room-context';

import MediaPlayerSeeder from './players/MediaPlayerSeeder';
import MediaPlayerViewer from './players/MediaPlayerViewer';

const MediaPlayer = (props) => {
  const { users, currentUserId } = useRoomContext();
  const currentUser = users.find(e => e.id === currentUserId);

  return (
    (currentUser || {}).role === 'seeder'
      ? <MediaPlayerSeeder {...props} />
      : <MediaPlayerViewer {...props} />
  );
}

export default MediaPlayer;
