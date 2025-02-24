import { channel } from "diagnostics_channel";
import { http, HttpResponse, ws } from "msw";

// const chat = ws.link("ws://localhost:8080");

export const handlers = [
  http.get("http://localhost:8080/messages", () => {
    return HttpResponse.json([
      {
        channelId: "1",
        createdAt: "2025-02-22T09:37:10.502574600",
        content: "test1",
        userId: "1",
      },
      {
        channelId: "1",
        createdAt: "2025-02-22T09:37:10.502574600",
        content: "test2",
        userId: "1",
      },
    ]);
  }),
  ws
    .link("ws://localhost:8080/hc-websocket?1")
    .addEventListener("connection", ({ client }) => {
      client.addEventListener("message", (event) => {
        let data = JSON.parse(event.data as string);
        const now = new Date();
        const isoString = now.toISOString();
        const formattedDate = isoString.replace(
          "Z",
          now.getMilliseconds().toString().padEnd(6, "0")
        );
        data.createdAt = formattedDate;
        client.send(JSON.stringify(data));
      });
    }),
  http.get("http://localhost:8080/channels", () => {
    return HttpResponse.json([
      {
        channelId: "1",
        channelName: "zatsu",
      },
      {
        channelId: "2",
        channelName: "memo",
      },
    ]);
  }),
];
