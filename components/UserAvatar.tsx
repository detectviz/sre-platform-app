import React from 'react';
import { User } from '../types';
import Icon from './Icon';

interface UserAvatarProps {
  user: Partial<User> | null;
  className?: string;
  iconClassName?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user, className = 'w-8 h-8', iconClassName = 'w-5 h-5' }) => {
  const getInitials = (name?: string): string => {
    if (!name) return '';
    const nameParts = name.trim().split(' ').filter(Boolean);
    if (nameParts.length > 1) {
      return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    }
    if (nameParts.length === 1 && nameParts[0].length > 1) {
      return nameParts[0].substring(0, 2).toUpperCase();
    }
    return '';
  };

  const initials = getInitials(user?.name);
  const widthClass = className.split(' ').find(c => c.startsWith('w-'));
  const size = widthClass ? parseInt(widthClass.split('-')[1]) : 8;
  const fontSize = `calc(${size} / 2.5 * 0.25rem)`;

  return (
    <div title={user?.name} className={`${className} rounded-full bg-slate-700 flex items-center justify-center shrink-0 font-semibold text-slate-300`}>
      {initials ? (
        <span style={{ fontSize }}>{initials}</span>
      ) : (
        <Icon name="user" className={`${iconClassName}`} />
      )}
    </div>
  );
};

export default UserAvatar;