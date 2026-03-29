import type { Message } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface StreamChatOptions {
  messages: Message[];
  apiKey: string;
  model?: string;
  temperature?: number;
  onMessage: (content: string) => void;
  onError: (error: string) => void;
  onComplete: () => void;
}

export async function streamChatCompletion(options: StreamChatOptions): Promise<void> {
  const { messages, apiKey, model, temperature, onMessage, onError, onComplete } = options;

  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        apiKey,
        model,
        temperature,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);

          if (data === '[DONE]') {
            onComplete();
            return;
          }

          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              onError(parsed.error);
              return;
            }
            if (parsed.content) {
              onMessage(parsed.content);
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }

    onComplete();
  } catch (error: any) {
    onError(error.message || 'Unknown error');
  }
}

export async function uploadFile(file: File): Promise<{ filename: string; url: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Upload failed');
  }

  return response.json();
}

export function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
