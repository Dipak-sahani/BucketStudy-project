import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  DollarSign,
  Calendar,
  MapPin,
  Award,
  Users,
  GraduationCap,
  Shield,
  Clock,
  Edit2,
  ArrowLeft,
  Trash2,
  Download,
  Printer,
  Share2,
  Star,
  CheckCircle,
  XCircle,
  Activity,
  Target,
  Heart,
  FileText,
  Globe,
  Linkedin,
  Github,
  Twitter
} from 'lucide-react';
import { format, differenceInYears, parseISO } from 'date-fns';
import { fetchEmployeeById, deleteEmployee } from '../../store/slices/employeeSlice';
import api from '../../services/api';

const EmployeeDetail = ({ isProfile = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentEmployee, loading } = useSelector((state) => state.employees);
  const { user } = useSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [payrollData, setPayrollData] = useState([]);
  const [loadingPayroll, setLoadingPayroll] = useState(false);

  const employeeId = isProfile ? user?.employeeDetails?._id : id;

  useEffect(() => {
    if (employeeId) {
      dispatch(fetchEmployeeById(employeeId));
      fetchPayrollData();
    }
  }, [employeeId, dispatch]);

  const fetchPayrollData = async () => {
    if (!employeeId) return;
    
    try {
      setLoadingPayroll(true);
      const response = await api.get('/payroll', {
        params: { employee: employeeId, limit: 6, sort: '-createdAt' }
      });
      setPayrollData(response.data.payrolls || []);
    } catch (error) {
      console.error('Error fetching payroll data:', error);
    } finally {
      setLoadingPayroll(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${currentEmployee?.firstName} ${currentEmployee?.lastName}? This action cannot be undone.`)) {
      try {
        await dispatch(deleteEmployee(employeeId));
        navigate('/employees');
      } catch (error) {
        console.error('Error deleting employee:', error);
      }
    }
  };

  const calculateYearsOfService = () => {
    if (!currentEmployee?.dateOfJoining) return 0;
    const joinDate = parseISO(currentEmployee.dateOfJoining);
    return differenceInYears(new Date(), joinDate);
  };

  const calculateAge = () => {
    if (!currentEmployee?.dateOfBirth) return 'N/A';
    const birthDate = parseISO(currentEmployee.dateOfBirth);
    return differenceInYears(new Date(), birthDate);
  };

  const getPerformanceColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600 bg-green-100';
    if (rating >= 3.5) return 'text-blue-600 bg-blue-100';
    if (rating >= 2.5) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'employment', label: 'Employment', icon: Briefcase },
    { id: 'payroll', label: 'Payroll', icon: DollarSign },
    { id: 'documents', label: 'Documents', icon: FileText },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!currentEmployee) {
    return (
      <div className="text-center py-12">
        <User className="h-16 w-16 text-gray-400 mx-auto" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">Employee not found</h3>
        <p className="mt-2 text-gray-600">The employee you're looking for doesn't exist or has been removed.</p>
        <div className="mt-6">
          <Link to="/employees" className="btn-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Employees
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center">
            <Link 
              to={isProfile ? "/dashboard" : "/employees"}
              className="mr-3 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isProfile ? 'My Profile' : `${currentEmployee.firstName} ${currentEmployee.lastName}`}
              </h1>
              <p className="mt-1 text-gray-600">
                {isProfile ? 'View and manage your profile' : 'Employee details and information'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
          {!isProfile && user?.role === 'admin' && (
            <>
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-4 py-2 border border-red-300 text-red-700 bg-white hover:bg-red-50 rounded-lg text-sm font-medium"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
              <Link
                to={`/employees/${currentEmployee._id}/edit`}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Employee
              </Link>
            </>
          )}
          
          {isProfile && (
            <Link
              to="/profile/edit"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Edit Profile
            </Link>
          )}
          
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg text-sm font-medium">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </button>
          
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg text-sm font-medium">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Profile Card */}
        <div className="lg:col-span-1">
          <div className="card sticky top-6">
            {/* Profile Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="h-32 w-32 rounded-full bg-linear-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
                    <User className="h-16 w-16 text-white" />
                  </div>
                  <div className={`absolute bottom-3 right-3 h-6 w-6 rounded-full border-2 border-white flex items-center justify-center
                    ${currentEmployee.isActive ? 'bg-green-500' : 'bg-red-500'}`}>
                    {currentEmployee.isActive ? (
                      <CheckCircle className="h-3 w-3 text-white" />
                    ) : (
                      <XCircle className="h-3 w-3 text-white" />
                    )}
                  </div>
                </div>
                
                <h2 className="mt-4 text-xl font-bold text-gray-900">
                  {currentEmployee.firstName} {currentEmployee.lastName}
                </h2>
                <p className="text-gray-600">{currentEmployee.position}</p>
                
                <div className="mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                    ${currentEmployee.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'}`}>
                    {currentEmployee.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Years of Service</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {calculateYearsOfService()} years
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Activity className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Performance</p>
                      <div className="flex items-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPerformanceColor(4.2)}`}>
                          4.2/5.0
                        </span>
                        <Star className="h-4 w-4 text-yellow-500 ml-2" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Target className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Attendance</p>
                      <p className="text-lg font-semibold text-gray-900">98%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="p-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Mail className="h-4 w-4 text-gray-400 mr-3" />
                  <a 
                    href={`mailto:${currentEmployee.email}`}
                    className="text-gray-600 hover:text-primary-600"
                  >
                    {currentEmployee.email}
                  </a>
                </div>
                <div className="flex items-center text-sm">
                  <Phone className="h-4 w-4 text-gray-400 mr-3" />
                  <a 
                    href={`tel:${currentEmployee.phone}`}
                    className="text-gray-600 hover:text-primary-600"
                  >
                    {currentEmployee.phone}
                  </a>
                </div>
                {currentEmployee.address?.city && (
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-gray-600">
                      {currentEmployee.address.city}, {currentEmployee.address.state}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Social Links */}
            <div className="p-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Social Links</h3>
              <div className="flex space-x-3">
                <button className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">
                  <Linkedin className="h-5 w-5" />
                </button>
                <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                  <Github className="h-5 w-5" />
                </button>
                <button className="p-2 bg-sky-100 text-sky-600 rounded-lg hover:bg-sky-200">
                  <Twitter className="h-5 w-5" />
                </button>
                <button className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
                  <Globe className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Tabs Navigation */}
          <div className="card">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex items-center py-4 px-1 border-b-2 font-medium text-sm
                        ${activeTab === tab.id
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                {/* Key Information */}
                <div className="card">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Key Information</h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-700 mb-2">Personal Details</h3>
                          <dl className="space-y-2">
                            <div className="flex justify-between">
                              <dt className="text-sm text-gray-600">Employee ID</dt>
                              <dd className="text-sm font-medium text-gray-900">{currentEmployee.employeeId}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-sm text-gray-600">Full Name</dt>
                              <dd className="text-sm font-medium text-gray-900">
                                {currentEmployee.firstName} {currentEmployee.lastName}
                              </dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-sm text-gray-600">Date of Birth</dt>
                              <dd className="text-sm font-medium text-gray-900">
                                {currentEmployee.dateOfBirth 
                                  ? format(parseISO(currentEmployee.dateOfBirth), 'MMM d, yyyy')
                                  : 'N/A'
                                } ({calculateAge()} years)
                              </dd>
                            </div>
                          </dl>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-700 mb-2">Contact Information</h3>
                          <dl className="space-y-2">
                            <div className="flex justify-between">
                              <dt className="text-sm text-gray-600">Email</dt>
                              <dd className="text-sm font-medium text-gray-900">{currentEmployee.email}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-sm text-gray-600">Phone</dt>
                              <dd className="text-sm font-medium text-gray-900">{currentEmployee.phone}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-sm text-gray-600">Address</dt>
                              <dd className="text-sm font-medium text-gray-900">
                                {currentEmployee.address 
                                  ? `${currentEmployee.address.street}, ${currentEmployee.address.city}, ${currentEmployee.address.state} ${currentEmployee.address.zipCode}`
                                  : 'N/A'
                                }
                              </dd>
                            </div>
                          </dl>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-700 mb-2">Employment Details</h3>
                          <dl className="space-y-2">
                            <div className="flex justify-between">
                              <dt className="text-sm text-gray-600">Department</dt>
                              <dd className="text-sm font-medium text-gray-900">{currentEmployee.department}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-sm text-gray-600">Position</dt>
                              <dd className="text-sm font-medium text-gray-900">{currentEmployee.position}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-sm text-gray-600">Date of Joining</dt>
                              <dd className="text-sm font-medium text-gray-900">
                                {currentEmployee.dateOfJoining 
                                  ? format(parseISO(currentEmployee.dateOfJoining), 'MMM d, yyyy')
                                  : 'N/A'
                                }
                              </dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-sm text-gray-600">Salary</dt>
                              <dd className="text-sm font-medium text-gray-900">
                                ${currentEmployee.salary?.toLocaleString()}/month
                              </dd>
                            </div>
                          </dl>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-700 mb-2">Emergency Contact</h3>
                          <dl className="space-y-2">
                            <div className="flex justify-between">
                              <dt className="text-sm text-gray-600">Name</dt>
                              <dd className="text-sm font-medium text-gray-900">
                                {currentEmployee.emergencyContact?.name || 'N/A'}
                              </dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-sm text-gray-600">Relationship</dt>
                              <dd className="text-sm font-medium text-gray-900">
                                {currentEmployee.emergencyContact?.relationship || 'N/A'}
                              </dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-sm text-gray-600">Phone</dt>
                              <dd className="text-sm font-medium text-gray-900">
                                {currentEmployee.emergencyContact?.phone || 'N/A'}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills & Education */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Skills */}
                  <div className="card">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-900">Skills</h2>
                    </div>
                    <div className="p-6">
                      {currentEmployee.skills && currentEmployee.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {currentEmployee.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                            >
                              <Award className="h-4 w-4 mr-1.5" />
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">No skills listed</p>
                      )}
                    </div>
                  </div>

                  {/* Education */}
                  <div className="card">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-900">Education</h2>
                    </div>
                    <div className="p-6">
                      {currentEmployee.education && currentEmployee.education.length > 0 ? (
                        <div className="space-y-4">
                          {currentEmployee.education.map((edu, index) => (
                            <div key={index} className="flex items-start">
                              <div className="p-2 bg-gray-100 rounded-lg">
                                <GraduationCap className="h-5 w-5 text-gray-600" />
                              </div>
                              <div className="ml-4">
                                <h4 className="text-sm font-medium text-gray-900">{edu.degree}</h4>
                                <p className="text-sm text-gray-600">{edu.institution}</p>
                                <p className="text-sm text-gray-500">{edu.year}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">No education listed</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Personal Tab */}
            {activeTab === 'personal' && (
              <div className="card">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-4">Basic Details</h3>
                      <dl className="space-y-3">
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">First Name</dt>
                          <dd className="text-sm text-gray-900">{currentEmployee.firstName}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Last Name</dt>
                          <dd className="text-sm text-gray-900">{currentEmployee.lastName}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Date of Birth</dt>
                          <dd className="text-sm text-gray-900">
                            {currentEmployee.dateOfBirth 
                              ? format(parseISO(currentEmployee.dateOfBirth), 'MMMM d, yyyy')
                              : 'N/A'
                            }
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Age</dt>
                          <dd className="text-sm text-gray-900">{calculateAge()} years</dd>
                        </div>
                      </dl>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-4">Contact Details</h3>
                      <dl className="space-y-3">
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Personal Email</dt>
                          <dd className="text-sm text-gray-900">{currentEmployee.email}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Phone Number</dt>
                          <dd className="text-sm text-gray-900">{currentEmployee.phone}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Address Details</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <dl className="space-y-3">
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Street Address</dt>
                          <dd className="text-sm text-gray-900">{currentEmployee.address?.street || 'N/A'}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">City</dt>
                          <dd className="text-sm text-gray-900">{currentEmployee.address?.city || 'N/A'}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">State/Province</dt>
                          <dd className="text-sm text-gray-900">{currentEmployee.address?.state || 'N/A'}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">ZIP/Postal Code</dt>
                          <dd className="text-sm text-gray-900">{currentEmployee.address?.zipCode || 'N/A'}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Country</dt>
                          <dd className="text-sm text-gray-900">{currentEmployee.address?.country || 'N/A'}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Emergency Contact</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <dl className="space-y-3">
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Contact Name</dt>
                          <dd className="text-sm text-gray-900">{currentEmployee.emergencyContact?.name || 'N/A'}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Relationship</dt>
                          <dd className="text-sm text-gray-900">{currentEmployee.emergencyContact?.relationship || 'N/A'}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Phone Number</dt>
                          <dd className="text-sm text-gray-900">{currentEmployee.emergencyContact?.phone || 'N/A'}</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Employment Tab */}
            {activeTab === 'employment' && (
              <div className="card">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Employment Information</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-4">Current Employment</h3>
                      <dl className="space-y-3">
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Employee ID</dt>
                          <dd className="text-sm font-medium text-gray-900">{currentEmployee.employeeId}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Department</dt>
                          <dd className="text-sm text-gray-900">{currentEmployee.department}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Position</dt>
                          <dd className="text-sm text-gray-900">{currentEmployee.position}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Employment Type</dt>
                          <dd className="text-sm text-gray-900">Full-time</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Employment Status</dt>
                          <dd className="text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${currentEmployee.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'}`}>
                              {currentEmployee.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </dd>
                        </div>
                      </dl>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-4">Compensation</h3>
                      <dl className="space-y-3">
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Base Salary</dt>
                          <dd className="text-sm font-medium text-gray-900">
                            ${currentEmployee.salary?.toLocaleString()}/month
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Annual Salary</dt>
                          <dd className="text-sm font-medium text-gray-900">
                            ${(currentEmployee.salary * 12)?.toLocaleString()}/year
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Pay Frequency</dt>
                          <dd className="text-sm text-gray-900">Monthly</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Payment Method</dt>
                          <dd className="text-sm text-gray-900">Direct Deposit</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Dates</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <dl className="space-y-3">
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Date of Joining</dt>
                          <dd className="text-sm text-gray-900">
                            {currentEmployee.dateOfJoining 
                              ? format(parseISO(currentEmployee.dateOfJoining), 'MMMM d, yyyy')
                              : 'N/A'
                            }
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Years of Service</dt>
                          <dd className="text-sm text-gray-900">{calculateYearsOfService()} years</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Last Promotion</dt>
                          <dd className="text-sm text-gray-900">June 15, 2023</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Next Review Date</dt>
                          <dd className="text-sm text-gray-900">March 15, 2024</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Reporting Structure</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <dl className="space-y-3">
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Manager</dt>
                          <dd className="text-sm text-gray-900">John Smith</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Manager Email</dt>
                          <dd className="text-sm text-gray-900">john.smith@company.com</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Team Size</dt>
                          <dd className="text-sm text-gray-900">8 members</dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payroll Tab */}
            {activeTab === 'payroll' && (
              <div className="card">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Payroll History</h2>
                  <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </button>
                </div>
                <div className="p-6">
                  {loadingPayroll ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    </div>
                  ) : payrollData.length > 0 ? (
                    <>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Period
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Base Salary
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Overtime
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Bonus
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Deductions
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Net Salary
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {payrollData.map((payroll) => (
                              <tr key={payroll._id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {payroll.month}/{payroll.year}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {payroll.paymentDate 
                                      ? format(parseISO(payroll.paymentDate), 'MMM d, yyyy')
                                      : 'N/A'
                                    }
                                  </div>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                  ${payroll.baseSalary?.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-600">
                                  +${((payroll.overtimeHours * (payroll.baseSalary / 160) * payroll.overtimeRate) || 0).toFixed(2)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600">
                                  +${payroll.bonus?.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600">
                                  -${payroll.totalDeductions?.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                                  ${payroll.netSalary?.toLocaleString()}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                    ${payroll.status === 'paid' 
                                      ? 'bg-green-100 text-green-800' 
                                      : payroll.status === 'processed'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-yellow-100 text-yellow-800'}`}>
                                    {payroll.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm">
                                  <button className="text-primary-600 hover:text-primary-900 mr-3">
                                    View
                                  </button>
                                  <button className="text-gray-600 hover:text-gray-900">
                                    <Download className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Payroll Summary */}
                      <div className="mt-8 pt-8 border-t border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payroll Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600">Total Paid</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                              ${payrollData.reduce((sum, p) => sum + p.netSalary, 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600">Average Monthly</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                              ${(payrollData.length > 0 
                                ? payrollData.reduce((sum, p) => sum + p.netSalary, 0) / payrollData.length 
                                : 0
                              ).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600">Total Bonuses</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                              ${payrollData.reduce((sum, p) => sum + p.bonus, 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-sm text-gray-600">Total Deductions</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                              ${payrollData.reduce((sum, p) => sum + p.totalDeductions, 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <DollarSign className="h-12 w-12 text-gray-400 mx-auto" />
                      <h3 className="mt-4 text-lg font-medium text-gray-900">No payroll records found</h3>
                      <p className="mt-2 text-gray-600">
                        No payroll information is available for this employee yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <div className="card">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Documents</h2>
                </div>
                <div className="p-6">
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">No documents uploaded</h3>
                    <p className="mt-2 text-gray-600">
                      Upload documents such as contracts, certifications, or other important files.
                    </p>
                    <div className="mt-6">
                      <button className="btn-primary">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Documents
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetail;