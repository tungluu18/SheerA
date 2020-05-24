import redis from 'db';
import { CHANNEL_USERS } from 'utils/redis-keys';

const getAllUsersInChannel = async (channelId) => {
  try {
    let users = await redis.hgetall(`${CHANNEL_USERS}:${channelId}`);
    return users;
  } catch (error) {
    console.log(error);
  }
}

export {
  getAllUsersInChannel,
}
