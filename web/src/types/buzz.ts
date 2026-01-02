export interface Interest {
  id: string;
  name: string;
  category: string;
  emoji: string;
}

export interface Buzz {
  id: string;
  userId: string;
  username: string;
  userAvatar: string | null;
  content: string;
  media: {
    type: 'image' | 'video' | null;
    url: string | null;
  };
  interests: Interest[];
  location?: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
    address?: string;
    name?: string;
  };
  buzzType?: 'event' | 'gossip' | 'thought' | 'poll';
  eventDate?: string;
  pollOptions?: Array<{ id: string; text: string }>;
  likes: number;
  comments: number;
  shares: number;
  createdAt: Date | string;
  isLiked: boolean;
}

export type BuzzType = 'event' | 'gossip' | 'thought' | 'poll';

export interface CreateBuzzPayload {
  content: string;
  buzzType: BuzzType;
  interests: Interest[];
  media?: {
    type: 'image' | 'video';
    url: string;
    mimeType?: string;
    fileName?: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
    address?: string;
    name?: string;
  };
  eventDate?: string;
  pollOptions?: Array<{ id: string; text: string }>;
}
