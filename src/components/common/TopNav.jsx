import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, User } from 'lucide-react';

const TopNav = ({ title }) => {
  const { user } = useAuth();

  const roleLabel = {
    ADMIN: 'Administrator',
    HR: 'HR Manager',
    EMPLOYEE: 'Employee',
  };

  const roleBadgeClass = {
    ADMIN: 'role-admin',
    HR: 'role-hr',
    EMPLOYEE: 'role-employee',
  };

  return (
    <header className="topnav">
      <h2 className="topnav-title">{title}</h2>
      <div className="topnav-actions">
        <span className={`topnav-badge ${roleBadgeClass[user?.role] || ''}`}>
          <User size={12} />
          {roleLabel[user?.role] || user?.role}
        </span>
        <span className="topnav-badge">
          {user?.name}
        </span>
      </div>
    </header>
  );
};

export default TopNav;
