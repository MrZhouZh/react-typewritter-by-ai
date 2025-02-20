import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Chat } from './Chat';

// Mock EventSource
class MockEventSource {
  onmessage: ((event: any) => void) | null = null;
  onerror: (() => void) | null = null;
  addEventListener: jest.Mock;
  close: jest.Mock;

  constructor() {
    this.addEventListener = jest.fn();
    this.close = jest.fn();
  }
}

// Mock console.error to avoid noise in tests
console.error = jest.fn();

// Keep track of the latest EventSource instance
let currentEventSource: MockEventSource | null = null;

// Mock the global EventSource
class MockEventSourceConstructor extends MockEventSource {
  constructor(url: string) {
    super();
    currentEventSource = this;
    return this;
  }
}

// @ts-ignore
global.EventSource = MockEventSourceConstructor;

jest.setTimeout(10000);

describe('Chat', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup({ delay: null });
    jest.useFakeTimers();
    currentEventSource = null;
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('renders chat interface', () => {
    render(<Chat />);
    expect(screen.getByTestId('chat-container')).toBeInTheDocument();
    expect(screen.getByTestId('chat-form')).toBeInTheDocument();
    expect(screen.getByTestId('messages')).toBeInTheDocument();
    expect(screen.getByTestId('chat-input')).toBeInTheDocument();
    expect(screen.getByTestId('send-button')).toBeInTheDocument();
  });

  it('handles user input and submission', async () => {
    render(<Chat />);
    const input = screen.getByTestId('chat-input');
    const sendButton = screen.getByTestId('send-button');

    // Initially button should be disabled
    expect(sendButton).toBeDisabled();

    // Type a message
    await act(async () => {
      await user.type(input, 'Hello');
    });
    expect(sendButton).toBeEnabled();

    // Submit the message
    await act(async () => {
      await user.click(sendButton);
    });

    // Check if message appears in chat
    const messageContent = screen.getByTestId('message-content');
    expect(messageContent).toHaveTextContent('Hello');
    
    // Input should be cleared
    expect(input).toHaveValue('');
  });

  it('displays assistant messages with typewriter effect', async () => {
    render(<Chat />);
    const input = screen.getByTestId('chat-input');

    // Send a message
    await act(async () => {
      await user.type(input, 'Hello');
      await user.click(screen.getByTestId('send-button'));
    });

    // Simulate SSE response
    await act(async () => {
      if (currentEventSource?.onmessage) {
        currentEventSource.onmessage({
          data: JSON.stringify({
            type: 'token',
            content: 'Hi there!'
          })
        });

        // Simulate done event
        if (currentEventSource.addEventListener.mock.calls.length > 0) {
          const [eventName, callback] = currentEventSource.addEventListener.mock.calls[0];
          if (eventName === 'done' && typeof callback === 'function') {
            callback({} as Event);
          }
        }
      }
    });

    // Check if assistant message appears
    const assistantMessage = screen.getByTestId('message-assistant');
    expect(assistantMessage).toBeInTheDocument();
  });

  it('disables input while processing', async () => {
    render(<Chat />);
    const input = screen.getByTestId('chat-input');
    const sendButton = screen.getByTestId('send-button');

    // Send a message
    await act(async () => {
      await user.type(input, 'Hello');
      await user.click(sendButton);
    });

    // Input and button should be disabled while processing
    expect(input).toBeDisabled();
    expect(sendButton).toBeDisabled();

    // Simulate SSE done event to enable input
    await act(async () => {
      if (currentEventSource?.addEventListener.mock.calls.length > 0) {
        const [eventName, callback] = currentEventSource.addEventListener.mock.calls[0];
        if (eventName === 'done' && typeof callback === 'function') {
          callback({} as Event);
        }
      }
    });

    // Input should be enabled after done event
    expect(input).not.toBeDisabled();
  });

  it('handles SSE errors gracefully', async () => {
    render(<Chat />);
    const input = screen.getByTestId('chat-input');

    // Send a message
    await act(async () => {
      await user.type(input, 'Hello');
      await user.click(screen.getByTestId('send-button'));
    });

    // Simulate SSE error
    await act(async () => {
      if (currentEventSource?.onerror) {
        currentEventSource.onerror();
      }
    });

    // Input should be enabled after error
    expect(input).not.toBeDisabled();
  });
});
