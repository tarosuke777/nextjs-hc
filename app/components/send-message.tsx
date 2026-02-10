"use client";

import { useRef, RefObject, KeyboardEvent, useState } from "react";

interface SendMessageProps {
  socketRef: RefObject<WebSocket | null>;
  channelIdRef: RefObject<string | null>;
  connectWebSocket: () => WebSocket;
}

export default function SendMessage({
  socketRef,
  channelIdRef,
  connectWebSocket,
}: SendMessageProps) {
  const contentRef = useRef<HTMLInputElement | null>(null);
  const selectRef = useRef<HTMLSelectElement | null>(null);
  const [isConnecting, setIsConnecting] = useState(false); // 接続待機中のフラグ

  // WebSocketがOPENになるのを待つPromise
  const waitForOpen = (socket: WebSocket): Promise<void> => {
    return new Promise((resolve, reject) => {
      const maxAttempts = 10; // 最大5秒待機
      let attempts = 0;

      const interval = setInterval(() => {
        if (socket.readyState === WebSocket.OPEN) {
          clearInterval(interval);
          resolve();
        }
        if (attempts++ > maxAttempts) {
          clearInterval(interval);
          reject(new Error("WebSocket connection timeout"));
        }
      }, 500);
    });
  };

  const sendName = async () => {
    if (!contentRef.current || isConnecting) return;
    if (!contentRef.current.value.trim()) return;

    let socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.log("WebSocket is closed. Reconnecting...");
      setIsConnecting(true);

      try {
        socket = connectWebSocket(); // 再接続実行
        await waitForOpen(socket);    // OPENになるまで待機
        console.log("Reconnected successfully.");
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "原因不明のエラー";
        alert(`接続できませんでした (${errorMessage})。しばらく時間を置いてからお試しください。`);
        setIsConnecting(false);
        return;
      }
      setIsConnecting(false);
    }

    const msg = {
      content: contentRef.current.value,
      channelId: channelIdRef.current,
      to: selectRef.current?.value || "",
    };

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(msg));
      contentRef.current.value = "";
    } else {
      console.error("WebSocket is not open. Cannot send message.");
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      sendName();
    }
  };

  return (
    <div className="flex items-center gap-4 my-5 ml-3">
      <select
        ref={selectRef}
        className="px-5 py-2.5 rounded-lg bg-gray-700 text-sm w-48"
      >
        <option value="">選択</option>
        <option value="ai/qwen3:latest">ai/qwen3:latest</option>
        <option value="ai/qwen3:0.6B-F16">ai/qwen3:0.6B-F16</option>
        <option value="ai/qwen3:0.6B-Q4_K_M">ai/qwen3:0.6B-Q4_K_M</option>
      </select>
      <input
        type="text"
        ref={contentRef}
        onKeyDown={handleKeyDown}
        disabled={isConnecting}
        className="px-5 py-2.5 rounded-lg bg-gray-700 text-sm flex-1"
        placeholder={isConnecting ? "再接続中..." : ""}
      />
      <button
        onClick={sendName}
        className="px-5 py-2.5 rounded-lg bg-gray-700 text-sm"
      >
        {isConnecting ? "Connecting..." : "Send"}
      </button>
    </div>
  );
}
