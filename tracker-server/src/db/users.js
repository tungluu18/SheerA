import redis from 'db';
import stringHash from 'string-hash';

import { CHANNEL_SET, USER, } from 'utils/redis-keys';

const ERROR_USER_ALREADY_JOINED_ANOTHER_CHANNEL = 'user-already-joined-another-channel';
const ERROR_USER_DOES_NOT_JOIN_ANY_CHANNEL = 'user-does-not-join-any-channel';
const ERROR_USER_IS_NOT_SEEDER = 'user-is-not-seeder';

const CHANNEL_SET_TTL = 60;

const joinChannel = async (userId, channelId, role = 'viewer', { displayName } = {}) => {
  const joinedChannelId = await inChannel(userId);
  if (!!joinedChannelId) {
    if (joinedChannelId !== channelId) {
      throw Error(ERROR_USER_ALREADY_JOINED_ANOTHER_CHANNEL);
    }
    return;
  }

  if (!displayName) displayName = `Anon${stringHash(userId)}`;

  await Promise.all([
    redis.hmset(`${USER}:${userId}`,
      'channel', channelId,
      'role', role,
      'displayName', displayName,
    ),
    redis.sadd(`${CHANNEL_SET}:${channelId}`, userId),
  ]);
}

const leaveChannel = async (userId, channelId) => {
  await Promise.all([
    redis.hdel(`${USER}:${userId}`, 'role'),
    redis.hdel(`${USER}:${userId}`, 'channel'),
    redis.srem(`${CHANNEL_SET}:${channelId}`, userId),
  ]);
}

const getInfoInChannel = async (userId) => {
  const userInfo = await redis.hgetall(`${USER}:${userId}`);
  return userInfo;
}

const inChannel = async (userId) => {
  try {
    const channelId = await redis.hget(`${USER}:${userId}`, 'channel');
    return channelId;
  } catch (error) {
    console.error(error);
  };
}

const extendChannelLive = async (userId) => {
  try {
    const { role, channel } = await getInfoInChannel(userId);
    if (!channel) { throw new Error(ERROR_USER_DOES_NOT_JOIN_ANY_CHANNEL); }
    if (role !== 'seeder') { throw Error(ERROR_USER_IS_NOT_SEEDER); }
    redis.expire(`${CHANNEL_SET}:${channel}`, CHANNEL_SET_TTL);
  } catch (error) {
    console.log(error);
  }
}

export {
  joinChannel,
  leaveChannel,
  inChannel,
  getInfoInChannel,
  extendChannelLive,
}
