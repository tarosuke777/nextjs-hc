import Message from "./message";

export default async function GetMessage(
  channelId: String
): Promise<Message[]> {
  const res = await fetch(
    `http://localhost:8080/messages?channelId=${channelId}`
  );
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  return res.json();
}
