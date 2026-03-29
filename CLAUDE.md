# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a ChatGPT-style chat application demo that uses the DeepSeek API. It consists of a React frontend and an Express backend.

## Development Commands

### Frontend (`frontend/`)
```bash
npm run dev      # Start dev server with Vite
npm run build    # TypeScript compile + Vite build
npm run lint     # ESLint
npm run preview  # Preview production build
```

### Backend (`backend/`)
```bash
npm run dev    # Start with nodemon (hot reload)
npm run build  # TypeScript compile to dist/
npm start      # Run compiled code from dist/
```

## Architecture

### Frontend (React + TypeScript + Vite)
- **State Management**: Zustand with persist middleware - state saved to localStorage under `chat-storage` key
- **Key Store**: `chatStore.ts` manages conversations, messages, settings (API key, model, temperature), and UI state
- **Components**:
  - `App.tsx` - Root layout, handles API key prompt on first load
  - `Sidebar.tsx` - Conversation list and management
  - `ChatArea.tsx` - Message display with streaming support
  - `InputArea.tsx` - Message input
  - `SettingsModal.tsx` - API key, model, temperature configuration
  - `Message.tsx` - Individual message with markdown rendering
- **Hooks**: `useChat.ts` encapsulates chat logic with streaming
- **API**: `api.ts` handles SSE streaming to backend

### Backend (Express + TypeScript)
- **Entry**: `src/index.ts` - Express server on port 3001
- **Routes**:
  - `/api/chat/stream` (POST) - SSE streaming chat
  - `/api/chat` (POST) - Non-streaming chat (for testing)
  - `/api/upload` (POST) - File upload (10MB limit, images/text/pdf)
- **Service**: `DeepSeekService` class handles API communication with streaming support

### Data Flow
1. User sends message → `useChat.sendMessage()`
2. Message added to Zustand store
3. `streamChatCompletion()` calls backend `/api/chat/stream`
4. Backend proxies to DeepSeek API with SSE
5. Chunks streamed back to frontend, updating message in real-time

## Environment

- Frontend: `VITE_API_URL` (defaults to `http://localhost:3001`)
- Backend: `PORT` (defaults to 3001)
- API Key: Stored in browser localStorage, passed to backend per request

## Default Model

- Model: `deepseek-chat` (defined in `frontend/src/types/index.ts`)
- Temperature: 0.7
