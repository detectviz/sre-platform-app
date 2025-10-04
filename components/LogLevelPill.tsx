import React from 'react';

type LogLevel = 'info' | 'warning' | 'error' | 'debug';

interface LogLevelPillProps {
  level: LogLevel;
}

const LEVEL_STYLES: Record<LogLevel, string> = {
    info: 'bg-sky-500/20 text-sky-300',
    warning: 'bg-yellow-500/20 text-yellow-300',
    error: 'bg-red-500/20 text-red-300',
    debug: 'bg-slate-500/20 text-slate-300',
};

const LEVEL_LABELS: Record<LogLevel, { label: string; tooltip: string }> = {
    info: { label: '資訊', tooltip: 'Info' },
    warning: { label: '警告', tooltip: 'Warning' },
    error: { label: '錯誤', tooltip: 'Error' },
    debug: { label: '除錯', tooltip: 'Debug' },
};

const LogLevelPill: React.FC<LogLevelPillProps> = ({ level }) => {
    const { label, tooltip } = LEVEL_LABELS[level] ?? LEVEL_LABELS.info;
    const styleClass = LEVEL_STYLES[level] ?? LEVEL_STYLES.info;

    return (
        <span
            className={`px-2 py-0.5 text-xs font-semibold rounded-full ${styleClass}`}
            title={`${label} (${tooltip})`}
            aria-label={`${label} (${tooltip})`}
        >
            {label}
        </span>
    );
};

export default LogLevelPill;
