import uniqid from 'uniqid';
import {
  JOIN_CHANNEL, JOIN_CHANNEL_RESP,
  LEAVE_CHANNEL, LEAVE_CHANNEL_RESP,
  CREATE_CHANNEL, CREATE_CHANNEL_RESP,
  SEND_MESSAGE, RECEIVE_MESSAGE,
  FIND_CHANNEL, FIND_CHANNEL_RESP,
} from 'socket/messages';
import io from 'socket';
import * as usersDB from 'db/users';
import * as channelsDB from 'db/channels'
import { addNode, removeNode } from 'utils/channel-routing';

const ERROR_CHANNEL_DOES_NOT_EXIST = "channel-does-not-exist";

const channelHooks = (io, socket, { disconnectHandlers }) => {
  const setupSeederHook = (channelId) => {
    socket.conn.on('packet', (packet) => {
      if (packet.type === 'ping') {
        usersDB.extendChannelLive(socket.id);
      }
    });

    disconnectHandlers.push(() => channelsDB.removeChannel(channelId));
  }

  socket.on(CREATE_CHANNEL, async ({ displayName, channelName }) => {
    const channelId = uniqid();
    console.log(`${socket.id} is creating channel: ${channelId}`);

    try {
      await channelsDB.createChannel({ channelId, channelName });
      await usersDB.joinChannel(socket.id, channelId, 'seeder', { displayName });
      await socket.join(channelId);
      socket.emit(CREATE_CHANNEL_RESP, { status: 0, data: { channelId, role: 'seeder', displayName } });
      await addNode(socket, channelId);
      setupSeederHook(channelId);
    } catch (error) {
      console.error(error);
      socket.emit(CREATE_CHANNEL_RESP, { status: 2, error: error.message });
    }
  });

  socket.on(JOIN_CHANNEL, async ({ channelId, displayName }) => {
    console.log(`${socket.id} is joining channel: ${channelId}`);

    try {
      if (!await channelsDB.isExisted(channelId)) {
        socket.emit(JOIN_CHANNEL_RESP, { status: 1, error: ERROR_CHANNEL_DOES_NOT_EXIST });
        return;
      }

      await usersDB.joinChannel(socket.id, channelId, 'viewer', { displayName });
      await socket.join(channelId);
      socket.emit(JOIN_CHANNEL_RESP, { status: 0, data: { channelId, role: 'viewer', displayName } });
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
      await removeNode(socket, channelId);
    } catch (error) {
      console.error(error);
      socket.emit(LEAVE_CHANNEL_RESP, { status: 2, error: error.message });
    }
  }

  socket.on(SEND_MESSAGE, async ({ content, time }) => {
    const userInfo = await usersDB.getInfoInChannel(socket.id);
    const message = { ...userInfo, content, id: socket.id, time };
    io.of('/channels').to(userInfo.channel).emit(RECEIVE_MESSAGE, message);
  });

  socket.on(FIND_CHANNEL, async ({ channelName }) => {
    try {
      const channelId = await channelsDB.findChannelIdByName(channelName);
      if (!channelId) {
        socket.emit(FIND_CHANNEL_RESP, { status: 1, error: ERROR_CHANNEL_DOES_NOT_EXIST });
        return;
      }
      socket.emit(FIND_CHANNEL_RESP, { status: 0, data: { channelId } });
    } catch (error) {
      console.log(error);
      socket.emit(FIND_CHANNEL_RESP, { status: 2, error: error.message });
    }
  });

  socket.on(LEAVE_CHANNEL, handleLeaveChannel);

  disconnectHandlers.push(handleLeaveChannel);
  disconnectHandlers.push(() => { console.log('leaving....') })
}

export default channelHooks;
