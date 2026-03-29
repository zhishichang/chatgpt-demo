import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Conversation, Message } from '../types';
import { DEFAULT_MODEL, DEFAULT_TEMPERATURE } from '../types';

interface ChatState {
  // Conversations
  conversations: Conversation[];
  currentConversationId: string | null;

  // UI State
  isDarkMode: boolean;
  isSidebarOpen: boolean;
  isLoading: boolean;

  // Settings
  apiKey: string | null;
  temperature: number;
  model: string;

  // Actions
  setApiKey: (key: string) => void;
  createConversation: () => string;
  deleteConversation: (id: string) => void;
  setCurrentConversation: (id: string) => void;
  updateConversationTitle: (id: string, title: string) => void;
  addMessage: (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => string;
  updateMessage: (conversationId: string, messageId: string, content: string, isStreaming?: boolean) => void;
  deleteMessage: (conversationId: string, messageId: string) => void;
  regenerateMessage: (conversationId: string, messageId: string) => void;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  setLoading: (loading: boolean) => void;
  clearConversations: () => void;
  getCurrentConversation: () => Conversation | null;
  exportConversation: (id: string, format: 'markdown' | 'json') => string;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // Initial state
      conversations: [],
      currentConversationId: null,
      isDarkMode: false,
      isSidebarOpen: true,
      isLoading: false,
      apiKey: null,
      temperature: DEFAULT_TEMPERATURE,
      model: DEFAULT_MODEL,

      // Actions
      setApiKey: (key) => set({ apiKey: key }),

      createConversation: () => {
        const newConversation: Conversation = {
          id: generateId(),
          title: '新对话',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set((state) => ({
          conversations: [newConversation, ...state.conversations],
          currentConversationId: newConversation.id,
        }));

        return newConversation.id;
      },

      deleteConversation: (id) => {
        set((state) => {
          const newConversations = state.conversations.filter((c) => c.id !== id);
          const newCurrentId =
            state.currentConversationId === id
              ? newConversations[0]?.id || null
              : state.currentConversationId;

          return {
            conversations: newConversations,
            currentConversationId: newCurrentId,
          };
        });
      },

      setCurrentConversation: (id) => set({ currentConversationId: id }),

      updateConversationTitle: (id, title) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, title, updatedAt: Date.now() } : c
          ),
        }));
      },

      addMessage: (conversationId, message) => {
        const newMessage: Message = {
          ...message,
          id: generateId(),
          timestamp: Date.now(),
        };

        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: [...c.messages, newMessage],
                  updatedAt: Date.now(),
                  title:
                    c.messages.length === 0 && message.role === 'user'
                      ? message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '')
                      : c.title,
                }
              : c
          ),
        }));

        return newMessage.id;
      },

      updateMessage: (conversationId, messageId, content, isStreaming) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === messageId ? { ...m, content, isStreaming } : m
                  ),
                }
              : c
          ),
        }));
      },

      deleteMessage: (conversationId, messageId) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? { ...c, messages: c.messages.filter((m) => m.id !== messageId) }
              : c
          ),
        }));
      },

      regenerateMessage: (conversationId, messageId) => {
        // This will be handled by the chat component to trigger a new API call
        const conversation = get().conversations.find((c) => c.id === conversationId);
        if (!conversation) return;

        const messageIndex = conversation.messages.findIndex((m) => m.id === messageId);
        if (messageIndex === -1) return;

        // Remove the assistant message and all messages after it
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? { ...c, messages: c.messages.slice(0, messageIndex) }
              : c
          ),
        }));
      },

      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

      setLoading: (loading) => set({ isLoading: loading }),

      clearConversations: () => set({ conversations: [], currentConversationId: null }),

      getCurrentConversation: () => {
        const { conversations, currentConversationId } = get();
        return conversations.find((c) => c.id === currentConversationId) || null;
      },

      exportConversation: (id, format) => {
        const conversation = get().conversations.find((c) => c.id === id);
        if (!conversation) return '';

        if (format === 'json') {
          return JSON.stringify(conversation, null, 2);
        } else {
          let markdown = `# ${conversation.title}\n\n`;
          markdown += `Created: ${new Date(conversation.createdAt).toLocaleString()}\n\n`;
          markdown += '---\n\n';

          conversation.messages.forEach((msg) => {
            const role = msg.role === 'user' ? '**User**' : '**Assistant**';
            markdown += `${role}:\n${msg.content}\n\n---\n\n`;
          });

          return markdown;
        }
      },
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        conversations: state.conversations,
        currentConversationId: state.currentConversationId,
        isDarkMode: state.isDarkMode,
        isSidebarOpen: state.isSidebarOpen,
        apiKey: state.apiKey,
        temperature: state.temperature,
        model: state.model,
      }),
    }
  )
);
