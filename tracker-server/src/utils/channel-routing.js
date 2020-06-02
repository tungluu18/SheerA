import * as usersDB from 'db/users';
import io from 'socket';

const initRoute = async (io, socket) => {
  const user = await usersDB.getInfoInChannel(socket.id);

  return {
    channelId: user.channel,
    role: user.role,
    parent: null,
    children: [],
  }
}

const updateRoute = (io, socket, channelId) => {

}


export {
  initRoute,
  updateRoute,
}
