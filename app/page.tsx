"use client";

import { useRef, useEffect, useState } from "react";
import SendMessage from "./components/send-message";
import GetMessage from "./components/get-message";
import Message from "./components/message";
import Channel from "./components/channel";
import GetChannel from "./components/get-channel";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export default function Home() {
  const socketRef = useRef<WebSocket | null>(null);
  const channelIdRef = useRef<string | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    let channelId = urlParams.get("channelId");
    channelId = channelId ? channelId : "1";
    channelIdRef.current = channelId;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const data = await GetMessage(channelId);
        setMessages(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    const fetchChannels = async () => {
      try {
        const data = await GetChannel();
        setChannels(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      }
    };

    fetchChannels();

    const websocket = new WebSocket(
      `ws://localhost:8080/hc-websocket?${channelId}`
    );
    websocket.addEventListener("error", (event) => {
      console.log("WebSocket error: ", event);
    });

    socketRef.current = websocket;

    const onMessage = (message: MessageEvent) => {
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
  }, [pathname, searchParams]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="flex">
      <aside className="w-40">
        Channel
        <ul>
          {channels.map((channel, index) => (
            <li key={index}>
              <Link href={`/?channelId=${channel.channelId}`}>
                {channel.channelName}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
      <main className="w-full">
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
      </main>
    </div>
  );
}
