import redis from 'db';
import { CHANNEL_SET } from 'utils/redis-keys';

const getAllUsersInChannel = async (channelId) => {
  try {
    let users = await redis.smembers(`${CHANNEL_SET}:${channelId}`);
    return users;
  } catch (error) {
    console.log(error);
  }
}

const isUserInChannel = async (channelId, userId) => {
  try {
    const result = await redis.sismember(`${CHANNEL_SET}:${channelId}`);
    return result;
  } catch (error) {
    console.log(error);
  }
}

const isExisted = async (channelId) => {
  try {
    const numberOfUsers = await redis.scard(`${CHANNEL_SET}:${channelId}`);
    return !!numberOfUsers;
  } catch (error) {
    console.log(error);
  }
}
export {
  getAllUsersInChannel,
  isUserInChannel,
  isExisted,
}
