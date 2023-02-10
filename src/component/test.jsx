import React, { useState } from "react";
import SockJS from "sockjs-client";
import StompJS from "stompjs";
import axios from "axios";

const Test = () => {
  const [text, setText] = useState;

  const inputHandler = (e) => {
    setText(e.target.value);
  };

  return (
    <div>
      <div className="chat_container"></div>
      <input onChange={inputHandler} value={text} />
      <button>send</button>
    </div>
  );
};

export default Test;
