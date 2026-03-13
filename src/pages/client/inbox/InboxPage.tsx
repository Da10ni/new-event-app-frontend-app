import React, { useState, useRef, useEffect } from 'react';
import { HiPaperAirplane, HiChevronLeft, HiOutlineChatBubbleLeftEllipsis } from 'react-icons/hi2';
import { useAppSelector } from '../../../store/hooks';
import Avatar from '../../../components/ui/Avatar';
import EmptyState from '../../../components/feedback/EmptyState';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    avatar?: string;
    isOnline: boolean;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

// Mock data for demonstration - will be replaced with real API
const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    participant: { id: 'v1', name: 'Grand Venue Hall', isOnline: true },
    lastMessage: 'Thank you for your inquiry! We would be happy to host your event.',
    lastMessageTime: '2026-02-20T10:30:00Z',
    unreadCount: 1,
    messages: [
      { id: 'm1', senderId: 'me', text: 'Hi! I am interested in booking your venue for a wedding on March 15th. Do you have availability?', timestamp: '2026-02-20T09:00:00Z', isRead: true },
      { id: 'm2', senderId: 'v1', text: 'Thank you for your inquiry! We would be happy to host your event.', timestamp: '2026-02-20T10:30:00Z', isRead: false },
    ],
  },
  {
    id: '2',
    participant: { id: 'v2', name: 'Elite Photography', isOnline: false },
    lastMessage: 'Our packages start from PKR 50,000 for full day coverage.',
    lastMessageTime: '2026-02-19T15:45:00Z',
    unreadCount: 0,
    messages: [
      { id: 'm3', senderId: 'me', text: 'What are your photography packages?', timestamp: '2026-02-19T14:00:00Z', isRead: true },
      { id: 'm4', senderId: 'v2', text: 'Our packages start from PKR 50,000 for full day coverage.', timestamp: '2026-02-19T15:45:00Z', isRead: true },
    ],
  },
  {
    id: '3',
    participant: { id: 'v3', name: 'Royal Catering Services', isOnline: true },
    lastMessage: 'We can customize the menu based on your preferences.',
    lastMessageTime: '2026-02-18T11:00:00Z',
    unreadCount: 0,
    messages: [
      { id: 'm5', senderId: 'me', text: 'Do you provide halal catering for 200+ guests?', timestamp: '2026-02-18T10:00:00Z', isRead: true },
      { id: 'm6', senderId: 'v3', text: 'Yes, absolutely! We specialize in halal catering for large events.', timestamp: '2026-02-18T10:30:00Z', isRead: true },
      { id: 'm7', senderId: 'me', text: 'Great! Can you share the menu options?', timestamp: '2026-02-18T10:45:00Z', isRead: true },
      { id: 'm8', senderId: 'v3', text: 'We can customize the menu based on your preferences.', timestamp: '2026-02-18T11:00:00Z', isRead: true },
    ],
  },
];

const InboxPage: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [conversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showMobileList, setShowMobileList] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversation) return;

    const message: Message = {
      id: `m_${Date.now()}`,
      senderId: 'me',
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    setActiveConversation({
      ...activeConversation,
      messages: [...activeConversation.messages, message],
      lastMessage: message.text,
      lastMessageTime: message.timestamp,
    });
    setNewMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation);
    setShowMobileList(false);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (conversations.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <EmptyState
          icon={<HiOutlineChatBubbleLeftEllipsis className="h-16 w-16 mx-auto" />}
          title="No conversations yet"
          description="When you message a vendor or receive a message, it will appear here."
        />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] bg-white flex overflow-hidden">
      {/* Conversation List */}
      <div
        className={`w-full md:w-96 border-r border-neutral-100 flex flex-col shrink-0 ${
          !showMobileList ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="p-4 border-b border-neutral-100">
          <h1 className="text-xl font-bold text-neutral-700">Messages</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((convo) => {
            const isActive = activeConversation?.id === convo.id;
            return (
              <button
                key={convo.id}
                onClick={() => handleSelectConversation(convo)}
                className={`w-full flex items-start gap-3 px-4 py-4 border-b border-neutral-50 transition-colors text-left ${
                  isActive ? 'bg-primary-50' : 'hover:bg-neutral-50'
                }`}
              >
                <Avatar
                  src={convo.participant.avatar}
                  name={convo.participant.name}
                  size="md"
                  showStatus
                  isOnline={convo.participant.isOnline}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-neutral-700 truncate">
                      {convo.participant.name}
                    </h3>
                    <span className="text-xs text-neutral-400 shrink-0">
                      {formatTime(convo.lastMessageTime)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p className="text-sm text-neutral-400 truncate">
                      {convo.lastMessage}
                    </p>
                    {convo.unreadCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center shrink-0">
                        {convo.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conversation Messages */}
      <div
        className={`flex-1 flex flex-col ${
          showMobileList ? 'hidden md:flex' : 'flex'
        }`}
      >
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100">
              <button
                onClick={() => setShowMobileList(true)}
                className="p-2 rounded-full hover:bg-neutral-100 md:hidden"
              >
                <HiChevronLeft className="h-5 w-5" />
              </button>
              <Avatar
                src={activeConversation.participant.avatar}
                name={activeConversation.participant.name}
                size="sm"
                showStatus
                isOnline={activeConversation.participant.isOnline}
              />
              <div>
                <h3 className="text-sm font-semibold text-neutral-700">
                  {activeConversation.participant.name}
                </h3>
                <p className="text-xs text-neutral-400">
                  {activeConversation.participant.isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50">
              {activeConversation.messages.map((msg) => {
                const isMe = msg.senderId === 'me';
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] sm:max-w-[60%] px-4 py-3 rounded-2xl ${
                        isMe
                          ? 'bg-primary-500 text-white rounded-br-md'
                          : 'bg-white text-neutral-700 border border-neutral-100 rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <p
                        className={`text-[10px] mt-1 ${
                          isMe ? 'text-white/60' : 'text-neutral-400'
                        }`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-neutral-100 bg-white">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    rows={1}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-2xl text-sm text-neutral-600 placeholder-neutral-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-3 bg-primary-500 text-white rounded-full hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                >
                  <HiPaperAirplane className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <HiOutlineChatBubbleLeftEllipsis className="h-16 w-16 text-neutral-200 mx-auto mb-4" />
              <p className="text-neutral-500 font-medium">Select a conversation</p>
              <p className="text-sm text-neutral-400 mt-1">Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InboxPage;
