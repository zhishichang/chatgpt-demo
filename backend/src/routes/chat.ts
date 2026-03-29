import { Router } from 'express';
import { DeepSeekService, Message } from '../services/deepseek';

const router = Router();

// SSE streaming chat
router.post('/stream', async (req, res) => {
  try {
    const { messages, apiKey, model, temperature } = req.body;

    if (!apiKey) {
      return res.status(401).json({ error: 'API key is required' });
    }

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const deepseek = new DeepSeekService(apiKey);

    const request = {
      messages: messages as Message[],
      model,
      temperature,
      stream: true,
    };

    try {
      for await (const chunk of deepseek.streamChatCompletion(request)) {
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error: any) {
      console.error('Streaming error:', error);
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  } catch (error: any) {
    console.error('Route error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Non-streaming chat (for testing)
router.post('/', async (req, res) => {
  try {
    const { messages, apiKey, model, temperature } = req.body;

    if (!apiKey) {
      return res.status(401).json({ error: 'API key is required' });
    }

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const deepseek = new DeepSeekService(apiKey);

    const request = {
      messages: messages as Message[],
      model,
      temperature,
      stream: false,
    };

    const content = await deepseek.chatCompletion(request);

    res.json({ content });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
