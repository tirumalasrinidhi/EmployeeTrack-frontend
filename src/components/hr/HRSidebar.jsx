import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, FileBarChart, DollarSign,
  Download, LogOut, Building2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const HRSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/hr/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/hr/employees', icon: Users, label: 'Employee Records' },
    { to: '/hr/attendance-leave-reports', icon: FileBarChart, label: 'Attendance & Leave' },
    { to: '/hr/payroll-summary', icon: DollarSign, label: 'Payroll Summary' },
    { to: '/hr/reports', icon: Download, label: 'Generate Reports' },
  ];

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : 'HR';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
          <Building2 size={20} color="white" />
        </div>
        <h1>EmployeeTrack</h1>
        <p>HR Portal</p>
      </div>

      <div className="sidebar-user">
        <div className="avatar" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>{initials}</div>
        <div className="user-info">
          <h4>{user?.name || 'HR Manager'}</h4>
          <p>HR / Management</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <p className="nav-section-title">HR Operations</p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => window.dispatchEvent(new Event('close-mobile-sidebar'))}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <Icon className="nav-icon" size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item" onClick={handleLogout} style={{ color: '#f87171' }}>
          <LogOut className="nav-icon" size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default HRSidebar;
