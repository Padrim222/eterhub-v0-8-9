import { useState } from "react";
import { ChannelsList } from "./ChannelsList";
import { ChannelDetails } from "./ChannelDetails";

interface Channel {
  id: string;
  name: string;
  username: string;
  platform: "instagram" | "youtube" | "tiktok";
  followers: number;
  totalPosts: number;
  avgEngagement: number;
}

export const ChannelView = () => {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);

  if (selectedChannel) {
    return (
      <ChannelDetails
        channel={selectedChannel}
        onBack={() => setSelectedChannel(null)}
      />
    );
  }

  return (
    <ChannelsList
      onChannelSelect={setSelectedChannel}
      selectedChannelId={selectedChannel?.id}
    />
  );
};
