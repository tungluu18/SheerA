import React, { useState, useEffect, useCallback, useRef } from 'react';

import {
  usePeerConnectionContext,
  withPeerConnectionContext,
} from 'contexts/peer-connection-context';

const DataTransfer = ({ userId }) => {
  const [messages, setMessages] = useState([]);
  const { peerConnection, connectPeer } = usePeerConnectionContext();
  const [sendChannel] = useState(peerConnection.createDataChannel("sendChannel"));
  const messagesRef = useRef([]);

  useEffect(
    () => {
      sendChannel.onopen = (data) => {
        console.log("SendChannel opened", data);
      }

      sendChannel.onclose = (data) => {
        console.log("SendChannel closed", data);
      }
    },
    [sendChannel]
  );

  const updateMessages = useCallback(
    ({ data }) => {
      const currentMessages = messagesRef.current;
      const newMessages = [...currentMessages, data];
      messagesRef.current = newMessages;
      setMessages(newMessages);
    },
    []
  );

  useEffect(
    () => {
      peerConnection.ondatachannel = (event) => {
        const receiveChannel = event.channel;
        receiveChannel.onmessage = (event) => {
          updateMessages(event)
        };
      }
    },
    [peerConnection, updateMessages]
  );

  const handleConnectPeer = () => connectPeer(userId);

  const handleSendData = useCallback(() => {
    if (sendChannel.readyState !== "open") { return; }
    const sending_message = "ahihi em day." + Date.now();
    console.log("Sending...", sending_message);
    sendChannel.send(sending_message);
  }, [sendChannel]);

  return (
    <>
      <button onClick={() => updateMessages({ data: "force update" })}>force update messages</button>
      <h3>Message exchange with user <strong>{userId}</strong></h3>
      <div>
        {(messages || []).map((msg, index) =>
          <p key={index}>{msg}</p>)
        }
      </div>
      <button onClick={handleConnectPeer}>connect</button>
      <button onClick={handleSendData}>send</button>
    </>
  );
}

export default withPeerConnectionContext(DataTransfer);
