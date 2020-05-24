import redis from 'db';
import io from 'socket';

import { CHANNEL_USERS } from 'utils/redis-keys';

const ERROR_USER_ALREADY_JOINED_ANOTHER_CHANNEL = "user-already-joined-another-channel";

const userJoinChannel = async (userId, channelId, role = 'viewer') => {
  const _channelId = await userInChannel(userId, { joinningChannelId: channelId });
  if (_channelId) {
    throw Error(ERROR_USER_ALREADY_JOINED_ANOTHER_CHANNEL);
  }

  const result = await redis.hset(
    `${CHANNEL_USERS}:${channelId}`, userId,
    JSON.stringify({ role }),
  );
  return result;
}

const userLeaveChannel = async (userId, channelId) => {
  const result = await redis.hdel(`${CHANNEL_USERS}:${channelId}`, userId);
  return result;
}

const userInChannel = async (userId, options = {}) => {
  const { joinningChannelId } = options;
  try {
    let channelIds = await new Promise((res, rej) =>
      io.of("/channels").adapter.clientRooms(userId, (err, rooms) => {
        if (err) { rej(err); }
        res(rooms);
      })
    );
    if (joinningChannelId) {
      channelIds = channelIds.filter((e) => e !== joinningChannelId);
    }
    const channelId = channelIds.find((e) => e !== userId);
    console.log("Joined channel:", channelId);
    return channelId;
  } catch (error) {
    console.error(error);
  };
}

export {
  userJoinChannel,
  userLeaveChannel,
  userInChannel,
}
