import React, { useMemo, useRef, useEffect, useCallback } from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  languageLabel?: string;
  placeholder?: string;
  minLines?: number;
  toolbar?: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  languageLabel,
  placeholder,
  minLines = 8,
  toolbar,
  className = '',
  ariaLabel,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const gutterRef = useRef<HTMLDivElement | null>(null);

  const lineCount = useMemo(() => {
    const fallback = Math.max(minLines, 1);
    if (!value) return fallback;
    const count = value.split('\n').length;
    return Math.max(count, fallback);
  }, [value, minLines]);

  const handleScroll = useCallback(() => {
    if (!textareaRef.current || !gutterRef.current) return;
    gutterRef.current.scrollTop = textareaRef.current.scrollTop;
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.addEventListener('scroll', handleScroll);
    return () => textarea.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const lines = useMemo(() => Array.from({ length: lineCount }, (_, index) => index + 1), [lineCount]);

  return (
    <div className={`rounded-xl border border-slate-700/70 bg-slate-950/80 shadow-inner ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-700/60 px-4 py-2">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="inline-flex items-center rounded-md border border-slate-700 bg-slate-900/80 px-2 py-1 font-mono uppercase tracking-wide">
            {languageLabel || 'TEXT'}
          </span>
          <span className="hidden sm:inline text-[11px] text-slate-500">
            支援多行輸入，會保留原始縮排與縮排空格。
          </span>
        </div>
        {toolbar && <div className="flex items-center gap-2">{toolbar}</div>}
      </div>
      <div className="relative flex max-h-[420px] overflow-hidden">
        <div
          ref={gutterRef}
          aria-hidden
          className="select-none border-r border-slate-800/60 bg-slate-950/95 px-3 py-2 text-right font-mono text-xs leading-5 text-slate-600"
        >
          {lines.map(lineNumber => (
            <div key={lineNumber} className="tabular-nums">
              {lineNumber}
            </div>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={event => onChange(event.target.value)}
          spellCheck={false}
          className="flex-1 resize-none bg-transparent px-4 py-2 font-mono text-sm leading-5 text-slate-100 outline-none"
          placeholder={placeholder}
          aria-label={ariaLabel}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
