"use client";

import { useRef, RefObject } from "react";

interface SendMessageProps {
  socketRef: RefObject<WebSocket | null>;
  channelIdRef: RefObject<String | null>;
}

export default function SendMessage({
  socketRef,
  channelIdRef,
}: SendMessageProps) {
  const contentRef = useRef<HTMLInputElement | null>(null);

  const sendName = () => {
    if (!contentRef.current) return;

    const msg = {
      content: contentRef.current.value,
      channelId: channelIdRef.current,
    };

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(msg));
      contentRef.current.value = "";
    } else {
      console.error("WebSocket is not open. Cannot send message.");
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4 my-5 ml-3">
      <div>
        <input
          type="text"
          ref={contentRef}
          className="px-5 py-2.5 rounded-lg bg-gray-700 text-sm w-full"
        />
      </div>
      <div>
        <button
          onClick={sendName}
          className="px-5 py-2.5 rounded-lg bg-gray-700 text-sm"
        >
          Send
        </button>
      </div>
    </div>
  );
}
