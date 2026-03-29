import React, { useState, useRef, useCallback } from 'react';
import { Send, Paperclip, X, Image as ImageIcon, FileText } from 'lucide-react';
import { useChatStore } from '../stores/chatStore';
import { useChat } from '../hooks/useChat';
import { uploadFile } from '../utils/api';

export const InputArea: React.FC = () => {
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<{ file: File; url?: string; uploading: boolean }[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { currentConversationId, createConversation } = useChatStore();
  const { sendMessage, isStreaming, error, clearError } = useChat();

  const handleSubmit = useCallback(async () => {
    if (!input.trim() || isStreaming) return;

    let conversationId = currentConversationId;
    if (!conversationId) {
      conversationId = createConversation();
    }

    let content = input.trim();

    // Add file references to the message
    if (files.length > 0) {
      const fileUrls = files
        .filter((f) => f.url)
        .map((f) => `![${f.file.name}](${f.url})`)
        .join('\n');
      if (fileUrls) {
        content += '\n\n' + fileUrls;
      }
    }

    setInput('');
    setFiles([]);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    await sendMessage(content);
  }, [input, files, currentConversationId, isStreaming, createConversation, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const newFiles: { file: File; url?: string; uploading: boolean }[] = [];

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const fileObj = { file, uploading: true };
      newFiles.push(fileObj);
      const index = files.length + i;

      try {
        const result = await uploadFile(file);
        setFiles((prev) =>
          prev.map((f, idx) => (idx === index ? { ...f, url: result.url, uploading: false } : f))
        );
      } catch (error) {
        console.error('Upload failed:', error);
        setFiles((prev) => prev.filter((_, idx) => idx !== index));
      }
    }

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon size={16} className="text-blue-500" />;
    }
    return <FileText size={16} className="text-green-500" />;
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Error message */}
        {error && (
          <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={clearError} className="p-1 hover:bg-red-100 dark:hover:bg-red-800 rounded">
              <X size={14} />
            </button>
          </div>
        )}

        {/* File preview */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {files.map((fileObj, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm"
              >
                {getFileIcon(fileObj.file)}
                <span className="truncate max-w-[150px]">{fileObj.file.name}</span>
                {fileObj.uploading ? (
                  <span className="text-xs text-gray-500">上传中...</span>
                ) : (
                  <button
                    onClick={() => removeFile(index)}
                    className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Input area */}
        <div className="relative flex items-end gap-2 bg-gray-100 dark:bg-gray-800 rounded-2xl p-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            accept="image/*,.txt,.md,.pdf"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shrink-0"
            title="上传文件"
          >
            <Paperclip size={20} className="text-gray-500" />
          </button>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="输入消息... (Shift+Enter 换行, Enter 发送)"
            className="flex-1 bg-transparent border-none outline-none resize-none text-gray-800 dark:text-gray-200 placeholder-gray-500 max-h-[200px] min-h-[24px] py-1"
            rows={1}
            disabled={isStreaming}
          />

          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isStreaming}
            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            {isStreaming ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={20} className="text-white" />
            )}
          </button>
        </div>

        <p className="text-center text-xs text-gray-500 mt-2">
          AI 生成的内容可能存在错误，请仔细核对重要信息
        </p>
      </div>
    </div>
  );
};

export default InputArea;
