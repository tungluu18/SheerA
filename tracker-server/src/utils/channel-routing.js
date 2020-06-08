import redis from 'db';
import * as usersDB from 'db/users';

import io from 'socket';
import { CHANNEL_ROUTE_UPDATE } from 'socket/messages';

import {
  CHANNEL_ROUTE_DEPTH,
  CHANNEL_ROUTE_NODE,
  CHANNEL_ROUTE_CHILDREN,
} from 'utils/redis-keys';

const MAX_NUMBER_OF_CHILDREN = 2;

const addNode = async (socket, channelId) => {
  let parent = null;

  const candidates = await redis.zpopmin(`${CHANNEL_ROUTE_DEPTH}:${channelId}`);

  if (!candidates.length) {
    // first node joins channel
    await Promise.all([
      redis.zadd(`${CHANNEL_ROUTE_DEPTH}:${channelId}`, 0.0, socket.id),
      redis.hmset(`${CHANNEL_ROUTE_NODE}:${socket.id}`, 'depth', 0),
    ]);
  } else {
    // node is the highest one that does not have enough children
    parent = candidates[0];

    const [depth, nodeChildren] = await Promise.all([
      redis.hget(`${CHANNEL_ROUTE_NODE}:${parent}`, 'depth'),
      redis.smembers(`${CHANNEL_ROUTE_CHILDREN}:${parent}`),
    ]);

    await Promise.all([
      _addNewChild(parent, socket.id),
      redis.zadd(`${CHANNEL_ROUTE_DEPTH}:${channelId}`, depth + 1, socket.id),
      redis.hmset(`${CHANNEL_ROUTE_NODE}:${socket.id}`, 'parent', parent, 'depth', depth + 1),
    ]);

    io.of('/channels').to(parent).emit(CHANNEL_ROUTE_UPDATE, {
      status: 0,
      data: { children: [...nodeChildren, socket.id], }
    });

    socket.emit(CHANNEL_ROUTE_UPDATE, {
      status: 0,
      data: { parent, }
    });

    if (nodeChildren.length + 1 < MAX_NUMBER_OF_CHILDREN) {
      await redis.zadd(`${CHANNEL_ROUTE_DEPTH}:${channelId}`, depth, parent);
    }
  }
}

const removeNode = (socket, channelId) => {

}

const _getAllChidlren = node => {

}


const _addNewChild = async (node, child) => {
  await redis.sadd(`${CHANNEL_ROUTE_CHILDREN}:${node}`, child);
}

const _removeChild = node => {

}

export {
  addNode,
  removeNode,
}
