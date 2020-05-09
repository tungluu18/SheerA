import React from 'react';
import { useLocation } from 'react-router-dom';

import { PeerConnectionProvider } from 'contexts/peer-connection-context';
import { useRoomContext } from 'contexts/room-context';

import MediaPlayerSeeder from './players/MediaPlayerSeeder';
import MediaPlayerViewer from './players/MediaPlayerViewer';

const useQuery = () => new URLSearchParams(useLocation().search);

const MediaPlayer = (props) => {
  // const queries = useQuery();
  // const isSeeder = queries.get("seeder") || 0;
  const { users, currentUserId } = useRoomContext();
  const currentUser = users.find(e => e.id === currentUserId);

  return (
    <PeerConnectionProvider>
      {(currentUser || {}).role === 'seeder'
        ? <MediaPlayerSeeder {...props} />
        : <MediaPlayerViewer {...props} />
      }
    </PeerConnectionProvider>
  );
}

export default MediaPlayer;
