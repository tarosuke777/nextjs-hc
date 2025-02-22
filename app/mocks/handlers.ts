import { http, HttpResponse,ws } from 'msw'
 
// const chat = ws.link("ws://localhost:8080");

export const handlers = [
  http.get('http://localhost:8080/messages?channelId=1', () => {
    return HttpResponse.json([
      {
        channelId: '1',
        createdAt: '2025-02-22T09:37:10.502574600',
        content: 'test1',
        userId: '1'
      },
      {
        channelId: '1',
        createdAt: '2025-02-22T09:37:10.502574600',
        content: 'test2',
        userId: '1'
      },
   ])
  }),
  ws.link("ws://localhost:8080/hc-websocket?1").addEventListener("connection", ({client}) => {
    client.addEventListener("message", (event) => {
      let data = JSON.parse(event.data as string);
      const now = new Date();
      const isoString = now.toISOString();
      const formattedDate = isoString.replace("Z", now.getMilliseconds().toString().padEnd(9, '0'));
      data.createdAt = formattedDate;
      client.send(JSON.stringify(data));
    });
  })
]

