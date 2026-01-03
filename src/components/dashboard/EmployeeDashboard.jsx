import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  User,
  Calendar,
  DollarSign,
  Clock,
  FileText,
  Settings,
  Award,
  TrendingUp,
  Bell,
  Mail,
  Users,
  Target,
  CalendarDays,
} from "lucide-react";
import api from "../../services/api";
import { format } from "date-fns";

const EmployeeDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [employeeData, setEmployeeData] = useState(null);
  const [payrollData, setPayrollData] = useState(null);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showInput, setShowInput] = useState(false);
  const [employeeId, setEmployeeId] = useState("");

  useEffect(() => {
    loadEmployeeData();
  }, [user]);

  const loadEmployeeData = async () => {
    try {
      setLoading(true);

      // Load employee details
      if (user?.employeeId) {
        console.log("load");

        const empRes = await api.get(
          `${import.meta.env.VITE_EMP_DETAIL}${user.employeeId}`
        );
        setEmployeeData(empRes.data);
        console.log(empRes);
      }

      // Load payroll data
      // const payrollRes = await api.get('/payroll', {
      //   params: {
      //     employee: user?.employeeDetails?._id,
      //     limit: 3,
      //     sort: '-createdAt'
      //   }
      // });
      // setPayrollData(payrollRes.data.payrolls || []);

      // Load upcoming events
      const events = [
        {
          id: 1,
          title: "Team Meeting",
          date: new Date(Date.now() + 86400000), // Tomorrow
          time: "2:00 PM",
          type: "meeting",
        },
        {
          id: 2,
          title: "Performance Review",
          date: new Date(Date.now() + 259200000), // 3 days
          time: "10:00 AM",
          type: "review",
        },
        {
          id: 3,
          title: "Training Session",
          date: new Date(Date.now() + 604800000), // 7 days
          time: "9:00 AM",
          type: "training",
        },
      ];
      setUpcomingEvents(events);

      // Load announcements
      const announcements = [
        {
          id: 1,
          title: "New Company Policy",
          content: "Updated remote work policy effective next month.",
          date: "2024-01-10",
          read: false,
        },
        {
          id: 2,
          title: "Team Lunch",
          content: "Monthly team lunch this Friday at 12:30 PM.",
          date: "2024-01-08",
          read: true,
        },
        {
          id: 3,
          title: "System Maintenance",
          content: "Scheduled maintenance this Saturday 2-4 AM.",
          date: "2024-01-05",
          read: true,
        },
      ];
      setRecentAnnouncements(announcements);

      // Load team members (from same department)
      if (user?.employeeDetails?.department) {
        const teamRes = await api.get("/employees", {
          params: {
            department: user.employeeDetails.department,
            limit: 4,
            exclude: user.employeeDetails._id,
          },
        });
        setTeamMembers(teamRes.data.employees || []);
      }
    } catch (error) {
      console.error("Error loading employee data:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: "Days to Next Pay",
      value: "7",
      icon: DollarSign,
      color: "bg-green-100 text-green-600",
      description: "Next payroll date",
    },
    {
      title: "Vacation Days",
      value: "12",
      icon: Calendar,
      color: "bg-blue-100 text-blue-600",
      description: "Remaining this year",
    },
    {
      title: "Projects",
      value: "3",
      icon: Target,
      color: "bg-purple-100 text-purple-600",
      description: "Active assignments",
    },
    {
      title: "Attendance",
      value: "98%",
      icon: TrendingUp,
      color: "bg-orange-100 text-orange-600",
      description: "This month",
    },
  ];

  const quickLinks = [
    {
      title: "View Payslips",
      icon: FileText,
      link: "/payroll",
      color: "bg-blue-50 hover:bg-blue-100",
    },
    {
      title: "Request Time Off",
      icon: CalendarDays,
      link: "#",
      color: "bg-green-50 hover:bg-green-100",
    },
    {
      title: "Update Profile",
      icon: Settings,
      link: "/profile/edit",
      color: "bg-purple-50 hover:bg-purple-100",
    },
    {
      title: "Team Directory",
      icon: Users,
      link: "#",
      color: "bg-orange-50 hover:bg-orange-100",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const handleSave = () => {
    if (!employeeId) {
      return alert("Employee ID is required");
    }

    try {
      let data = {
        employeeId: employeeId,
      };
      const res = api.post(import.meta.env.VITE_UPDATE_EMP_ID, data);
      console.log(res.data);
    } catch (error) {}

    // onSave(employeeId);

    setEmployeeId("");
    setShowInput(false);
  };

  const handleCancel = () => {
    setEmployeeId("");
    setShowInput(false);
    onCancel?.();
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      {user?.employeeId ? null : (
        <div className="space-y-4">
          {!showInput && (
            <button
              type="button"
              onClick={() => setShowInput(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Add Employee ID
            </button>
          )}

          {showInput && (
            <div className="space-y-4 border p-4 rounded-lg bg-gray-50">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee ID
                </label>

                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="Enter employee ObjectId"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-lg
                         text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg
                         hover:bg-green-700"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="card">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center">
              <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                <User className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {employeeData?.firstName || "Employee"}!
                </h1>
                <p className="mt-1 text-gray-600">
                  {employeeData?.position} • {employeeData?.department}{" "}
                  Department
                </p>
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    {employeeData?.email}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Joined{" "}
                    {employeeData?.dateOfJoining
                      ? format(new Date(employeeData.dateOfJoining), "MMM yyyy")
                      : "N/A"}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="flex items-center space-x-3">
                <button className="btn-secondary">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </button>
                <Link to="/profile/edit" className="btn-primary">
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-600">
                  {stat.title}
                </h3>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500 mt-1">{stat.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Links */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Quick Links
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickLinks.map((link, index) => (
                  <Link
                    key={index}
                    to={link.link}
                    className={`flex items-center p-4 rounded-lg transition-colors ${link.color}`}
                  >
                    <div className="p-3 rounded-lg bg-white">
                      <link.icon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900">
                        {link.title}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Payroll */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Payroll
              </h2>
              <Link
                to="/payroll"
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
                      Period
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Base Salary
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bonuses
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deductions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Net Salary
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payrollData?.map((payroll) => (
                    <tr key={payroll._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {payroll.month}/{payroll.year}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${payroll.baseSalary?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        +${payroll.bonus?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        -${payroll.totalDeductions?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ${payroll.netSalary?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${
                            payroll.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : payroll.status === "processed"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {payroll.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {payrollData?.length === 0 && (
                <div className="text-center py-8">
                  <DollarSign className="h-12 w-12 text-gray-400 mx-auto" />
                  <p className="mt-2 text-gray-600">No payroll records found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Upcoming Events
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center">
                    <div className="shrink-0">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center
                        ${
                          event.type === "meeting"
                            ? "bg-blue-100"
                            : event.type === "review"
                            ? "bg-green-100"
                            : "bg-purple-100"
                        }`}
                      >
                        <Calendar
                          className={`h-5 w-5
                          ${
                            event.type === "meeting"
                              ? "text-blue-600"
                              : event.type === "review"
                              ? "text-green-600"
                              : "text-purple-600"
                          }`}
                        />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        {event.title}
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(event.date, "MMM d")} • {event.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <button className="w-full btn-secondary">View Calendar</button>
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Team Members
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member._id} className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 font-semibold">
                        {member.firstName?.[0]}
                        {member.lastName?.[0]}
                      </span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        {member.firstName} {member.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{member.position}</p>
                    </div>
                  </div>
                ))}
              </div>
              {teamMembers.length === 0 && (
                <div className="text-center py-4">
                  <Users className="h-8 w-8 text-gray-400 mx-auto" />
                  <p className="mt-2 text-sm text-gray-600">
                    No team members found
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Announcements */}
          <div className="card">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Announcements
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentAnnouncements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className={`p-3 rounded-lg ${
                      !announcement.read
                        ? "bg-blue-50 border border-blue-100"
                        : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {announcement.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {announcement.content}
                        </p>
                      </div>
                      {!announcement.read && (
                        <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {announcement.date}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <button className="w-full btn-secondary">
                  View All Announcements
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Employee Info Card */}
      <div className="card">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Your Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Personal Details
              </h3>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Employee ID</dt>
                  <dd className="text-sm text-gray-900">
                    {employeeData?.employeeId}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Full Name</dt>
                  <dd className="text-sm text-gray-900">
                    {employeeData?.firstName} {employeeData?.lastName}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Date of Birth</dt>
                  <dd className="text-sm text-gray-900">
                    {employeeData?.dateOfBirth
                      ? format(
                          new Date(employeeData.dateOfBirth),
                          "MMM d, yyyy"
                        )
                      : "N/A"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Phone</dt>
                  <dd className="text-sm text-gray-900">
                    {employeeData?.phone || "N/A"}
                  </dd>
                </div>
              </dl>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Employment Details
              </h3>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Department</dt>
                  <dd className="text-sm text-gray-900">
                    {employeeData?.department}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Position</dt>
                  <dd className="text-sm text-gray-900">
                    {employeeData?.position}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Salary</dt>
                  <dd className="text-sm text-gray-900">
                    ${employeeData?.salary?.toLocaleString()}/month
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Employment Status</dt>
                  <dd className="text-sm">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
                      ${
                        employeeData?.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {employeeData?.isActive ? "Active" : "Inactive"}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
