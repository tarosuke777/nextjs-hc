import { http, HttpResponse, ws } from "msw";

// const chat = ws.link("ws://localhost:8080");

export const handlers = [
  http.get("http://localhost:8080/messages", ({ request }) => {
    const url = new URL(request.url);
    const channelId = url.searchParams.get("channelId");

    if (channelId === "1") {
      return HttpResponse.json([
        {
          channelId: "1",
          createdAt: "2025-02-22T09:37:10.502574600",
          content: "1test1",
          userId: "1",
        },
        {
          channelId: "1",
          createdAt: "2025-02-22T09:37:10.502574600",
          content: "1test2",
          userId: "1",
        },
      ]);
    }

    if (channelId === "2") {
      return HttpResponse.json([
        {
          channelId: "2",
          createdAt: "2026-02-22T09:37:10.502574600",
          content: "2test1",
          userId: "1",
        },
        {
          channelId: "2",
          createdAt: "2026-02-22T09:37:10.502574600",
          content: "2test2",
          userId: "1",
        },
      ]);
    }
  }),
  ws
    .link("ws://localhost:8080/hc-websocket?1")
    .addEventListener("connection", ({ client }) => {
      client.addEventListener("message", (event) => {
        const data = JSON.parse(event.data as string);
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
