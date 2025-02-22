"use client";

// https://github.com/mswjs/examples/pull/101/files

import { useRef, useEffect, useState } from "react";
import SendMessage from "./components/send-message";

export default function Home() {
  type messageFormat = {
    channelId: string;
    createdAt: string;
    content: string;
    userId: string;
  };

  const socketRef = useRef<WebSocket | null>(null);
  const channelIdRef = useRef<String | null>(null);

  const [messages, setMessages] = useState<messageFormat[]>([]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    let channelId = urlParams.get("channelId");

    if (channelId === null) {
      channelId = "1";
    }

    channelIdRef.current = channelId;

    fetch(`http://localhost:8080/messages?channelId=${channelId}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => setMessages(data))
      .catch((error) => {
        console.error("Error fetching messages:", error);
        alert("メッセージの取得に失敗しました。");
      });

    const websocket = new WebSocket("ws://localhost:8080/hc-websocket?1");
    websocket.addEventListener("error", (event) => {
      console.log("WebSocket error: ", event);
    });

    socketRef.current = websocket;

    const onMessage = (message: any) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        JSON.parse(message.data),
      ]);
    };

    websocket.addEventListener("message", onMessage);

    return () => {
      websocket.close();
      websocket.removeEventListener("message", onMessage);
    };
  }, []);

  return (
    <div>
      <div>
        <table className="text-left text-sm">
          <thead className="text-xs uppercase">
            <tr>
              <th className="px-6 py-3">Time</th>
              <th className="px-6 py-3">Message</th>
            </tr>
          </thead>
          <tbody>
            {messages.map((message, index) => (
              <tr key={index}>
                <td className="px-6 py-4">{message.createdAt}</td>
                <td className="px-6 py-4">{message.content}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <hr />
      <SendMessage channelIdRef={channelIdRef} socketRef={socketRef} />
    </div>
  );
}
