import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { TypeWriter } from './TypeWriter';

jest.setTimeout(10000);

describe('TypeWriter', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders without crashing', () => {
    render(<TypeWriter text="Hello" />);
    expect(screen.getByTestId('typewriter')).toBeInTheDocument();
    expect(screen.getByTestId('typewriter-text')).toBeInTheDocument();
    expect(screen.getByTestId('typewriter-cursor')).toBeInTheDocument();
  });

  it('types text character by character', () => {
    const text = 'Hello';
    render(<TypeWriter text={text} speed={50} />);

    expect(screen.getByTestId('typewriter-text')).toHaveTextContent('');

    // Advance timers for each character
    for (let i = 0; i < text.length; i++) {
      act(() => {
        jest.advanceTimersByTime(50);
      });
      expect(screen.getByTestId('typewriter-text')).toHaveTextContent(text.slice(0, i + 1));
    }
  });

  it('calls onComplete when typing is finished', () => {
    const onComplete = jest.fn();
    const text = 'Hello';
    render(<TypeWriter text={text} speed={50} onComplete={onComplete} />);

    // Advance time to complete typing
    act(() => {
      jest.advanceTimersByTime(50 * text.length);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('resets and starts over when text changes', () => {
    const { rerender } = render(<TypeWriter text="Hello" speed={50} />);

    act(() => {
      jest.advanceTimersByTime(250); // Complete "Hello"
    });

    rerender(<TypeWriter text="World" speed={50} />);
    expect(screen.getByTestId('typewriter-text')).toHaveTextContent('');

    act(() => {
      jest.advanceTimersByTime(50);
    });
    expect(screen.getByTestId('typewriter-text')).toHaveTextContent('W');
  });

  it('shows cursor while typing and hides it when complete', () => {
    const text = 'Hi';
    render(<TypeWriter text={text} speed={50} />);

    // Initially cursor should be visible
    expect(screen.getByTestId('typewriter-cursor')).toBeInTheDocument();

    // Complete typing
    act(() => {
      jest.advanceTimersByTime(50 * text.length);
    });

    // Cursor should be hidden
    expect(screen.queryByTestId('typewriter-cursor')).not.toBeInTheDocument();
  });
});
