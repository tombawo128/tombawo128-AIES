import React from 'react';
import { useApp } from '../../context/AppContext';
import { Icon } from '../Icon';

export const Header: React.FC<{ setOpen: (v: boolean) => void }> = ({ setOpen }) => {
  const { data, user, setData } = useApp();
  if (!user) return null;
  const unread = data.notifications.filter((n) => n.user_id === user.id && !n.read).length;

  const markAllRead = () => {
    if (unread === 0) return;
    setData({
      ...data,
      notifications: data.notifications.map((n) =>
        n.user_id === user.id ? { ...n, read: true } : n,
      ),
    });
  };

  return (
    <header>
      <button className="mobileMenu" onClick={() => setOpen(true)}>
        <Icon name="grid" />
      </button>
      <div className="headerRight">
        <button className="iconButton" onClick={markAllRead} title="Mark all as read">
          <Icon name="bell" />
          {unread > 0 && <span className="dot" />}
        </button>
        <div className="avatar">
          {user.name
            .split(' ')
            .map((x) => x[0])
            .slice(0, 2)
            .join('')}
        </div>
      </div>
    </header>
  );
};