import redis from 'db';
import {
  CHANNEL_MEMBERS, CHANNEL_NAME,
  CHANNEL_MAP_NAME_ID
} from 'utils/redis-keys';

const CHANNEL_NAME_IN_USE_ERROR = "channel-name-is-in-use";

const getAllUsersInChannel = async (channelId) => {
  let users = await redis.smembers(CHANNEL_MEMBERS`${channelId}`);
  return users;
}

const isUserInChannel = async (channelId, userId) => {
  const result = await redis.sismember(CHANNEL_MEMBERS`${channelId}`);
  return result;
}

const isExisted = async (channelId) => {
  const numberOfUsers = await redis.scard(CHANNEL_MEMBERS`${channelId}`);
  return !!numberOfUsers;
}

const createChannel = async ({ channelId, channelName }) => {
  channelName = channelName ? channelName : `Channel-${channelId}`;
  const setNameAttempt = await redis.hsetnx(CHANNEL_MAP_NAME_ID, channelName, channelId);
  if (!setNameAttempt) { throw new Error(CHANNEL_NAME_IN_USE_ERROR); }
  return redis.set(CHANNEL_NAME`${channelId}`, channelName);
}

const removeChannel = async (channelId) => {
  const channelName = await redis.get(CHANNEL_NAME`${channelId}`);

  return Promise.all([
    redis.del(CHANNEL_MEMBERS`${channelId}`),
    redis.del(CHANNEL_NAME`${channelId}`),
    redis.hdel(CHANNEL_MAP_NAME_ID, channelName),
  ]);
}

export {
  getAllUsersInChannel,
  isUserInChannel,
  isExisted,
  createChannel,
  removeChannel,
}
