"use client";

import { useRef, useEffect, useState } from "react";
import SendMessage from "./components/send-message";
import GetMessage from "./components/get-message";
import Message from "./components/message";
import Channel from "./components/channel";
import GetChannel from "./components/get-channel";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/ja";
import React from "react"; 

export default function Home() {
  const socketRef = useRef<WebSocket | null>(null);
  const channelIdRef = useRef<string | null>(null);
  // メッセージリストのスクロール位置を管理するためのref
  const messagesEndRef = useRef<HTMLTableRowElement | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pathname = usePathname();
  const searchParams = useSearchParams();

  dayjs.extend(utc);
  dayjs.extend(timezone);
  dayjs.locale("ja");

  const groupMessagesByDate = (messages: Message[]) => {
    if (!messages || messages.length === 0) return {};
    
    return messages.reduce((groups, message) => {
      // 日付をYYYY-MM-DD形式で取得 (ローカルタイムゾーンを使用)
      // バックエンドから来た日時をUTCとして扱い、ローカルタイムゾーンに変換して日付を決定
      const dateKey = dayjs.utc(message.createdAt).local().format("YYYY-MM-DD");
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
      return groups;
    }, {} as Record<string, Message[]>);
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // 初期メッセージとチャンネルの読み込み、WebSocket接続の確立
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    let channelId = urlParams.get("channelId");
    // channelIdがなければデフォルトで"1"を設定
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

    // メッセージとチャンネルの取得
    fetchMessages();
    fetchChannels();

    const websocket = new WebSocket(`ws://${process.env.API_ORIGIN}/hc/ap/hc-websocket?${channelId}`);
    websocket.addEventListener("error", (event) => {
      console.log("WebSocket error: ", event);
    });

    socketRef.current = websocket;

    const onMessage = (message: MessageEvent) => {
      setMessages((prevMessages) => [...prevMessages, JSON.parse(message.data)]);
    };

    websocket.addEventListener("message", onMessage);

    // クリーンアップ関数: コンポーネントのアンマウント時にWebSocketを閉じる
    return () => {
      websocket.close();
      websocket.removeEventListener("message", onMessage);
    };
  }, [pathname, searchParams]); // pathnameまたはsearchParamsが変更されたときに再実行

  // メッセージが追加されるたびに、リストの最下部にスクロール
  useEffect(() => {
    if (messagesEndRef.current) {
      // スムーズなスクロールアニメーション
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]); // messagesステートが変更されるたびに実行

  const groupedMessages = groupMessagesByDate(messages);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="flex h-screen overflow-y-hidden">
      <aside className={`w-40 p-4 bg-gray-800 text-white flex-shrink-0 ${isSidebarOpen ? '' : 'hidden'}`}>
        <h2 className="text-lg font-bold mb-4">Channel</h2>
        <ul>
          {channels.map((channel) => (
            <li key={channel.channelId} className="mb-2">
              <Link href={`/?channelId=${channel.channelId}`} className="text-blue-300 hover:text-blue-100">
                {channel.channelName}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
      <main className="flex-1 flex flex-col bg-gray-900 text-white">
        <div className="p-4 bg-gray-800 flex-shrink-0 sticky top-0 md:hidden">
            <button 
                onClick={toggleSidebar} 
                className="text-white p-2 rounded-md bg-gray-700 hover:bg-gray-600"
            >
                {isSidebarOpen ? '閉じる' : 'チャンネルを開く'}
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <table className="text-left text-sm w-full table-auto">
            <tbody>
              {Object.entries(groupedMessages).map(([date, msgs]) => (
                <React.Fragment key={date}>
                  <tr className="bg-gray-800 border-b border-gray-700">
                    <td 
                      colSpan={3} 
                      className="px-6 py-2 text-center text-lg font-semibold sticky top-0 z-10 bg-gray-800/90 backdrop-blur-sm"
                    >
                      {dayjs(date).format("YYYY年MM月DD日 (ddd)")}
                    </td>
                  </tr>
                  {msgs.map((message, index) => (
                    // message.messageId が利用可能なら key に使用することが推奨されます
                    <tr key={index} className="border-b border-gray-700 hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">{dayjs.utc(message.createdAt).local().format("HH:mm:ss ")}</td>
                      <td className="px-6 py-4">{message.userId}</td>
                      <td className="px-6 py-4 w-full">{message.content}</td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
              <tr ref={messagesEndRef}>
                <td colSpan={3}></td>
              </tr>
            </tbody>
          </table>
        </div>
        <hr className="border-gray-700" />
        <div className="p-4 bg-gray-800 flex-shrink-0">
          <SendMessage channelIdRef={channelIdRef} socketRef={socketRef} />
        </div>
      </main>
    </div>
  );
}
