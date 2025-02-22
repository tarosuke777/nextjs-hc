"use client";

import { useRef, useEffect, useState } from "react";

export default function Home() {
  type messageFormat = {
    channelId: string;
    createdAt: string;
    content: string;
    userId: string;
  };

  const socketRef = useRef<WebSocket | null>(null);
  const contentRef = useRef<HTMLInputElement | null>(null);
  const channelIdRef = useRef<String | null>(null);

  const [messages, setMessages] = useState<messageFormat[]>([]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    let channelId = urlParams.get("channelId");

    if (channelId === null) {
      channelId = "1";
    }

    channelIdRef.current = channelId;

    if (
      process.env.NODE_ENV !== "development" ||
      typeof window === "undefined"
    ) {
      return;
    }

    import("./mocks/browser").then(({ worker }) => {
      worker.start().then(() => {
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
      });
    });
  }, []);

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
    </div>
  );
}
