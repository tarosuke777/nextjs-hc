"use client";

import { useRef, RefObject, KeyboardEvent } from "react";

interface SendMessageProps {
  socketRef: RefObject<WebSocket | null>;
  channelIdRef: RefObject<string | null>;
}

export default function SendMessage({
  socketRef,
  channelIdRef,
}: SendMessageProps) {
  const contentRef = useRef<HTMLInputElement | null>(null);
  const selectRef = useRef<HTMLSelectElement | null>(null);

  const sendName = () => {
    if (!contentRef.current) return;

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
        className="px-5 py-2.5 rounded-lg bg-gray-700 text-sm w-32"
      >
        <option value="">選択</option>
        <option value="AI">AI</option>
      </select>
      <input
        type="text"
        ref={contentRef}
        onKeyDown={handleKeyDown}
        className="px-5 py-2.5 rounded-lg bg-gray-700 text-sm flex-1"
      />
      <button
        onClick={sendName}
        className="px-5 py-2.5 rounded-lg bg-gray-700 text-sm"
      >
        Send
      </button>
    </div>
  );
}
