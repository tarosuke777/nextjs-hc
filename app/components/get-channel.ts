import Channel from "./channel";

export default async function GetChannel(): Promise<Channel[]> {
  const res = await fetch(`http://localhost:8080/channels`);
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  return res.json();
}
