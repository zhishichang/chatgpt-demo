import { useCallback, useState } from 'react';
import { useChatStore } from '../stores/chatStore';
import { streamChatCompletion } from '../utils/api';
import type { Message } from '../types';

export function useChat() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    apiKey,
    temperature,
    model,
    currentConversationId,
    addMessage,
    updateMessage,
    regenerateMessage,
    getCurrentConversation,
  } = useChatStore();

  const sendMessage = useCallback(
    async (content: string) => {
      if (!apiKey) {
        setError('请先设置 API Key');
        return;
      }

      if (!currentConversationId) {
        setError('请先创建或选择一个对话');
        return;
      }

      setError(null);
      setIsStreaming(true);

      // Add user message
      addMessage(currentConversationId, {
        role: 'user',
        content,
      });

      // Get conversation history for context
      const conversation = getCurrentConversation();
      const messages: Message[] = conversation?.messages.slice(-20) || []; // Keep last 20 messages for context

      // Add empty assistant message for streaming
      const assistantMessageId = addMessage(currentConversationId, {
        role: 'assistant',
        content: '',
        isStreaming: true,
      });

      let accumulatedContent = '';

      await streamChatCompletion({
        messages,
        apiKey,
        model,
        temperature,
        onMessage: (chunk) => {
          accumulatedContent += chunk;
          updateMessage(currentConversationId, assistantMessageId, accumulatedContent, true);
        },
        onError: (err) => {
          setError(err);
          updateMessage(currentConversationId, assistantMessageId, `Error: ${err}`, false);
          setIsStreaming(false);
        },
        onComplete: () => {
          updateMessage(currentConversationId, assistantMessageId, accumulatedContent, false);
          setIsStreaming(false);
        },
      });
    },
    [apiKey, currentConversationId, temperature, model, addMessage, updateMessage, getCurrentConversation]
  );

  const handleRegenerate = useCallback(
    async (messageId: string) => {
      if (!apiKey || !currentConversationId) return;

      // Remove the message and all after it
      regenerateMessage(currentConversationId, messageId);

      const conversation = getCurrentConversation();
      const lastUserMessage = conversation?.messages
        .slice()
        .reverse()
        .find((m) => m.role === 'user');

      if (lastUserMessage) {
        await sendMessage(lastUserMessage.content);
      }
    },
    [apiKey, currentConversationId, regenerateMessage, getCurrentConversation, sendMessage]
  );

  return {
    sendMessage,
    regenerateMessage: handleRegenerate,
    isStreaming,
    error,
    clearError: () => setError(null),
  };
}
