import React from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Briefcase, 
  DollarSign,
  MoreVertical,
  Eye,
  Edit2,
  Trash2
} from 'lucide-react';

const EmployeeCard = ({ employee, onDelete, onView, onEdit, showActions = true }) => {
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${employee.firstName} ${employee.lastName}?`)) {
      onDelete(employee._id);
    }
  };

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="p-5">
        {/* Header with avatar and actions */}
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="relative">
              <div className="h-14 w-14 rounded-full bg-linear-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <User className="h-7 w-7 text-white" />
              </div>
              {employee.isActive ? (
                <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-green-500 border-2 border-white"></div>
              ) : (
                <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-red-500 border-2 border-white"></div>
              )}
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {employee.firstName} {employee.lastName}
              </h3>
              <p className="text-sm text-gray-600">ID: {employee.employeeId}</p>
            </div>
          </div>
          
          {showActions && (
            <div className="relative">
              <div className="dropdown">
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <MoreVertical className="h-5 w-5" />
                </button>
                <div className="dropdown-menu absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10 hidden">
                  <Link
                    to={`/employees/${employee._id}`}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Link>
                  <Link
                    to={`/employees/${employee._id}/edit`}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Employee Info */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center text-sm">
            <Mail className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-gray-700 truncate">{employee.email}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <Phone className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-gray-700">{employee.phone}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <Building className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-gray-700">{employee.department}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-gray-700">{employee.position}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <DollarSign className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-gray-700">
              ${employee.salary?.toLocaleString()}/month
            </span>
          </div>
        </div>

        {/* Skills Tags */}
        {employee.skills && employee.skills.length > 0 && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {employee.skills.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                >
                  {skill}
                </span>
              ))}
              {employee.skills.length > 3 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  +{employee.skills.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer with status and actions */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
              ${employee.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'}`}>
              {employee.isActive ? 'Active' : 'Inactive'}
            </span>
            
            <div className="flex items-center space-x-2">
              {showActions && (
                <>
                  <Link
                    to={`/employees/${employee._id}`}
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <Link
                    to={`/employees/${employee._id}/edit`}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add CSS for dropdown functionality
const style = document.createElement('style');
style.textContent = `
  .dropdown:hover .dropdown-menu {
    display: block;
  }
`;
document.head.appendChild(style);

export default EmployeeCard;