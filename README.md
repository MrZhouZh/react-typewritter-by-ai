# ChatGPT-like Interface with TypeWriter Effect

A Next.js application that implements a chat interface with a typewriter effect similar to ChatGPT, using Server-Sent Events (SSE) for real-time communication.

## Features

- Real-time chat interface with typewriter effect
- Server-Sent Events (SSE) for streaming responses
- TypeScript support
- Fully tested components
- Responsive design with Tailwind CSS

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Running Tests

To run the tests:

```bash
npm test
```

To run tests in watch mode:

```bash
npm run test:watch
```

## Project Structure

- `/src/components/` - React components
  - `TypeWriter.tsx` - Typewriter effect component
  - `Chat.tsx` - Main chat interface
- `/src/app/` - Next.js app directory
  - `api/chat/` - SSE endpoint for chat
  - `page.tsx` - Main page
  - `globals.css` - Global styles

## Implementation Details

- Uses Server-Sent Events (SSE) for real-time communication
- Implements a typewriter effect for assistant messages
- Includes comprehensive test coverage
- Styled with Tailwind CSS for a modern look
- Built with TypeScript for type safety
