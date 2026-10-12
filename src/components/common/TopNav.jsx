import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, User, X } from 'lucide-react';

const TopNav = ({ title }) => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const closeMenu = () => setMobileMenuOpen(false);
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') closeMenu();
    };

    window.addEventListener('close-mobile-sidebar', closeMenu);
    window.addEventListener('keydown', closeOnEscape);
    document.body.classList.toggle('mobile-sidebar-open', mobileMenuOpen);

    return () => {
      window.removeEventListener('close-mobile-sidebar', closeMenu);
      window.removeEventListener('keydown', closeOnEscape);
      document.body.classList.remove('mobile-sidebar-open');
    };
  }, [mobileMenuOpen]);

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
      <div className="topnav-heading">
        <button
          type="button"
          className="mobile-menu-button"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <h2 className="topnav-title">{title}</h2>
      </div>
      <div className="topnav-actions">
        <span className={`topnav-badge ${roleBadgeClass[user?.role] || ''}`}>
          <User size={12} />
          {roleLabel[user?.role] || user?.role}
        </span>
        <span className="topnav-badge">
          {user?.name}
        </span>
      </div>
      {mobileMenuOpen && (
        <button
          type="button"
          className="mobile-sidebar-backdrop"
          aria-label="Close navigation menu"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default TopNav;
