import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, Clock, Calendar,
  DollarSign, FileText, BarChart2, LogOut, Settings
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/departments', icon: Building2, label: 'Departments' },
    { to: '/admin/employees', icon: Users, label: 'Employees' },
    { to: '/admin/attendance', icon: Clock, label: 'Attendance' },
    { to: '/admin/leaves', icon: Calendar, label: 'Leave Approvals' },
    { to: '/admin/payroll', icon: DollarSign, label: 'Payroll' },
    { to: '/admin/payslips', icon: FileText, label: 'Payslips' },
    { to: '/admin/reports', icon: BarChart2, label: 'Payroll Reports' },
  ];

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) : 'AD';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <Building2 size={20} color="white" />
        </div>
        <h1>EmployeeTrack</h1>
        <p>Admin Panel</p>
      </div>

      <div className="sidebar-user">
        <div className="avatar" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>{initials}</div>
        <div className="user-info">
          <h4>{user?.name || 'Administrator'}</h4>
          <p>Admin</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <p className="nav-section-title">Administration</p>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
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

export default AdminSidebar;
