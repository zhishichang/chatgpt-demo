import React from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  PanelLeftClose,
  PanelLeft,
  Settings,
  Download,
  X,
} from 'lucide-react';
import { useChatStore } from '../stores/chatStore';
import { formatTimestamp } from '../utils/format';
import { downloadFile } from '../utils/api';

interface SidebarProps {
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenSettings }) => {
  const conversations = useChatStore((state) => state.conversations);
  const currentConversationId = useChatStore((state) => state.currentConversationId);
  const isSidebarOpen = useChatStore((state) => state.isSidebarOpen);
  const createConversation = useChatStore((state) => state.createConversation);
  const deleteConversation = useChatStore((state) => state.deleteConversation);
  const setCurrentConversation = useChatStore((state) => state.setCurrentConversation);
  const toggleSidebar = useChatStore((state) => state.toggleSidebar);
  const clearConversations = useChatStore((state) => state.clearConversations);
  const exportConversation = useChatStore((state) => state.exportConversation);

  const handleExport = (id: string, format: 'markdown' | 'json') => {
    const content = exportConversation(id, format);
    const filename = `chat-${format === 'json' ? 'export.json' : 'export.md'}`;
    downloadFile(content, filename, format === 'json' ? 'application/json' : 'text/markdown');
  };

  if (!isSidebarOpen) {
    return (
      <button
        onClick={toggleSidebar}
        className="fixed left-4 top-4 z-50 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        title="展开侧边栏"
      >
        <PanelLeft size={20} className="text-gray-600 dark:text-gray-300" />
      </button>
    );
  }

  return (
    <div className="w-64 h-full bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">ChatGPT Demo</h1>
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title="收起侧边栏"
        >
          <PanelLeftClose size={18} className="text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      <div className="p-4">
        <button
          onClick={createConversation}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          <Plus size={18} />
          <span>新对话</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3">
        {conversations.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
            暂无对话
            <br />
            点击上方按钮开始
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                  conversation.id === currentConversationId
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
                onClick={() => setCurrentConversation(conversation.id)}
              >
                <MessageSquare size={16} className="shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{conversation.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTimestamp(conversation.updatedAt)}
                  </p>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExport(conversation.id, 'markdown');
                    }}
                    className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    title="导出"
                  >
                    <Download size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conversation.id);
                    }}
                    className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    title="删除"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
        {conversations.length > 0 && (
          <button
            onClick={clearConversations}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
            <span>清空所有对话</span>
          </button>
        )}
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Settings size={16} />
          <span>设置</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
