
import React, { useMemo } from 'react';
import Icon from '@/shared/components/Icon';
import StatusTag from '@/shared/components/StatusTag';
import { useContent } from '@/contexts/ContentContext';

const LicensePage: React.FC = () => {
  const { content } = useContent();
  const pageContent = content?.LICENSE_PAGE;

  if (!pageContent) {
    return (
        <div className="flex items-center justify-center h-full">
            <Icon name="loader-circle" className="w-8 h-8 animate-spin text-slate-500" />
        </div>
    );
  }

  const communityHighlights = useMemo<string[]>(() => {
    const contentWithHighlights = pageContent as typeof pageContent & { COMMUNITY_FEATURES?: string[] };
    return contentWithHighlights.COMMUNITY_FEATURES ?? [
      '核心監控與事件列表',
      '靜音規則與資源拓撲視圖',
      '自動化腳本與通知策略（標準配額）',
    ];
  }, [pageContent]);

  const comparisonRows = useMemo(() => (
    pageContent.FEATURES_LIST.map((feature: string, index: number) => ({ id: `feature-${index}`, label: feature }))
  ), [pageContent.FEATURES_LIST]);

  return (
    <div className="max-w-5xl space-y-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-lg shadow-slate-950/40">
        <div className="flex flex-col items-center gap-4 text-center">
          <StatusTag tone="info" icon="sparkles" label="社群版" />
          <Icon name="award" className="w-16 h-16 text-amber-400" />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">{pageContent.TITLE}</h2>
            <p className="text-sm text-slate-300 max-w-2xl">{pageContent.DESCRIPTION}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-5">
            <div className="flex items-center gap-2 text-slate-200">
              <Icon name="shield-check" className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-semibold">社群版可用功能</h3>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              {communityHighlights.map((feature, index) => (
                <li key={`community-${index}`} className="flex items-center gap-2">
                  <Icon name="check" className="w-4 h-4 text-emerald-400" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-amber-500/50 bg-amber-500/10 p-5">
            <div className="flex items-center gap-2 text-amber-200">
              <Icon name="zap" className="w-5 h-5" />
              <h3 className="text-sm font-semibold">{pageContent.COMMERCIAL_FEATURES_TITLE}</h3>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-amber-100">
              {pageContent.FEATURES_LIST.map((feature: string, index: number) => (
                <li key={`commercial-${index}`} className="flex items-center gap-2">
                  <Icon name="star" className="w-4 h-4 text-amber-300" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-xl border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800 text-sm text-left">
            <thead className="bg-slate-950/60 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">功能項目</th>
                <th className="px-4 py-3 font-semibold text-center">社群版</th>
                <th className="px-4 py-3 font-semibold text-center">商業版</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-slate-950/30">
              {comparisonRows.map(row => (
                <tr key={row.id}>
                  <td className="px-4 py-3 text-slate-200">{row.label}</td>
                  <td className="px-4 py-3 text-center text-slate-500">
                    <Icon name="minus" className="inline-block h-4 w-4" />
                  </td>
                  <td className="px-4 py-3 text-center text-emerald-400">
                    <Icon name="check-circle" className="inline-block h-4 w-4" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 text-center">
          <p className="text-xs text-slate-400">想要進階 AI 洞察、企業級支援或更長的保留週期？立即與我們聯繫。</p>
          <a
            href={`mailto:${pageContent.CONTACT_EMAIL}`}
            className="inline-flex items-center gap-2 rounded-lg border border-sky-500/50 px-4 py-2 text-sm font-medium text-sky-200 hover:bg-sky-500/20"
          >
            <Icon name="mail" className="w-4 h-4" />
            {pageContent.CONTACT_LINK}
          </a>
        </div>
      </div>
    </div>
  );
};

export default LicensePage;
