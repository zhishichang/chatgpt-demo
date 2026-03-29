import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { User, Bot, Copy, RotateCcw, Trash2 } from 'lucide-react';
import type { Message as MessageType } from '../types';
import { useChatStore } from '../stores/chatStore';
import { copyToClipboard } from '../utils/format';

interface MessageProps {
  message: MessageType;
  isLast?: boolean;
}

const CodeBlock: React.FC<{
  language: string;
  value: string;
  isDark: boolean;
}> = ({ language, value, isDark }) => {
  const handleCopy = () => {
    copyToClipboard(value);
  };

  return (
    <div className="relative group">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 dark:bg-gray-900 rounded-t-lg">
        <span className="text-xs text-gray-400">{language || 'text'}</span>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded hover:bg-gray-700 transition-colors"
          title="复制代码"
        >
          <Copy size={14} className="text-gray-400" />
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={isDark ? oneDark : oneLight}
        customStyle={{
          margin: 0,
          borderRadius: '0 0 0.5rem 0.5rem',
          fontSize: '0.875rem',
        }}
      >
        {value}
      </SyntaxHighlighter>
    </div>
  );
};

export const Message: React.FC<MessageProps> = ({ message, isLast }) => {
  const { isDarkMode, currentConversationId, deleteMessage, regenerateMessage } = useChatStore();
  const isUser = message.role === 'user';

  const handleCopy = () => {
    copyToClipboard(message.content);
  };

  const handleDelete = () => {
    if (currentConversationId) {
      deleteMessage(currentConversationId, message.id);
    }
  };

  const handleRegenerate = () => {
    if (currentConversationId && !isUser) {
      regenerateMessage(currentConversationId, message.id);
    }
  };

  return (
    <div
      className={`py-6 ${
        isUser
          ? 'bg-white dark:bg-gray-800'
          : 'bg-gray-50 dark:bg-gray-850'
      }`}
    >
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex gap-4">
          {/* Avatar */}
          <div
            className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              isUser
                ? 'bg-blue-600 text-white'
                : 'bg-green-600 text-white'
            }`}
          >
            {isUser ? <User size={16} /> : <Bot size={16} />}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {isUser ? 'You' : 'Assistant'}
              </span>
              {message.isStreaming && (
                <span className="text-xs text-gray-500 animate-pulse">●</span>
              )}
            </div>

            <div className="prose dark:prose-invert max-w-none markdown-content">
              {message.content ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <CodeBlock
                          language={match[1]}
                          value={String(children).replace(/\n$/, '')}
                          isDark={isDarkMode}
                        />
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              ) : (
                <span className="text-gray-400">...</span>
              )}
            </div>

            {/* Actions */}
            {!isUser && !message.isStreaming && (
              <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title="复制"
                >
                  <Copy size={14} className="text-gray-500" />
                </button>
                {isLast && (
                  <button
                    onClick={handleRegenerate}
                    className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title="重新生成"
                  >
                    <RotateCcw size={14} className="text-gray-500" />
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title="删除"
                >
                  <Trash2 size={14} className="text-gray-500" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
