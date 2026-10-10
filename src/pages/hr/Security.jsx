import React from 'react';
import { Shield, Lock, Eye, Key, Database, CheckCircle } from 'lucide-react';
import HRSidebar from '../../components/hr/HRSidebar';
import TopNav from '../../components/common/TopNav';

const HRSecurity = () => {
  const policies = [
    {
      icon: Lock,
      title: 'Password Policy',
      color: '#3b82f6',
      bg: '#dbeafe',
      items: [
        'Minimum 6 characters required',
        'BCrypt hashing (strength 10) applied to all passwords',
        'Passwords are never stored in plain text',
        'Passwords are never returned in API responses',
      ]
    },
    {
      icon: Key,
      title: 'JWT Authentication',
      color: '#10b981',
      bg: '#d1fae5',
      items: [
        'JWT tokens expire after 24 hours',
        'HS256 signing algorithm used',
        'Token stored securely in localStorage',
        'Authorization header: Bearer <token>',
      ]
    },
    {
      icon: Eye,
      title: 'Role-Based Access Control',
      color: '#f59e0b',
      bg: '#fef3c7',
      items: [
        'EMPLOYEE: Can only access own data',
        'ADMIN: Full system access',
        'HR: Read-only reports and records',
        'Backend enforces authorization on every endpoint',
      ]
    },
    {
      icon: Database,
      title: 'Data Security',
      color: '#8b5cf6',
      bg: '#ede9fe',
      items: [
        'MySQL database with secure connection',
        'JPA/Hibernate prevents SQL injection',
        'CORS configured for frontend origin only',
        'Bank details access restricted',
        'Input validation on all API endpoints',
      ]
    },
  ];

  return (
    <div className="app-layout">
      <HRSidebar />
      <div className="main-content">
        <TopNav title="Data Security" />
        <div className="page-content">
          <div className="page-header">
            <div><h2>Data Security</h2><p>Security policies and compliance information</p></div>
            <span className="badge badge-success"><Shield size={12} /> Secured</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
            {policies.map(({ icon: Icon, title, color, bg, items }) => (
              <div className="card" key={title}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={22} color={color} />
                  </div>
                  <h3 style={{ fontWeight: 700, color: '#1e293b' }}>{title}</h3>
                </div>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {items.map(item => (
                    <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                      <CheckCircle size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ fontSize: '13px', color: '#475569' }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="card" style={{ marginTop: '20px', background: 'linear-gradient(135deg, #0f3460, #1a4f8a)', border: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Shield size={32} color="white" />
              <div>
                <h3 style={{ color: 'white', fontWeight: 700, marginBottom: '4px' }}>EmployeeTrack Security Status</h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                  All security measures are active. The system uses industry-standard encryption, JWT authentication, and role-based access control to protect sensitive employee and payroll data.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRSecurity;
