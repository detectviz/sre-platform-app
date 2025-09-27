import React from 'react';
import { User } from '../types';
import Icon from './Icon';

interface UserAvatarProps {
  user: Partial<User> | null;
  className?: string;
  iconClassName?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user, className = 'w-8 h-8', iconClassName = 'w-5 h-5' }) => {
  return (
    <div className={`${className} rounded-full bg-slate-700 flex items-center justify-center shrink-0`}>
      <Icon name="user" className={`${iconClassName} text-slate-300`} />
    </div>
  );
};

export default UserAvatar;