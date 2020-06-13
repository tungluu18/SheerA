import redis from 'db';

import io from 'socket';
import { CHANNEL_ROUTE_UPDATE } from 'socket/messages';

import {
  CHANNEL_ROUTE_LOCK,
  CHANNEL_ROUTE_ROOT,
  CHANNEL_ROUTE_PARENT,
  CHANNEL_ROUTE_CHILDREN,
  CHANNEL_ROUTE_SUBTREE_SIZE,
} from 'utils/redis-keys';

const MAX_NUMBER_OF_CHILDREN = 2;

const addNode = async (socket, channelId) => {
  try {
    const [parent] = await Promise.all([
      _findCandidate(channelId),
      redis.hset(CHANNEL_ROUTE_SUBTREE_SIZE, socket.id, 1),
    ]);

    if (!parent) {
      // creating a new network with current node as the root
      await redis.hset(CHANNEL_ROUTE_ROOT, channelId, socket.id);
      return;
    }

    const siblings = await _addChild(parent, socket.id);
    io.of('/channels').to(parent).emit(CHANNEL_ROUTE_UPDATE, {
      status: 0, data: { children: siblings },
    });
    socket.emit(CHANNEL_ROUTE_UPDATE, {
      status: 0, data: { parent },
    });
  } catch (error) {
    console.log(error);
    socket.emit(CHANNEL_ROUTE_UPDATE, {
      status: 1, error: error.message,
    });
  }
}

const removeNode = async (socket, channelId) => {
  try {
    const parent = await redis.hget(CHANNEL_ROUTE_PARENT, socket.id);

    if (!parent) {
      // seeder stop seeding their content
      await redis.hdel(CHANNEL_ROUTE_ROOT, channelId);
      return;
    }

    const [siblings, children] = await Promise.all([
      _removeChild(parent, socket.id),
      redis.smembers(`${CHANNEL_ROUTE_CHILDREN}:${socket.id}`),
    ]);

    io.of('/channels').to(parent).emit(CHANNEL_ROUTE_UPDATE, {
      status: 0, data: { children: siblings },
    });
    socket.emit(CHANNEL_ROUTE_UPDATE, {
      status: 0, data: { parent: null },
    });

    if (children.length) {
      // find new parent for every child of removed node
      await redis.del(`${CHANNEL_ROUTE_CHILDREN}:${socket.id}`)
      for (let c of children) {
        const newParent = await _findCandidate(channelId);
        const result = await _addChild(newParent, c);

        io.of('/channels').to(c).emit(CHANNEL_ROUTE_UPDATE, {
          status: 0, data: { parent: newParent },
        });
        io.of('/channels').to(newParent).emit(CHANNEL_ROUTE_UPDATE, {
          status: 0, data: { children: result },
        });
      }
    }
  } catch (error) {
    console.log(error);
    socket.emit(CHANNEL_ROUTE_UPDATE, {
      status: 1, error: error.message,
    });
  }
}

export {
  addNode,
  removeNode,
}

const _findCandidate = async (channelId) => {
  let node = await redis.hget(CHANNEL_ROUTE_ROOT, channelId);

  if (!node) {
    // Network has not been created.
    return undefined;
  }

  while (true) {
    const children = await _getChildrenWithSubtreeSize(node) || [];
    if (children.length < MAX_NUMBER_OF_CHILDREN) {
      break;
    }

    const minSubtree = children.reduce(
      (acc, curVal) =>
        acc === undefined ? Object.assign({}, curVal)
          : acc.subtreeSize < curVal.subtreeSize
            ? Object.assign({}, curVal)
            : acc,
      undefined
    );

    node = minSubtree.id;
  }

  return node;
}

const _addChild = async (parent, child) => {
  /**
   * @params:
   *  - parent, child: socket id of two nodes
   * @return: <Array> children of node parent after adding child
   */
  const [pipelineResults, subtreeSize] = await Promise.all([
    // add `child` to children set of `parent`
    redis.pipeline()
      .sadd(`${CHANNEL_ROUTE_CHILDREN}:${parent}`, child)
      .smembers(`${CHANNEL_ROUTE_CHILDREN}:${parent}`)
      .exec(),
    // get size of subtree at `child`
    redis.hget(CHANNEL_ROUTE_SUBTREE_SIZE, child),
    // set `parent` as parent of `child`
    redis.hset(CHANNEL_ROUTE_PARENT, child, parent),
  ]);
  const siblings = pipelineResults[pipelineResults.length - 1][1];

  let curNode = parent;
  while (curNode) {
    const [parNode] = await Promise.all([
      redis.hget(CHANNEL_ROUTE_PARENT, curNode),
      redis.hincrby(CHANNEL_ROUTE_SUBTREE_SIZE, curNode, parseInt(subtreeSize)),
    ]);
    curNode = parNode;
  }

  return siblings;
}

const _removeChild = async (parent, child) => {
  /**
   * @params:
   *  - parent, child: socket id of two nodes
   * @return: <Array> children of node parent after removing child
   */
  const [pipelineResults, subtreeSize] = await Promise.all([
    // remove `child` from children set of `parent`
    redis.pipeline()
      .srem(`${CHANNEL_ROUTE_CHILDREN}:${parent}`, child)
      .smembers(`${CHANNEL_ROUTE_CHILDREN}:${parent}`)
      .exec(),
    // get size of subtree at `child`
    redis.hget(CHANNEL_ROUTE_SUBTREE_SIZE, child),
    // remove parent of `child`
    redis.hdel(CHANNEL_ROUTE_PARENT, child),
  ]);
  const siblings = pipelineResults[pipelineResults.length - 1][1];

  let curNode = parent;
  while (curNode) {
    const [parNode] = await Promise.all([
      redis.hget(CHANNEL_ROUTE_PARENT, curNode),
      redis.hincrby(CHANNEL_ROUTE_SUBTREE_SIZE, curNode, -parseInt(subtreeSize)),
    ]);
    curNode = parNode;
  }

  return siblings;
}

const _getChildrenWithSubtreeSize = async (node) => {
  const children = await redis.smembers(`${CHANNEL_ROUTE_CHILDREN}:${node}`);
  if (!children.length) { return []; }

  const subtreesSize = await redis.hmget(`${CHANNEL_ROUTE_SUBTREE_SIZE}`, children);
  const result = children.reduce(
    (acc, key, idx) =>
      ([...acc, { id: key, subtreeSize: parseInt(subtreesSize[idx]) }]),
    []
  );

  return result;
}
