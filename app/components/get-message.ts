import Message from "./message";

export default async function GetMessage(
  channelId: string
): Promise<Message[]> {
  const res = await fetch(
    `http://${process.env.API_ORIGIN}/messages?channelId=${channelId}`
  );
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  return res.json();
}
