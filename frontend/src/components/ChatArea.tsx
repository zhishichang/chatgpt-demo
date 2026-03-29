import React, { useEffect, useRef } from 'react';
import { Message } from './Message';
import { InputArea } from './InputArea';
import { useChatStore } from '../stores/chatStore';
import { Bot, Sun, Moon, PanelLeft } from 'lucide-react';

export const ChatArea: React.FC = () => {
  const { conversations, currentConversationId, isDarkMode, toggleDarkMode, toggleSidebar, createConversation } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentConversation = conversations.find((c) => c.id === currentConversationId);
  const messages = currentConversation?.messages || [];

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="切换侧边栏"
          >
            <PanelLeft size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
          <h2 className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-md">
            {currentConversation?.title || '新对话'}
          </h2>
        </div>

        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title={isDarkMode ? '切换到浅色模式' : '切换到深色模式'}
        >
          {isDarkMode ? (
            <Sun size={20} className="text-gray-600 dark:text-gray-400" />
          ) : (
            <Moon size={20} className="text-gray-600" />
          )}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <Bot size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
              有什么可以帮你的？
            </h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              我是你的 AI 助手，可以回答问题、编写代码、分析文件等。开始一个对话吧！
            </p>
          </div>
        ) : (
          <div>
            {messages.map((message, index) => (
              <div key={message.id} className="group">
                <Message
                  message={message}
                  isLast={index === messages.length - 1}
                />
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <InputArea />
    </div>
  );
};

export default ChatArea;
