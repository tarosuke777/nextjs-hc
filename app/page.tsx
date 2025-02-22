"use client";

import { useRef, useEffect, useState } from "react";
import SendMessage from "./components/send-message";
import GetMessage from "./components/get-message";
import Message from "./components/message";

export default function Home() {
  const socketRef = useRef<WebSocket | null>(null);
  const channelIdRef = useRef<String | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    let channelId = urlParams.get("channelId");
    channelId = channelId ? channelId : "1";
    channelIdRef.current = channelId;

    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await GetMessage(channelId);
        setMessages(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

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

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

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
