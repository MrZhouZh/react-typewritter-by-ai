'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import useSound from 'use-sound';
import clsx from 'clsx';
import { useSettingsStore } from '../store/settings';

interface TypeWriterProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
  renderComponent?: (props: { displayText: string | React.ReactNode }) => React.ReactNode;
}

export const TypeWriter: React.FC<TypeWriterProps> = ({
  text,
  speed: propSpeed,
  className = '',
  onComplete,
  renderComponent
}) => {
  const { typingSpeed, fadeInDuration, fadeInDelay } = useSettingsStore();
  const speed = propSpeed ?? typingSpeed;
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);
  const completedRef = useRef(false);

  const typeNextCharacter = useCallback(() => {
    if (indexRef.current < text.length) {
      indexRef.current += 1;
      setDisplayText(text);

      if (indexRef.current === text.length && !completedRef.current) {
        setIsComplete(true);
        completedRef.current = true;
        onComplete?.();
      }
    }
  }, [text, onComplete]);

  useEffect(() => {
    // Reset when text changes
    setDisplayText('');
    setIsComplete(false);
    indexRef.current = 0;
    completedRef.current = false;
  }, [text]);

  useEffect(() => {
    const timer = setInterval(typeNextCharacter, speed);
    return () => clearInterval(timer);
  }, [typeNextCharacter, speed]);

  const renderText = (text: string) => {
    return text.split('').map((char, index) => (
      <span
        key={index}
        className="typewriter-char"
        data-visible={index < indexRef.current}
        style={{
          '--fade-duration': `${fadeInDuration}ms`,
          transitionDelay: `${index * fadeInDelay}ms`
        } as React.CSSProperties}
      >
        {char}
      </span>
    ));
  };

  if (renderComponent) {
    return (
      <div className={clsx('inline-block', className)} data-testid="typewriter">
        <div className="inline-block min-h-[1.2em]">
          {renderComponent({ displayText: renderText(displayText) })}
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('inline-block', className)} data-testid="typewriter">
      <span
        className="min-h-[1.2em] inline-block"
        data-testid="typewriter-text"
      >
        {renderText(displayText)}
      </span>
      {!isComplete && (
        <span
          className="animate-blink inline-block"
          data-testid="typewriter-cursor"
        >
          |
        </span>
      )}
    </div>
  );
};

export default TypeWriter;
