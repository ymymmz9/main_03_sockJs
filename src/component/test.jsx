import { useState, useEffect } from "react";
import SockJS from "sockjs-client";
// import StompJS from "stompjs";
import * as StompJs from "@stomp/stompjs";
import axios from "axios";
import "./test.css";

const Test = () => {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [currentRoomId, setCurrentRoomId] = useState(0);
  const [createRoomId, setCreateRoomId] = useState("");
  const [changeRoomId, setChangeRoomId] = useState("");
  // const [profileId, setProfileId] = useState(1);
  const [ws, setWs] = useState(null);

  const initialChatSetting = async () => {
    await axios
      .get(`/chats/message/${currentRoomId}`)
      .then(({ data: { chatResponses } }) => setMessages(chatResponses));
  };

  const setWebSocket = async () => {
    try {
      await ws.connect("", () => {
        ws.subscribe(`/sub/room/${currentRoomId}`, async (msg) => {
          console.log(msg);
          // setMessages([...messages, JSON.parse(msg.body)]);
          //구독한 location에서 메시지를 수신했을 때 처리해주고자 하는 동작
        });
      });
    } catch (error) {
      console.log(error);
    }
  };

  const sendMsg = async () => {
    try {
      ws.send(`/pub/chats/message/${currentRoomId}`, "", {
        senderId: 1,
        receiverId: 2,
        content: text,
      });
    } catch (error) {
      console.log(error);
    }
  };

  const inputHandler = (e) => {
    setText(e.target.value);
  };

  const disconnectWebSocket = () => {
    ws.disconnect(() => {
      ws.unsubscribe();
    });
  };

  useEffect(() => {
    if (currentRoomId === 0) return;

    if (ws !== null) {
      initialChatSetting();
      setWebSocket();
    } else {
      const sockjs = new SockJS(
        `http://ec2-15-165-186-53.ap-northeast-2.compute.amazonaws.com:8081/stomp/content`
      );
      const client = StompJs.Client(sockjs);
      setWs(client);
    }

    return () => {
      ws.disconnect(() => {
        ws.unsubscribe();
      });
    };
  }, [currentRoomId]);

  return (
    <div className="container">
      <div className="chat_container">
        <div className="chat">
          {messages.map((el) => {
            return <div>{el.content}</div>;
          })}
        </div>
        <div className="input_container">
          <input onChange={inputHandler} value={text} />
          <button onClick={sendMsg}>send</button>
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
      {/* <button onClick={setWebSocket}>웹소켓 연결</button> */}
      <button onClick={disconnectWebSocket}>연결 끊기</button>
    </div>
  );
};

export default Test;
