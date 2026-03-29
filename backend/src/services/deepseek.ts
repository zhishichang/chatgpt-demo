import axios from 'axios';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: Message[];
  model?: string;
  temperature?: number;
  stream?: boolean;
}

export class DeepSeekService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async *streamChatCompletion(request: ChatRequest): AsyncGenerator<string> {
    try {
      const response = await axios.post(
        DEEPSEEK_API_URL,
        {
          model: request.model || 'deepseek-chat',
          messages: request.messages,
          temperature: request.temperature ?? 0.7,
          stream: true,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          responseType: 'stream',
        }
      );

      const stream = response.data;

      for await (const chunk of stream) {
        const lines = chunk.toString().split('\n').filter((line: string) => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') {
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error: any) {
      console.error('DeepSeek API error:', error.message);
      throw new Error(`DeepSeek API error: ${error.message}`);
    }
  }

  async chatCompletion(request: ChatRequest): Promise<string> {
    try {
      const response = await axios.post(
        DEEPSEEK_API_URL,
        {
          model: request.model || 'deepseek-chat',
          messages: request.messages,
          temperature: request.temperature ?? 0.7,
          stream: false,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.choices?.[0]?.message?.content || '';
    } catch (error: any) {
      console.error('DeepSeek API error:', error.message);
      throw new Error(`DeepSeek API error: ${error.message}`);
    }
  }
}
