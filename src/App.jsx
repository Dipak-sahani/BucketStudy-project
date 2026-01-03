import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { useSelector } from 'react-redux';
import store from './store/store';

// Layout Components
import Layout from './components/layout/Layout';
import PrivateRoute from './components/layout/PrivateRoute';

// Auth Components
import Login from './components/auth/Login';
// import ForgotPassword from './components/auth/ForgotPassword';
import AuthPage from './components/auth/Auth';
// Dashboard Components
import AdminDashboard from './components/dashboard/AdminDashboard';
import EmployeeDashboard from './components/dashboard/EmployeeDashboard';

// Employee Components
import EmployeeList from './components/employees/EmployeeList';
import EmployeeForm from './components/employees/EmployeeForm';
import EmployeeDetail from './components/employees/EmployeeDetail';
// import EmployeeProfile from './components/employees/EmployeeProfile';

// Payroll Components (Bonus Feature)
import PayrollDashboard from './components/payroll/PayrollDashboard';
import PayrollForm from './components/payroll/PayrollForm';

// Department Components
// import DepartmentList from './components/departments/DepartmentList';

// Settings Components
// import Settings from './components/settings/Settings';

// Common Components
// import NotFound from './components/common/NotFound';
import Unauthorized from './components/common/Unauthorized';

// Custom hook for authentication
const useAuth = () => {
  return useSelector((state) => state.auth);
};

// Route Wrapper Component
const RoleBasedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Unauthorized />;
  }

  return typeof children === "function"
    ? children({ user })
    : children;
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/auth" element={<AuthPage />} />
            {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected Routes */}
            <Route path="/" element={
              <RoleBasedRoute roles={['admin', 'employee']}>
                <Layout />
              </RoleBasedRoute>
            }>
              {/* Dashboard */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={
                <RoleBasedRoute roles={['admin', 'employee']}>
                  {({ user }) => (
                    user.role === 'admin' ? <AdminDashboard /> : <EmployeeDashboard />
                  )}
                </RoleBasedRoute>
              } />

              {/* Employee Management (Admin Only) */}
              <Route path="employees" element={
                <RoleBasedRoute roles={['admin']}>
                  <EmployeeList />
                </RoleBasedRoute>
              } />
              <Route path="employees/new" element={
                <RoleBasedRoute roles={['admin']}>
                  <EmployeeForm />
                </RoleBasedRoute>
              } />
              <Route path="employees/:id" element={
                <RoleBasedRoute roles={['admin']}>
                  <EmployeeDetail />
                </RoleBasedRoute>
              } />
              <Route path="employees/:id/edit" element={
                <RoleBasedRoute roles={['admin']}>
                  <EmployeeForm />
                </RoleBasedRoute>
              } />

              {/* Employee Profile (Both Admin and Employee) */}
              {/* <Route path="profile" element={
                <RoleBasedRoute roles={['admin', 'employee']}>
                  <EmployeeProfile />
                </RoleBasedRoute>
              } /> */}
              <Route path="profile/edit" element={
                <RoleBasedRoute roles={['admin', 'employee']}>
                  <EmployeeForm isProfileEdit />
                </RoleBasedRoute>
              } />

              

              {/* Payroll Management (Bonus Feature - Admin Only) */}
              <Route path="payroll" element={
                <RoleBasedRoute roles={['admin']}>
                  <PayrollDashboard />
                </RoleBasedRoute>
              } />
              <Route path="payroll/new" element={
                <RoleBasedRoute roles={['admin']}>
                  <PayrollForm />
                </RoleBasedRoute>
              } />
              <Route path="payroll/:id" element={
                <RoleBasedRoute roles={['admin']}>
                  <PayrollForm />
                </RoleBasedRoute>
              } />

              {/* Reports (Admin Only) */}
              <Route path="reports" element={
                <RoleBasedRoute roles={['admin']}>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
                    <p className="mt-2 text-gray-600">Coming soon...</p>
                  </div>
                </RoleBasedRoute>
              } />

              {/* Settings */}
              {/* <Route path="settings" element={
                <RoleBasedRoute roles={['admin']}>
                  <Settings />
                </RoleBasedRoute>
              } /> */}
            </Route>

            {/* 404 Route */}
            {/* <Route path="*" element={<NotFound />} /> */}
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;