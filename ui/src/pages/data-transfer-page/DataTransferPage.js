import React from 'react';
import DataTransfer from 'containers/data-transfer/DataTransfer';

import { useRoomContext } from 'contexts/room-context';
// import {
//   withPeerConnectionContext,
//   usePeerConnectionContext
// } from 'contexts/peer-connection-context';

const DataTransferPage = () => {
  const { users } = useRoomContext();

  return (
    <>
      <div>Data Transfer Page</div>
      {
        users.map((userId, index) =>
          <DataTransfer key={index} userId={userId} />)
      }
    </>
  );
}

export default DataTransferPage;
