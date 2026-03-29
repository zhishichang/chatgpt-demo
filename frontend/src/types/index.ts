export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface AppState {
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
}

export const DEFAULT_MODEL = 'deepseek-chat';
export const DEFAULT_TEMPERATURE = 0.7;

// Re-export for explicit module boundary
export type { Conversation, Message, AppState };
