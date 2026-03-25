export interface MessageParticipant {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar?: { url: string; publicId?: string };
}

export interface ConversationListing {
  _id: string;
  title: string;
  slug: string;
  images?: Array<{ url: string }>;
}

export interface Conversation {
  _id: string;
  participants: MessageParticipant[];
  listing?: ConversationListing;
  lastMessage: {
    text: string;
    sender: string;
    createdAt: string;
  };
  unreadCounts: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  conversation: string;
  sender: MessageParticipant | string;
  text: string;
  isRead: boolean;
  readAt?: string;
  replyTo?: {
    _id: string;
    text: string;
    sender: MessageParticipant | string;
    isDeleted?: boolean;
  } | null;
  isEdited?: boolean;
  isDeleted?: boolean;
  createdAt: string;
}
