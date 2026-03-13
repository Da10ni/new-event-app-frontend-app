import React, { forwardRef, useRef, useEffect, useCallback } from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  maxCharacters?: number;
  autoResize?: boolean;
  containerClassName?: string;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      error,
      helperText,
      maxCharacters,
      autoResize = false,
      disabled = false,
      containerClassName = '',
      className = '',
      value,
      onChange,
      id,
      rows = 4,
      ...rest
    },
    ref
  ) => {
    const internalRef = useRef<HTMLTextAreaElement | null>(null);
    const inputId = id || `textarea-${label?.toLowerCase().replace(/\s+/g, '-') || Math.random().toString(36).slice(2)}`;

    const setRefs = useCallback(
      (node: HTMLTextAreaElement | null) => {
        internalRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
        }
      },
      [ref]
    );

    const adjustHeight = useCallback(() => {
      const textarea = internalRef.current;
      if (textarea && autoResize) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, [autoResize]);

    useEffect(() => {
      adjustHeight();
    }, [value, adjustHeight]);

    const charCount = typeof value === 'string' ? value.length : 0;

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-neutral-600 mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={setRefs}
          id={inputId}
          rows={rows}
          disabled={disabled}
          value={value}
          onChange={onChange}
          maxLength={maxCharacters}
          className={`
            w-full rounded-xl border bg-white px-4 py-3 text-neutral-600 placeholder-neutral-300
            transition-all duration-200 resize-vertical
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            disabled:bg-neutral-50 disabled:text-neutral-300 disabled:cursor-not-allowed
            ${autoResize ? 'resize-none overflow-hidden' : ''}
            ${error ? 'border-error focus:ring-error focus:border-error' : 'border-neutral-200 hover:border-neutral-300'}
            ${className}
          `}
          {...rest}
        />
        <div className="flex justify-between mt-1.5">
          <div>
            {error && <p className="text-sm text-error">{error}</p>}
            {!error && helperText && <p className="text-sm text-neutral-300">{helperText}</p>}
          </div>
          {maxCharacters && (
            <p className={`text-sm ${charCount >= maxCharacters ? 'text-error' : 'text-neutral-300'}`}>
              {charCount}/{maxCharacters}
            </p>
          )}
        </div>
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

export default TextArea;
