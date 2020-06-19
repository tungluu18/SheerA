import React from 'react';

import stringHash from 'string-hash';

import MediaPlayerSeeder from './players/MediaPlayerSeeder';
import MediaPlayerViewer from './players/MediaPlayerViewer';

import { useChannelContext } from 'contexts/channel-context';

const _hashUserId = (userId) => {
  return !userId ? userId
    : Array.isArray(userId)
      ? userId.map(id => "Anon" + stringHash(id))
      : "Anon" + stringHash(userId)
}

const MediaPlayer = (props) => {
  let { role, parent, children, currentUserId } = useChannelContext();

  currentUserId = _hashUserId(currentUserId);
  parent = _hashUserId(parent);
  children = _hashUserId(children);

  return (
    role === 'seeder'
      ? <MediaPlayerSeeder {...{ ...props, children, currentUserId }} />
      : <MediaPlayerViewer {...props} parent={parent} children={children} />
  );
}

export default MediaPlayer;
