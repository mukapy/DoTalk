// Common types used across the application

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  birth_date: string | null;
  bio: string | null;
  profile_img: string | null;
  banner: string | null;
  rating: number;
  has_password: boolean;
  type: 'admin' | 'moderator' | 'user';
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  data: User;
}

export interface CheckEmailResponse {
  data: {
    is_exists: boolean;
  };
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Topic {
  id: number;
  name: string;
  slug: string;
  created_by: number | null;
}

export interface Room {
  uuid: string;
  name: string;
  creator: number;
  description: string | null;
  image: string | null;
  banner: string | null;
  status: 'upcoming' | 'active' | 'inactive';
  capacity: number;
  category: Category;
  topic: Topic[];
  type: 'VIDEO' | 'VOICE' | 'CHAT';
  visibility: boolean;
  created_at: string;
}

export interface RoomFormData {
  name: string;
  description: string;
  category: number | '';
  topic: number[];
  type: 'VIDEO' | 'VOICE' | 'CHAT';
  capacity: number;
  visibility: boolean;
  status: 'upcoming' | 'active' | 'inactive';
  image: File | null;
  banner: File | null;
}

export interface Message {
  id: number;
  content: string;
  room: string;
  sender: number;
  created_at: string;
}

// Paginated response from DRF
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface TopicRequest {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_by: User | null;
  reviewed_by: User | null;
  reviewed_at: string | null;
  created_at: string;
}

// --- Video Chat / WebRTC types ---

export interface Peer {
  userId: number;
  username: string;
  channelName: string;
  connection: RTCPeerConnection;
  stream: MediaStream | null;
  screenStream: MediaStream | null;
}

export interface ChatMessage {
  userId: number;
  username: string;
  message: string;
  timestamp: number;
}

export type SignalingMessage =
  | { type: 'join' }
  | { type: 'offer'; sdp: RTCSessionDescriptionInit; target_channel: string }
  | { type: 'answer'; sdp: RTCSessionDescriptionInit; target_channel: string }
  | { type: 'ice-candidate'; candidate: RTCIceCandidateInit; target_channel: string }
  | { type: 'screen-share-started' }
  | { type: 'screen-share-stopped' }
  | { type: 'chat-message'; message: string };
