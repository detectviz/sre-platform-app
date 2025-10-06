import React from 'react';

interface JsonViewerProps {
  data: object;
}

const JsonViewer: React.FC<JsonViewerProps> = ({ data }) => {
    const jsonString = JSON.stringify(data, null, 2);

    const syntaxHighlight = (json: string) => {
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
            let cls = 'text-green-400'; // number
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'text-sky-400'; // key
                } else {
                    cls = 'text-amber-400'; // string
                }
            } else if (/true|false/.test(match)) {
                cls = 'text-purple-400'; // boolean
            } else if (/null/.test(match)) {
                cls = 'text-slate-500'; // null
            }
            return `<span class="${cls}">${match}</span>`;
        });
    };

    return (
        <pre className="bg-slate-900/70 p-4 rounded-b-lg text-xs font-mono overflow-x-auto"
             dangerouslySetInnerHTML={{ __html: syntaxHighlight(jsonString) }} />
    );
};

export default JsonViewer;
