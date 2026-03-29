import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { SettingsModal } from './components/SettingsModal';
import { useChatStore } from './stores/chatStore';

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [showApiKeyPrompt, setShowApiKeyPrompt] = useState(false);
  const { isDarkMode, apiKey, createConversation, currentConversationId } = useChatStore();

  // Apply dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Check for API key on mount and create initial conversation
  useEffect(() => {
    if (!apiKey) {
      setShowApiKeyPrompt(true);
    }
    if (!currentConversationId) {
      createConversation();
    }
  }, []);

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-white dark:bg-gray-900">
      <Sidebar onOpenSettings={() => setShowSettings(true)} />
      <ChatArea />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {/* API Key Prompt */}
      {showApiKeyPrompt && !apiKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
              欢迎使用 ChatGPT Demo
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              请输入你的 DeepSeek API Key 以开始聊天。你的 API Key 将只存储在本地浏览器中。
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowApiKeyPrompt(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                稍后设置
              </button>
              <button
                onClick={() => {
                  setShowApiKeyPrompt(false);
                  setShowSettings(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                设置 API Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
