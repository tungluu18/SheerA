import uniqid from 'uniqid';
import {
  JOIN_CHANNEL, JOIN_CHANNEL_RESP,
  LEAVE_CHANNEL, LEAVE_CHANNEL_RESP,
  CREATE_CHANNEL, CREATE_CHANNEL_RESP,
} from 'socket/messages';
import { userJoinChannel, userLeaveChannel, userInChannel } from 'db/users';
import { getAllUsersInChannel } from 'db/channels';

const ERROR_CHANNEL_DOES_NOT_EXIST = "channel-does-not-exist";

const channelHooks = (io, socket) => {
  socket.on(CREATE_CHANNEL, async (data) => {
    const channelId = uniqid();
    console.log(`${socket.id} is creating channel: ${channelId}`);

    try {
      await userJoinChannel(socket.id, channelId, 'seeder');
      await socket.join(channelId);
      socket.emit(CREATE_CHANNEL_RESP, { status: 0, data: { channelId } });
    } catch (error) {
      console.error(error);
      socket.emit(CREATE_CHANNEL_RESP, { status: 1, error: error.message });
    }
  });

  socket.on(LEAVE_CHANNEL, async () => {
    const channelId = await userInChannel(socket.id);
    console.log(`${socket.id} is leaving channel: ${channelId}`);
    if (!channelId) return;

    try {
      await socket.leave(channelId);
      await userLeaveChannel(socket.id, channelId);
      socket.emit(LEAVE_CHANNEL_RESP, { status: 0, data: { channelId } });
    } catch (error) {
      console.error(error);
      socket.emit(LEAVE_CHANNEL_RESP, { status: 1, error: error.message });
    }
  });

  socket.on(JOIN_CHANNEL, async ({ channelId }) => {
    console.log(`${socket.id} is joining channel: ${channelId}`)
    try {
      const channel = io.nsps['/channels'].adapter.rooms[channelId];
      if (!channel) {
        socket.emit(JOIN_CHANNEL_RESP, { status: 1, error: ERROR_CHANNEL_DOES_NOT_EXIST });
        return;
      }

      await userJoinChannel(socket.id, channelId);
      await socket.join(channelId);
      const users = await getAllUsersInChannel(channelId);

      socket.emit(JOIN_CHANNEL_RESP, { status: 0, data: { users } });
    } catch (error) {
      console.log(error);
      socket.emit(JOIN_CHANNEL_RESP, { status: 1, error });
    }
  });
}

export default channelHooks;
