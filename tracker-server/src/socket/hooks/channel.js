import uniqid from 'uniqid';
import {
  JOIN_CHANNEL, JOIN_CHANNEL_RESP,
  LEAVE_CHANNEL, LEAVE_CHANNEL_RESP,
  CREATE_CHANNEL, CREATE_CHANNEL_RESP,
  CHANNEL_ROUTE,
} from 'socket/messages';
import * as usersDB from 'db/users';
import * as channelsDB from 'db/channels'
import { addNode } from 'utils/channel-routing';

const ERROR_CHANNEL_DOES_NOT_EXIST = "channel-does-not-exist";

const channelHooks = (io, socket, { disconnectHandlers }) => {
  const setupSeederHook = () => {
    socket.conn.on('packet', (packet) => {
      if (packet.type === 'ping') {
        usersDB.extendChannelLive(socket.id);
      }
    });
  }

  socket.on(CREATE_CHANNEL, async () => {
    const channelId = uniqid();
    console.log(`${socket.id} is creating channel: ${channelId}`);

    try {
      await usersDB.joinChannel(socket.id, channelId, 'seeder');
      socket.emit(CREATE_CHANNEL_RESP, { status: 0, data: { channelId, role: 'seeder' } });
      await addNode(socket, channelId);
      setupSeederHook();
    } catch (error) {
      console.error(error);
      socket.emit(CREATE_CHANNEL_RESP, { status: 1, error: error.message });
    }
  });

  socket.on(JOIN_CHANNEL, async ({ channelId }) => {
    console.log(`${socket.id} is joining channel: ${channelId}`);

    try {
      if (!channelsDB.isExisted(channelId)) {
        socket.emit(JOIN_CHANNEL_RESP, { status: 1, error: ERROR_CHANNEL_DOES_NOT_EXIST });
        return;
      }

      await usersDB.joinChannel(socket.id, channelId);
      socket.emit(JOIN_CHANNEL_RESP, { status: 0, data: { channelId, role: 'viewer' } });
      await addNode(socket, channelId);
    } catch (error) {
      console.log(error);
      socket.emit(JOIN_CHANNEL_RESP, { status: 1, error });
    }
  });

  const handleLeaveChannel = async () => {
    try {
      const channelId = await usersDB.inChannel(socket.id);
      console.log(`${socket.id} is leaving channel: ${channelId}`);
      if (!channelId) { return; }

      await usersDB.leaveChannel(socket.id, channelId);
        socket.emit(LEAVE_CHANNEL_RESP, { status: 0, data: { channelId } });
    } catch (error) {
      console.error(error);
      socket.emit(LEAVE_CHANNEL_RESP, { status: 1, error: error.message });
    }
  }

  socket.on(LEAVE_CHANNEL, handleLeaveChannel);

  disconnectHandlers.push(handleLeaveChannel);
  disconnectHandlers.push(() => { console.log('leaving....') })
}

export default channelHooks;
