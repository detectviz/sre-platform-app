import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/shared/components/Icon';
import { KeyValueTag } from '@/shared/types';

interface TagListProps {
  tags: KeyValueTag[] | Record<string, string>;
  maxVisible?: number;
  readonlyKeys?: string[]; // 唯讀標籤的 key 列表
  linkMapping?: Record<string, (value: string, entityId?: string) => string>; // 標籤 key 對應的連結生成函數
}

/**
 * 通用標籤顯示元件
 * - 支援限制顯示數量，可展開查看全部
 * - 支援唯讀標籤的跳轉連結
 * - 自動處理 KeyValueTag[] 和 Record<string, string> 兩種格式
 */
export const TagList: React.FC<TagListProps> = ({
  tags,
  maxVisible = 5,
  readonlyKeys = [],
  linkMapping = {},
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // 統一轉換為 { key, value, id }[] 格式
  const tagArray: KeyValueTag[] = Array.isArray(tags)
    ? tags
    : Object.entries(tags).map(([key, value]) => ({
        id: `${key}-${value}`,
        key,
        value,
      }));

  const visibleTags = isExpanded ? tagArray : tagArray.slice(0, maxVisible);
  const hasMore = tagArray.length > maxVisible;

  const renderTag = (tag: KeyValueTag) => {
    const isReadonly = readonlyKeys.includes(tag.key);
    const linkGenerator = linkMapping[tag.key];

    const tagContent = (
      <span
        className={`inline-flex items-center px-2 py-1 text-xs rounded-md ${
          isReadonly
            ? 'bg-slate-700/50 border border-slate-600 text-slate-300'
            : 'bg-slate-800/60 border border-slate-700 text-slate-200'
        }`}
      >
        <span className="font-medium">{tag.key}:</span>
        <span className="ml-1">{tag.value}</span>
        {isReadonly && (
          <Icon name="lock" className="ml-1.5 w-3 h-3 text-slate-400" />
        )}
      </span>
    );

    // 如果是唯讀且有連結，包裹在 Link 中
    if (isReadonly && linkGenerator) {
      const linkPath = linkGenerator(tag.value, tag.id);
      return (
        <Link key={tag.id} to={linkPath} className="hover:opacity-80 transition-opacity">
          {tagContent}
        </Link>
      );
    }

    return <span key={tag.id}>{tagContent}</span>;
  };

  if (tagArray.length === 0) {
    return <span className="text-xs text-slate-500">無標籤</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visibleTags.map(renderTag)}
      {hasMore && !isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="inline-flex items-center px-2 py-1 text-xs rounded-md bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
        >
          <Icon name="more-horizontal" className="w-3 h-3 mr-1" />
          +{tagArray.length - maxVisible}
        </button>
      )}
      {isExpanded && hasMore && (
        <button
          onClick={() => setIsExpanded(false)}
          className="inline-flex items-center px-2 py-1 text-xs rounded-md bg-slate-700/50 border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
        >
          <Icon name="chevron-up" className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};