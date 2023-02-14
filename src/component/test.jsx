import { useState, useEffect, useRef } from "react";
import * as SockJS from "sockjs-client";
import * as StompJs from "@stomp/stompjs";
// import { Client } from "@stomp/stompjs";
import axios from "axios";
import "./test.css";

const Test = () => {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [currentRoomId, setCurrentRoomId] = useState(0);
  const [createRoomId, setCreateRoomId] = useState("");
  const [changeRoomId, setChangeRoomId] = useState("");

  const initialChatSetting = async () => {
    await axios
      .get(`/chats/message/${currentRoomId}`)
      .then(({ data: { chatResponses } }) => setMessages(chatResponses))
  }

  const client = useRef({});
  const URL =
    "http://ec2-15-165-186-53.ap-northeast-2.compute.amazonaws.com:8081/stomp/content";

  useEffect(() => {
    initialChatSetting();
    connect();
    return () => disconnect();
  }, [currentRoomId]);

  const connect = () => {
    client.current = new StompJs.Client({
      webSocketFactory: () => new SockJS(URL),
      connectHeaders: {
        token: "token",
      },
      debug: () => {},
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        subscribe();
      },
      onStompError: (frame) => {
        console.error(frame);
      },
    });

    client.current.activate();
  };

  const disconnect = () => {
    client.current.deactivate();
  };

  const subscribe = () => {
    client.current.subscribe(`/sub/room/${currentRoomId}`, (res) => {
      setMessages(prev => [...prev, JSON.parse(res.body)]);
    });
  };

  const publish = (message) => {
    if (!client.current.connected) {
      return;
    }

    client.current.publish({
      destination: `/pub/chats/message/${currentRoomId}`,
      body: JSON.stringify({
        senderId: 1,
        receiverId: 2,
        content: text,
      }),
    });
    setText("");
  };

  const inputHandler = (e) => {
    setText(e.target.value);
  };

  return (
    <div className="container">
      <div className="chat_container">
        <div className="chat">
          {messages.map((el, idx) => {
            return <div key={idx}>{el.content ? el.content : el.message}</div>;
          })}
        </div>
        <div className="input_container">
          <input onChange={inputHandler} value={text} />
          <button onClick={publish}>send</button>
        </div>
      </div>
      <div className="setRoom_container">
        <input
          onChange={(e) => setChangeRoomId(e.target.value)}
          value={changeRoomId}
        />
        <button onClick={() => setCurrentRoomId(Number(changeRoomId))}>
          setRoom
        </button>
        <>currentRoomId: {currentRoomId}</>
      </div>
      <div className="createRoom_container">
        <button
          onClick={() => {
            axios
              .post("/room", {
                receiverId: 1,
                senderId: 2,
              })
              .then(({ data }) => setCreateRoomId(data.roomId));
          }}
        >
          createRoom
        </button>
        <>createRoomId: {createRoomId}</>
      </div>

      <button onClick={connect}>웹소켓 연결하기</button>
      <button onClick={disconnect}>연결 끊기</button>
    </div>
  );
};

export default Test;
