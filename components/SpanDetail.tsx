import React from 'react';
import { Span } from '../types';
import JsonViewer from './JsonViewer';
import FormRow from './FormRow';

interface SpanDetailProps {
  span: Span | null;
}

const SpanDetail: React.FC<SpanDetailProps> = ({ span }) => {
  if (!span) {
    return (
      <div className="p-6 text-center text-slate-400">
        在時間軸上選擇一個 Span 以查看其詳細資訊。
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 rounded-lg p-4">
      <h3 className="text-lg font-bold text-white mb-4">Span Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <FormRow label="Service Name"><p className="font-mono text-sm">{span.serviceName}</p></FormRow>
        <FormRow label="Operation Name"><p className="font-mono text-sm">{span.operationName}</p></FormRow>
        <FormRow label="Duration"><p className="font-mono text-sm">{span.duration}ms</p></FormRow>
        <FormRow label="Status"><p className="font-mono text-sm capitalize">{span.status}</p></FormRow>
        <FormRow label="Span ID"><p className="font-mono text-xs">{span.spanId}</p></FormRow>
        <FormRow label="Parent ID"><p className="font-mono text-xs">{span.parentId || 'N/A'}</p></FormRow>
      </div>
      
      <div>
        <h4 className="font-semibold text-slate-300 mb-2">Tags</h4>
        <JsonViewer data={span.tags} />
      </div>
      
      {span.logs.length > 0 && (
        <div className="mt-4">
            <h4 className="font-semibold text-slate-300 mb-2">Logs</h4>
            <JsonViewer data={span.logs} />
        </div>
      )}
    </div>
  );
};

export default SpanDetail;