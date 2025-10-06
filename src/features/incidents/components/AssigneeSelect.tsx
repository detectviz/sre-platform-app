import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { User } from '@/shared/types';
import Icon from '@/shared/components/Icon';
import UserAvatar from './UserAvatar';
import StatusTag from '@/shared/components/StatusTag';

interface AssigneeSelectProps {
  users: User[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  emptyMessage?: string;
}

const formatRoleLabel = (role?: string | null) => {
  if (!role) return '';
  return role
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const AssigneeSelect: React.FC<AssigneeSelectProps> = ({
  users,
  value,
  onChange,
  placeholder = '選擇工程師',
  disabled,
  loading,
  emptyMessage = '目前沒有可指派的成員',
}) => {
  const controlId = useId();
  const listboxId = `${controlId}-listbox`;
  const optionIdPrefix = `${controlId}-option`;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const normalizedValue = typeof value === 'string' ? value : '';

  const selectedUser = useMemo(
    () => users.find(user => user.id === normalizedValue) || null,
    [users, normalizedValue]
  );

  const selectedIndex = useMemo(
    () => users.findIndex(user => user.id === normalizedValue),
    [users, normalizedValue]
  );

  const isDisabled = disabled || (!!loading && users.length === 0);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(-1);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        closeDropdown();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeDropdown, isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (selectedIndex >= 0) {
        setActiveIndex(selectedIndex);
      } else if (users.length > 0) {
        setActiveIndex(0);
      }
    }
  }, [isOpen, selectedIndex, users.length]);

  const handleToggle = useCallback(() => {
    if (isDisabled) return;
    setIsOpen(prev => !prev);
  }, [isDisabled]);

  const handleSelect = useCallback(
    (userId: string) => {
      onChange(userId);
      closeDropdown();
    },
    [closeDropdown, onChange]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (isDisabled) return;

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          return;
        }

        setActiveIndex(prevIndex => {
          if (users.length === 0) return prevIndex;
          if (prevIndex < 0) {
            return event.key === 'ArrowDown' ? 0 : users.length - 1;
          }
          const delta = event.key === 'ArrowDown' ? 1 : -1;
          const nextIndex = (prevIndex + delta + users.length) % users.length;
          return nextIndex;
        });
        return;
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          return;
        }
        if (activeIndex >= 0 && activeIndex < users.length) {
          handleSelect(users[activeIndex].id);
        }
      }
    },
    [activeIndex, handleSelect, isDisabled, isOpen, users]
  );

  const renderButtonContent = () => {
    if (loading && users.length === 0) {
      return <span className="text-sm text-slate-400">載入成員中...</span>;
    }

    if (!selectedUser) {
      return <span className="text-sm text-slate-400">{placeholder}</span>;
    }

    return (
      <div className="flex items-center gap-3">
        <UserAvatar user={selectedUser} className="h-9 w-9" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-100">
            {selectedUser.name}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
            {selectedUser.team && (
              <StatusTag label={selectedUser.team} tone="info" dense />
            )}
            {selectedUser.role && (
              <StatusTag
                label={formatRoleLabel(selectedUser.role)}
                tone="neutral"
                dense
              />
            )}
            <StatusTag
              label={selectedUser.status === 'active' ? '啟用' : '停用'}
              tone={selectedUser.status === 'active' ? 'success' : 'danger'}
              dense
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        id={controlId}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={
          activeIndex >= 0 ? `${optionIdPrefix}-${users[activeIndex].id}` : undefined
        }
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className="flex w-full items-center justify-between rounded-md border border-slate-700 bg-slate-900/70 px-3 py-2 text-left text-sm text-white shadow-sm transition focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isDisabled}
      >
        <div className="min-w-0 flex-1">{renderButtonContent()}</div>
        <Icon
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          className="ml-3 h-4 w-4 shrink-0 text-slate-400"
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900/95 shadow-2xl backdrop-blur">
          {loading && users.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-slate-400">
              載入成員中...
            </div>
          ) : users.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-slate-400">
              {emptyMessage}
            </div>
          ) : (
            <ul
              id={listboxId}
              role="listbox"
              aria-labelledby={controlId}
              className="max-h-72 overflow-y-auto py-2"
            >
              {users.map((user, index) => {
                const isActiveOption = index === activeIndex;
                const isSelected = user.id === normalizedValue;
                return (
                  <li
                    key={user.id}
                    id={`${optionIdPrefix}-${user.id}`}
                    role="option"
                    aria-selected={isSelected}
                    className={`flex cursor-pointer items-start gap-3 px-4 py-3 transition focus:outline-none ${
                      isSelected
                        ? 'bg-sky-900/40 ring-1 ring-sky-500/60'
                        : isActiveOption
                        ? 'bg-slate-800/70'
                        : 'hover:bg-slate-800/50'
                    }`}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseDown={event => {
                      event.preventDefault();
                      handleSelect(user.id);
                    }}
                  >
                    <UserAvatar user={user} className="h-10 w-10" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-slate-100">
                          {user.name}
                        </p>
                        <StatusTag
                          label={user.status === 'active' ? '啟用' : '停用'}
                          tone={user.status === 'active' ? 'success' : 'danger'}
                          dense
                        />
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
                        {user.team && (
                          <StatusTag label={user.team} tone="info" dense />
                        )}
                        {user.role && (
                          <StatusTag
                            label={formatRoleLabel(user.role)}
                            tone="neutral"
                            dense
                          />
                        )}
                      </div>
                      {user.email && (
                        <p className="mt-1 truncate text-xs text-slate-400">
                          {user.email}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default AssigneeSelect;
