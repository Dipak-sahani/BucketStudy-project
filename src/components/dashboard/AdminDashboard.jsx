import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Building, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  FileText,
  BarChart3,
  Clock
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEmployees } from '../../store/slices/employeeSlice';
import { fetchPayrolls } from '../../store/slices/payrollSlice';
import api from '../../services/api';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { employees } = useSelector((state) => state.employees);
  // console.log(employees);

  

  
  
  
  const { stats: payrollStats } = useSelector((state) => state.payroll);
  const [dashboardStats, setDashboardStats] = useState({
    totalEmployees: employees.length |0,
    activeEmployees:employees?.filter(item=>item.isActive==true).length |0,
    departments: 0,
    recentHires: 0,
    totalPayroll:0,
    avgSalary: 0,
    payrollProcessed: 0,
    pendingRequests: 0,
  });
  // console.log(dashboardStats.activeEmployees);
  
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const updateState=()=>{
    setDashboardStats({...dashboardStats,totalEmployees:employees.length,activeEmployees:employees?.filter(item=>item.isActive==true).length, totalPayroll:employees.reduce((a,c)=>{return a+c.salary},0)} )
  }

  const loadDashboardData = async () => {
    try {
      setLoading(true);
        console.log(dashboardStats);
      
      // Fetch employees
      const res=await dispatch(fetchEmployees({ limit: 100 }));
      console.log(res);
      if(res.payload.totalEmployees>0){
        console.log("runned");
        console.log(dashboardStats);
        updateState()
        
        console.log(dashboardStats);

      }
      
      // Fetch payroll data
      await dispatch(fetchPayrolls({ 
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      }));

      // Fetch recent employees
      const recentRes = await api.get(`${import.meta.env.VITE_EMPLOYEE}?limit=5&sort=-createdAt`);
      setRecentEmployees(recentRes.data.employees || []);

      // Calculate department stats
      const deptCount = {};
      employees.forEach(emp => {
        deptCount[emp.department] = (deptCount[emp.department] || 0) + 1;
      });
      
      const deptStats = Object.entries(deptCount).map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / employees.length) * 100)
      }));
      
      setDepartmentStats(deptStats);

      // Update dashboard stats
      const activeCount = employees.filter(emp => emp.isActive).length;
      const deptCounts = new Set(employees.map(emp => emp.department)).size;
      
      setDashboardStats({
        totalEmployees: employees.length,
        activeEmployees: activeCount,
        departments: deptCounts,
        recentHires: employees.filter(emp => {
          const joinDate = new Date(emp.dateOfJoining);
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return joinDate > monthAgo;
        }).length,
        totalPayroll: payrollStats.totalPayroll || 0,
        avgSalary: payrollStats.averageSalary || 0,
        payrollProcessed: payrollStats.totalBonuses || 0,
        pendingRequests: 3, // This could come from API
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Employees',
      value: dashboardStats.totalEmployees,
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+12%',
      changeType: 'increase',
      link: '/employees'
    },
    {
      title: 'Active Employees',
      value: dashboardStats.activeEmployees,
      icon: Users,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+5%',
      changeType: 'increase',
      link: '/employees?status=active'
    },
    {
      title: 'Total Payroll',
      value: `$${dashboardStats.totalPayroll.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+8.2%',
      changeType: 'increase',
      link: '/payroll'
    },
    {
      title: 'Departments',
      value: dashboardStats.departments,
      icon: Building,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: '+2',
      changeType: 'increase',
      link: '/departments'
    },
  ];

  const quickActions = [
    {
      title: 'Add New Employee',
      description: 'Create a new employee record',
      icon: UserPlus,
      link: '/employees/new',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Process Payroll',
      description: 'Run payroll for this month',
      icon: DollarSign,
      link: '/payroll/new',
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Generate Reports',
      description: 'Create detailed analytics reports',
      icon: BarChart3,
      link: '/reports',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'View Calendar',
      description: 'Check upcoming events and holidays',
      icon: Calendar,
      link: '#',
      color: 'bg-orange-100 text-orange-600'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Welcome back! Here's what's happening with your team today.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="card hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
                </div>
                <div className={`flex items-center text-sm font-medium ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.changeType === 'increase' ? (
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 mr-1" />
                  )}
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {stat.value}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Employees */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.link}
                    className="flex items-start p-4 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <div className={`p-3 rounded-lg ${action.color}`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900">
                        {action.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        {action.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Employees */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Employees</h2>
              <Link
                to="/employees"
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                View all
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Join Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {employees.map((employee) => (
                    <tr key={employee._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-primary-600 font-semibold">
                              {employee.firstName?.[0]}{employee.lastName?.[0]}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {employee.firstName} {employee.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {employee.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{employee.department}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{employee.position}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${employee.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'}`}>
                          {employee.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(employee.dateOfJoining).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Department Distribution */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Department Distribution</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {departmentStats.map((dept, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{dept.name}</span>
                      <span className="text-gray-600">{dept.count} employees</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${dept.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total across all departments</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {dashboardStats.totalEmployees}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Payroll Processing</p>
                      <p className="text-xs text-gray-500">Due in 3 days</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <Users className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Team Meeting</p>
                      <p className="text-xs text-gray-500">Tomorrow, 2:00 PM</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Scheduled
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Performance Reviews</p>
                      <p className="text-xs text-gray-500">Starts next week</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Ready
                  </span>
                </div>
              </div>
              <div className="mt-6">
                <button className="w-full btn-primary">
                  View All Tasks
                </button>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">API Status</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Database</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Storage</span>
                  <span className="text-sm text-gray-600">65% used</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Uptime</span>
                  <span className="text-sm text-gray-600">99.8%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;