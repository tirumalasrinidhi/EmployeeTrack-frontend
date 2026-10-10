import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Employee Pages
import EmployeeDashboard from './pages/employee/Dashboard';
import EmployeeProfile from './pages/employee/Profile';
import EmployeeAttendance from './pages/employee/Attendance';
import EmployeeLeave from './pages/employee/Leave';
import EmployeeSalary from './pages/employee/Salary';
import EmployeePayslips from './pages/employee/Payslips';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminDepartments from './pages/admin/Departments';
import AdminEmployees from './pages/admin/Employees';
import AdminAttendance from './pages/admin/Attendance';
import AdminLeaves from './pages/admin/Leaves';
import AdminPayroll from './pages/admin/Payroll';
import AdminPayslips from './pages/admin/Payslips';
import AdminReports from './pages/admin/Reports';

// HR Pages
import HRDashboard from './pages/hr/Dashboard';
import HREmployees from './pages/hr/Employees';
import HRAttendanceLeaveReports from './pages/hr/AttendanceLeaveReports';
import HRPayrollSummary from './pages/hr/PayrollSummary';
import HRReports from './pages/hr/Reports';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Employee Routes */}
          <Route path="/employee/dashboard" element={
            <ProtectedRoute allowedRoles={['EMPLOYEE']}>
              <EmployeeDashboard />
            </ProtectedRoute>
          } />
          <Route path="/employee/profile" element={
            <ProtectedRoute allowedRoles={['EMPLOYEE']}>
              <EmployeeProfile />
            </ProtectedRoute>
          } />
          <Route path="/employee/attendance" element={
            <ProtectedRoute allowedRoles={['EMPLOYEE']}>
              <EmployeeAttendance />
            </ProtectedRoute>
          } />
          <Route path="/employee/leave" element={
            <ProtectedRoute allowedRoles={['EMPLOYEE']}>
              <EmployeeLeave />
            </ProtectedRoute>
          } />
          <Route path="/employee/salary" element={
            <ProtectedRoute allowedRoles={['EMPLOYEE']}>
              <EmployeeSalary />
            </ProtectedRoute>
          } />
          <Route path="/employee/payslips" element={
            <ProtectedRoute allowedRoles={['EMPLOYEE']}>
              <EmployeePayslips />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/departments" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDepartments />
            </ProtectedRoute>
          } />
          <Route path="/admin/employees" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminEmployees />
            </ProtectedRoute>
          } />
          <Route path="/admin/attendance" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminAttendance />
            </ProtectedRoute>
          } />
          <Route path="/admin/leaves" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminLeaves />
            </ProtectedRoute>
          } />
          <Route path="/admin/payroll" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminPayroll />
            </ProtectedRoute>
          } />
          <Route path="/admin/payslips" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminPayslips />
            </ProtectedRoute>
          } />
          <Route path="/admin/reports" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminReports />
            </ProtectedRoute>
          } />

          {/* HR Routes */}
          <Route path="/hr/dashboard" element={
            <ProtectedRoute allowedRoles={['HR']}>
              <HRDashboard />
            </ProtectedRoute>
          } />
          <Route path="/hr/employees" element={
            <ProtectedRoute allowedRoles={['HR']}>
              <HREmployees />
            </ProtectedRoute>
          } />
          <Route path="/hr/attendance-leave-reports" element={
            <ProtectedRoute allowedRoles={['HR']}>
              <HRAttendanceLeaveReports />
            </ProtectedRoute>
          } />
          <Route path="/hr/payroll-summary" element={
            <ProtectedRoute allowedRoles={['HR']}>
              <HRPayrollSummary />
            </ProtectedRoute>
          } />
          <Route path="/hr/reports" element={
            <ProtectedRoute allowedRoles={['HR']}>
              <HRReports />
            </ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
