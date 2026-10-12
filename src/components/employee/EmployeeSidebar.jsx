import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, User, Clock, Calendar, DollarSign, FileText,
  LogOut, Settings, Building2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const EmployeeSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/employee/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/employee/profile', icon: User, label: 'My Profile' },
    { to: '/employee/attendance', icon: Clock, label: 'Attendance' },
    { to: '/employee/leave', icon: Calendar, label: 'Leave' },
    { to: '/employee/salary', icon: DollarSign, label: 'Salary' },
    { to: '/employee/payslips', icon: FileText, label: 'Payslips' },
  ];

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : 'EM';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Building2 size={20} color="white" />
        </div>
        <h1>EmployeeTrack</h1>
        <p>Payroll Management System</p>
      </div>

      <div className="sidebar-user">
        <div className="avatar">{initials}</div>
        <div className="user-info">
          <h4>{user?.name || 'Employee'}</h4>
          <p>Employee</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <p className="nav-section-title">Main Menu</p>
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

export default EmployeeSidebar;
