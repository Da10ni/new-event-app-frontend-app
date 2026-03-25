import React, { useState, useRef, useEffect, useCallback } from 'react';
import { HiPaperAirplane, HiChevronLeft, HiOutlineChatBubbleLeftEllipsis, HiPencil, HiTrash, HiXMark, HiEllipsisVertical, HiArrowUturnLeft } from 'react-icons/hi2';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { useSocket } from '../../../contexts/SocketContext';
import { messageApi } from '../../../services/api/messageApi';
import {
  setConversations,
  setMessages,
  addMessage,
  updateConversationLastMessage,
  setLoading,
  setMessagesLoading,
  clearConversationUnread,
  updateMessage,
} from '../../../store/slices/messageSlice';
import Avatar from '../../../components/ui/Avatar';
import EmptyState from '../../../components/feedback/EmptyState';
import LoadingSpinner from '../../../components/feedback/LoadingSpinner';
import type { Conversation, Message } from '../../../types/message.types';

const ProviderInboxPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { conversations, messages, loading, messagesLoading } = useAppSelector((state) => state.message);
  const { socket } = useSocket();

  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showMobileList, setShowMobileList] = useState(true);
  const [typingUserId, setTypingUserId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    requestAnimationFrame(() => {
      const container = messagesContainerRef.current;
      if (container) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: smooth ? 'smooth' : 'instant',
        });
      }
    });
  }, []);

  useEffect(() => {
    const fetchConversations = async () => {
      dispatch(setLoading(true));
      try {
        const res = await messageApi.getConversations({ limit: 50 });
        dispatch(setConversations(res.data.data.conversations));
      } catch {
        // silently fail
      } finally {
        dispatch(setLoading(false));
      }
    };
    fetchConversations();
  }, [dispatch]);

  useEffect(() => {
    if (!activeConversation) return;
    const fetchMessages = async () => {
      dispatch(setMessagesLoading(true));
      try {
        const res = await messageApi.getMessages(activeConversation._id, { limit: 50 });
        dispatch(setMessages(res.data.data.messages));
        await messageApi.markAsRead(activeConversation._id);
        if (user?._id) {
          dispatch(clearConversationUnread({ conversationId: activeConversation._id, userId: user._id }));
        }
      } catch {
        // silently fail
      } finally {
        dispatch(setMessagesLoading(false));
      }
    };
    fetchMessages();
  }, [activeConversation?._id, dispatch]);

  useEffect(() => {
    scrollToBottom(false);
  }, [messages.length, scrollToBottom]);

  // Scroll to bottom after messages finish loading
  useEffect(() => {
    if (!messagesLoading && messages.length > 0) {
      scrollToBottom(false);
    }
  }, [messagesLoading]);

  useEffect(() => {
    if (!socket || !activeConversation) return;
    socket.emit('join_conversation', activeConversation._id);
    return () => {
      socket.emit('leave_conversation', activeConversation._id);
    };
  }, [socket, activeConversation?._id]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: Message) => {
      dispatch(addMessage(msg));
      dispatch(updateConversationLastMessage({ conversationId: msg.conversation, message: msg }));
      if (activeConversation && msg.conversation === activeConversation._id) {
        messageApi.markAsRead(activeConversation._id).catch(() => {});
        if (user?._id) {
          dispatch(clearConversationUnread({ conversationId: activeConversation._id, userId: user._id }));
        }
      }
    };

    const handleConversationUpdated = () => {
      messageApi.getConversations({ limit: 50 }).then((res) => {
        dispatch(setConversations(res.data.data.conversations));
      }).catch(() => {});
    };

    const handleTyping = ({ userId }: { userId: string }) => setTypingUserId(userId);
    const handleStopTyping = () => setTypingUserId(null);
    const handleMessageEdited = (msg: Message) => dispatch(updateMessage(msg));
    const handleMessageDeleted = (msg: Message) => dispatch(updateMessage(msg));

    socket.on('new_message', handleNewMessage);
    socket.on('conversation_updated', handleConversationUpdated);
    socket.on('typing', handleTyping);
    socket.on('stop_typing', handleStopTyping);
    socket.on('message_edited', handleMessageEdited);
    socket.on('message_deleted', handleMessageDeleted);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('conversation_updated', handleConversationUpdated);
      socket.off('typing', handleTyping);
      socket.off('stop_typing', handleStopTyping);
      socket.off('message_edited', handleMessageEdited);
      socket.off('message_deleted', handleMessageDeleted);
    };
  }, [socket, activeConversation, dispatch]);

  useEffect(() => {
    if (!menuOpenId) return;
    const handleClick = () => setMenuOpenId(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [menuOpenId]);

  const autoResizeInput = useCallback(() => {
    const el = inputRef.current;
    if (el) {
      el.style.height = 'auto';
      const single = 40;
      el.style.height = `${Math.max(single, Math.min(el.scrollHeight, 128))}px`;
      el.style.overflow = el.scrollHeight > 128 ? 'auto' : 'hidden';
    }
  }, []);

  // Focus input and auto-resize when entering edit mode
  useEffect(() => {
    if (editingMessageId && inputRef.current) {
      inputRef.current.focus();
      autoResizeInput();
    }
  }, [editingMessageId, autoResizeInput]);

  const getOtherParticipant = useCallback(
    (convo: Conversation) => {
      return convo.participants.find((p) => p._id !== user?._id) || convo.participants[0];
    },
    [user?._id]
  );

  const handleSelectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation);
    setShowMobileList(false);
    setTypingUserId(null);
    cancelEditing();
    setReplyingTo(null);
    setMenuOpenId(null);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;
    const text = newMessage.trim();
    setNewMessage('');
    if (socket) socket.emit('stop_typing', { conversationId: activeConversation._id });
    const replyToId = replyingTo?._id;
    setReplyingTo(null);
    try {
      const res = await messageApi.sendMessage(activeConversation._id, text, replyToId);
      const sentMessage = res.data.data.message;
      dispatch(addMessage(sentMessage));
      dispatch(updateConversationLastMessage({ conversationId: activeConversation._id, message: sentMessage }));
    } catch {
      setNewMessage(text);
    }
  };

  const handleEditMessage = async () => {
    if (!editText.trim() || !activeConversation || !editingMessageId) return;
    try {
      const res = await messageApi.editMessage(activeConversation._id, editingMessageId, editText.trim());
      dispatch(updateMessage(res.data.data.message));
    } catch {
      // silently fail
    }
    cancelEditing();
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!activeConversation) return;
    try {
      const res = await messageApi.deleteMessage(activeConversation._id, messageId);
      dispatch(updateMessage(res.data.data.message));
    } catch {
      // silently fail
    }
    setMenuOpenId(null);
  };

  const startEditing = (msg: Message) => {
    setEditingMessageId(msg._id);
    setEditText(msg.text);
    setNewMessage('');
    setReplyingTo(null);
    setMenuOpenId(null);
  };

  const startReplying = (msg: Message) => {
    setReplyingTo(msg);
    cancelEditing();
    setMenuOpenId(null);
    inputRef.current?.focus();
  };

  const cancelReplying = () => {
    setReplyingTo(null);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditText('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (editingMessageId) { cancelEditing(); return; }
      if (replyingTo) { cancelReplying(); return; }
    }
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (editingMessageId) handleEditMessage();
      else handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    autoResizeInput();
    if (editingMessageId) {
      setEditText(e.target.value);
    } else {
      setNewMessage(e.target.value);
      if (socket && activeConversation) {
        socket.emit('typing', { conversationId: activeConversation._id });
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          socket.emit('stop_typing', { conversationId: activeConversation._id });
        }, 2000);
      }
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'short' });
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getSenderId = (msg: Message): string =>
    typeof msg.sender === 'string' ? msg.sender : msg.sender._id;

  const inputValue = editingMessageId ? editText : newMessage;
  const inputDisabled = editingMessageId ? !editText.trim() : !newMessage.trim();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <EmptyState
          icon={<HiOutlineChatBubbleLeftEllipsis className="h-16 w-16 mx-auto" />}
          title="No messages yet"
          description="When a client sends you a message, it will appear here."
        />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-7rem)] bg-white flex overflow-hidden rounded-xl border border-neutral-100">
      {/* Conversation List */}
      <div className={`w-full md:w-80 border-r border-neutral-100 flex flex-col shrink-0 ${!showMobileList ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-neutral-100">
          <h1 className="text-lg font-bold text-neutral-700">Messages</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((convo) => {
            const other = getOtherParticipant(convo);
            const isActive = activeConversation?._id === convo._id;
            const unread = convo.unreadCounts?.[user?._id || ''] || 0;
            return (
              <button
                key={convo._id}
                onClick={() => handleSelectConversation(convo)}
                className={`w-full flex items-start gap-3 px-4 py-3 border-b border-neutral-50 transition-colors text-left ${isActive ? 'bg-primary-50' : 'hover:bg-neutral-50'}`}
              >
                <Avatar src={other.avatar?.url} name={other.fullName || `${other.firstName} ${other.lastName}`} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-neutral-700 truncate">{other.fullName || `${other.firstName} ${other.lastName}`}</h3>
                    {convo.lastMessage?.createdAt && (
                      <span className="text-xs text-neutral-400 shrink-0">{formatTime(convo.lastMessage.createdAt)}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p className="text-xs text-neutral-400 truncate">{convo.lastMessage?.text || 'No messages yet'}</p>
                    {unread > 0 && (
                      <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center shrink-0">{unread}</span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages */}
      <div className={`flex-1 flex flex-col ${showMobileList ? 'hidden md:flex' : 'flex'}`}>
        {activeConversation ? (
          <>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100 shrink-0">
              <button onClick={() => setShowMobileList(true)} className="p-2 rounded-full hover:bg-neutral-100 md:hidden">
                <HiChevronLeft className="h-5 w-5" />
              </button>
              {(() => {
                const other = getOtherParticipant(activeConversation);
                return (
                  <>
                    <Avatar src={other.avatar?.url} name={other.fullName || `${other.firstName} ${other.lastName}`} size="sm" />
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-700">{other.fullName || `${other.firstName} ${other.lastName}`}</h3>
                      {typingUserId && typingUserId !== user?._id ? (
                        <p className="text-xs text-primary-500">Typing...</p>
                      ) : activeConversation.listing ? (
                        <p className="text-xs text-neutral-400">{activeConversation.listing.title}</p>
                      ) : null}
                    </div>
                  </>
                );
              })()}
            </div>

            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full"><LoadingSpinner /></div>
              ) : (
                messages.map((msg) => {
                  const isMe = getSenderId(msg) === user?._id;
                  const isBeingEdited = editingMessageId === msg._id;

                  const menuButton = !msg.isDeleted ? (
                    <div className="relative opacity-0 group-hover:opacity-100 transition-opacity mb-1 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === msg._id ? null : msg._id); }}
                        className="p-0.5 rounded hover:bg-neutral-200 text-neutral-400"
                      >
                        <HiEllipsisVertical className="h-4 w-4" />
                      </button>
                      {menuOpenId === msg._id && (
                        <div className={`absolute bottom-full ${isMe ? 'right-0' : 'left-0'} mb-1 bg-white rounded-lg shadow-lg border border-neutral-100 py-1 min-w-30 z-20`}>
                          <button
                            onClick={() => startReplying(msg)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50"
                          >
                            <HiArrowUturnLeft className="h-3.5 w-3.5" /> Reply
                          </button>
                          {isMe && (
                            <>
                              <button
                                onClick={() => startEditing(msg)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-50"
                              >
                                <HiPencil className="h-3.5 w-3.5" /> Edit
                              </button>
                              <button
                                onClick={() => handleDeleteMessage(msg._id)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                              >
                                <HiTrash className="h-3.5 w-3.5" /> Delete
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ) : null;

                  return (
                    <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className="group flex items-end gap-1 max-w-[75%] sm:max-w-[60%]">
                        {/* Menu on left for own messages */}
                        {isMe && menuButton}
                        {/* Message bubble */}
                        <div className={`px-4 py-3 rounded-2xl min-w-0 overflow-hidden ${
                          msg.isDeleted
                            ? 'bg-neutral-100 text-neutral-400 italic'
                            : isMe
                              ? `bg-primary-500 text-white rounded-br-md ${isBeingEdited ? 'ring-2 ring-white/50' : ''}`
                              : 'bg-white text-neutral-700 border border-neutral-100 rounded-bl-md'
                        }`}>
                          {/* Reply context */}
                          {msg.replyTo && !msg.isDeleted && (
                            <div className={`mb-2 flex items-center gap-1.5 border-l-2 pl-2 text-xs overflow-hidden min-w-0 ${isMe ? 'border-white/30 text-white/50' : 'border-neutral-300 text-neutral-400'}`}>
                              <HiArrowUturnLeft className="h-3 w-3 shrink-0" />
                              <p className="truncate min-w-0">{msg.replyTo.isDeleted ? 'This message was deleted' : msg.replyTo.text}</p>
                            </div>
                          )}
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                          <p className={`text-[10px] mt-1 ${
                            msg.isDeleted ? 'text-neutral-300' : isMe ? 'text-white/60' : 'text-neutral-400'
                          }`}>
                            {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                            {msg.isEdited && !msg.isDeleted && ' · edited'}
                          </p>
                        </div>
                        {/* Menu on right for other's messages */}
                        {!isMe && menuButton}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input area */}
            <div className="border-t border-neutral-100 bg-white shrink-0">
              {/* Reply indicator */}
              {replyingTo && !editingMessageId && (
                <div className="flex items-center gap-2 px-4 py-1.5 bg-neutral-50 border-b border-neutral-200 w-full max-w-full">
                  <HiArrowUturnLeft className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                  <span className="flex-1 w-0 text-xs text-neutral-400 truncate">{replyingTo.text}</span>
                  <button onClick={cancelReplying} className="p-0.5 rounded-full hover:bg-neutral-200 text-neutral-400 shrink-0">
                    <HiXMark className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              {/* Edit indicator */}
              {editingMessageId && (
                <div className="flex items-center justify-between px-4 py-1.5 bg-primary-50 border-b border-primary-100">
                  <span className="flex items-center gap-2 text-xs font-medium text-primary-600">
                    <HiPencil className="h-3.5 w-3.5" /> Editing
                  </span>
                  <button onClick={cancelEditing} className="p-0.5 rounded-full hover:bg-primary-100 text-primary-400">
                    <HiXMark className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              <div className="p-4">
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <textarea
                      ref={inputRef}
                      value={inputValue}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message..."
                      rows={1}
                      className="w-full px-4 py-3 border border-neutral-200 rounded-2xl text-sm text-neutral-600 placeholder-neutral-400 resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <button
                    onClick={editingMessageId ? handleEditMessage : handleSendMessage}
                    disabled={inputDisabled}
                    className="p-3 bg-primary-500 text-white rounded-full hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                  >
                    <HiPaperAirplane className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <HiOutlineChatBubbleLeftEllipsis className="h-16 w-16 text-neutral-200 mx-auto mb-4" />
              <p className="text-neutral-500 font-medium">Select a conversation</p>
              <p className="text-sm text-neutral-400 mt-1">Choose a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderInboxPage;
