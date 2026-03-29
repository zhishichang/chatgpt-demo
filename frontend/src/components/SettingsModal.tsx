import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { useChatStore } from '../stores/chatStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { apiKey, setApiKey, temperature, model } = useChatStore();
  const [localApiKey, setLocalApiKey] = useState(apiKey || '');
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLocalApiKey(apiKey || '');
    }
  }, [isOpen, apiKey]);

  const handleSave = () => {
    setApiKey(localApiKey.trim());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">设置</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              DeepSeek API Key <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={localApiKey}
                onChange={(e) => setLocalApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              >
                {showApiKey ? (
                  <EyeOff size={16} className="text-gray-500" />
                ) : (
                  <Eye size={16} className="text-gray-500" />
                )}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              你的 API Key 只存储在本地浏览器中
            </p>
          </div>

          {/* Model */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              模型
            </label>
            <select
              disabled
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
            >
              <option>deepseek-chat</option>
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">当前仅支持 deepseek-chat 模型</p>
          </div>

          {/* Temperature */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Temperature ({temperature})
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              disabled
              className="w-full"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">温度设置将在后续版本支持</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-850">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
