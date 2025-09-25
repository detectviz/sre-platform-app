import React from 'react';

type LogLevel = 'info' | 'warning' | 'error' | 'debug';

interface LogLevelPillProps {
  level: LogLevel;
}

const LogLevelPill: React.FC<LogLevelPillProps> = ({ level }) => {
    const levelStyles: Record<LogLevel, string> = {
        info: 'bg-sky-500/20 text-sky-300',
        warning: 'bg-yellow-500/20 text-yellow-300',
        error: 'bg-red-500/20 text-red-300',
        debug: 'bg-slate-500/20 text-slate-300',
    };
    
    return (
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize ${levelStyles[level] || levelStyles.debug}`}>
            {level}
        </span>
    );
};

export default LogLevelPill;
