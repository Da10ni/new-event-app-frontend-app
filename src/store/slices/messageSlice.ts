import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Conversation, Message } from '../../types/message.types';

interface MessageState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Message[];
  unreadCount: number;
  loading: boolean;
  messagesLoading: boolean;
}

const initialState: MessageState = {
  conversations: [],
  activeConversationId: null,
  messages: [],
  unreadCount: 0,
  loading: false,
  messagesLoading: false,
};

const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    setConversations(state, action: PayloadAction<Conversation[]>) {
      state.conversations = action.payload;
    },
    setActiveConversationId(state, action: PayloadAction<string | null>) {
      state.activeConversationId = action.payload;
    },
    setMessages(state, action: PayloadAction<Message[]>) {
      state.messages = action.payload;
    },
    addMessage(state, action: PayloadAction<Message>) {
      const exists = state.messages.some((m) => m._id === action.payload._id);
      if (!exists) {
        state.messages.push(action.payload);
      }
    },
    updateConversationLastMessage(
      state,
      action: PayloadAction<{ conversationId: string; message: Message }>
    ) {
      const { conversationId, message } = action.payload;
      const convo = state.conversations.find((c) => c._id === conversationId);
      if (convo) {
        const senderId = typeof message.sender === 'string' ? message.sender : message.sender._id;
        convo.lastMessage = {
          text: message.text,
          sender: senderId,
          createdAt: message.createdAt,
        };
        convo.updatedAt = message.createdAt;
      }
    },
    setUnreadCount(state, action: PayloadAction<number>) {
      state.unreadCount = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setMessagesLoading(state, action: PayloadAction<boolean>) {
      state.messagesLoading = action.payload;
    },
    clearConversationUnread(
      state,
      action: PayloadAction<{ conversationId: string; userId: string }>
    ) {
      const convo = state.conversations.find((c) => c._id === action.payload.conversationId);
      if (convo && convo.unreadCounts) {
        convo.unreadCounts[action.payload.userId] = 0;
      }
    },
    updateMessage(state, action: PayloadAction<Message>) {
      const idx = state.messages.findIndex((m) => m._id === action.payload._id);
      if (idx !== -1) {
        state.messages[idx] = action.payload;
      }
    },
  },
});

export const {
  setConversations,
  setActiveConversationId,
  setMessages,
  addMessage,
  updateConversationLastMessage,
  setUnreadCount,
  setLoading,
  setMessagesLoading,
  clearConversationUnread,
  updateMessage,
} = messageSlice.actions;

export default messageSlice.reducer;
