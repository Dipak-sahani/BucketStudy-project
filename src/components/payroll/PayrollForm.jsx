import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import {
  DollarSign,
  Calendar,
  Calculator,
  Users,
  FileText,
  Plus,
  X,
  Save,
  ArrowLeft,
  Clock,
  TrendingUp,
  Percent,
  AlertCircle,
  CheckCircle,
  CreditCard,
  Receipt
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fetchEmployees } from '../../store/slices/employeeSlice';
import { createPayroll, updatePayroll, fetchPayrollById } from '../../store/slices/payrollSlice';
import api from '../../services/api';

const PayrollForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { employees } = useSelector((state) => state.employees);
  const { currentPayroll, loading } = useSelector((state) => state.payroll);
  const [calculating, setCalculating] = useState(false);
  const [netSalary, setNetSalary] = useState(0);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [deductions, setDeductions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);

  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      employee: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      baseSalary: 0,
      overtimeHours: 0,
      overtimeRate: 1.5,
      bonus: 0,
      deductions: [],
      paymentDate: format(new Date(), 'yyyy-MM-dd'),
      paymentMethod: 'bank_transfer',
      status: 'pending',
      notes: ''
    }
  });

  const formValues = watch();
  const isEditMode = !!id;

  useEffect(() => {
    dispatch(fetchEmployees({ limit: 100 }));
    
    if (isEditMode) {
      dispatch(fetchPayrollById(id));
    }
  }, [dispatch, id, isEditMode]);

  useEffect(() => {
    if (currentPayroll && isEditMode) {
      // Set form values from currentPayroll
      Object.keys(currentPayroll).forEach(key => {
        if (key === 'employee' && currentPayroll.employee) {
          setValue('employee', currentPayroll.employee._id);
          setSelectedEmployee(currentPayroll.employee);
        } else if (key === 'deductions' && currentPayroll.deductions) {
          setDeductions(currentPayroll.deductions);
          setValue('deductions', currentPayroll.deductions);
        } else if (currentPayroll[key] !== undefined) {
          setValue(key, currentPayroll[key]);
        }
      });
      
      // Calculate net salary
      calculateNetSalary(currentPayroll);
    }
  }, [currentPayroll, isEditMode, setValue]);

  useEffect(() => {
    if (employees.length > 0) {
      const options = employees.map(emp => ({
        value: emp._id,
        label: `${emp.employeeId} - ${emp.firstName} ${emp.lastName}`,
        data: emp
      }));
      setEmployeeOptions(options);
    }
  }, [employees]);

  // Recalculate net salary when form values change
  useEffect(() => {
    const calculate = () => {
      const { baseSalary, overtimeHours, overtimeRate, bonus } = formValues;
      const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
      
      const overtimePay = (overtimeHours || 0) * ((baseSalary || 0) / 160) * (overtimeRate || 1.5);
      // const calculatedNet = (baseSalary || 0) + overtimePay + (bonus || 0) - totalDeductions;
      const calculatedNet = Number((baseSalary || 0)) + Number(overtimePay)  + Number((bonus || 0) )-totalDeductions

      
      setNetSalary(calculatedNet);
    };

    calculate();
  }, [formValues, deductions]);

  const loadEmployees = async (inputValue) => {
    try {
      const response = await api.get(import.meta.env.VITE_EMPLOYEE, {
        params: { search: inputValue, limit: 10 }
      });
      
      return response.data.employees.map(emp => ({
        value: emp._id,
        label: `${emp.employeeId} - ${emp.firstName} ${emp.lastName}`,
        data: emp
      }));
    } catch (error) {
      console.error('Error loading employees:', error);
      return [];
    }
  };

  const calculateNetSalary = (data) => {
    const baseSalary = data.baseSalary || 0;
    const overtimeHours = data.overtimeHours || 0;
    const overtimeRate = data.overtimeRate || 1.5;
    const bonus = data.bonus || 0;
    const totalDeductions = data.deductions?.reduce((sum, d) => sum + d.amount, 0) || 0;
    
    const overtimePay = overtimeHours * (baseSalary / 160) * overtimeRate;
    const calculatedNet = baseSalary + overtimePay + bonus - totalDeductions;
    
    setNetSalary(calculatedNet);
    return calculatedNet;
  };

  const handleEmployeeChange = (selectedOption) => {
    setSelectedEmployee(selectedOption?.data || null);
    if (selectedOption?.data?.salary) {
      setValue('baseSalary', selectedOption.data.salary);
    }
  };

  const addDeduction = () => {
    const newDeduction = {
      id: Date.now(),
      type: 'other',
      description: '',
      amount: 0
    };
    setDeductions([...deductions, newDeduction]);
  };

  const updateDeduction = (id, field, value) => {
    const updated = deductions.map(d => 
      d.id === id ? { ...d, [field]: value } : d
    );
    setDeductions(updated);
    setValue('deductions', updated);
  };

  const removeDeduction = (id) => {
    const updated = deductions.filter(d => d.id !== id);
    setDeductions(updated);
    setValue('deductions', updated);
  };

  const onSubmit = async (data) => {
    try {
      setCalculating(true);
      
      const payload = {
        ...data,
        employee: selectedEmployee?._id || data.employee,
        deductions: deductions.filter(d => d.description && d.amount > 0),
        netSalary: netSalary
      };

      if (isEditMode) {
        await dispatch(updatePayroll({ id, data: payload }));
      } else {
        console.log(payload);
        
        // const res= api.post(import.meta.env.VITE_PAYROLL,payload)
        await dispatch(createPayroll(payload));
        // console.log(res.data);
        
      }
      
      navigate('/payroll');
    } catch (error) {
      console.error('Error saving payroll:', error);
    } finally {
      setCalculating(false);
    }
  };

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => ({
    value: currentYear - 2 + i,
    label: (currentYear - 2 + i).toString()
  }));

  const deductionTypes = [
    { value: 'tax', label: 'Income Tax' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'loan', label: 'Loan Repayment' },
    { value: 'other', label: 'Other' }
  ];

  const paymentMethods = [
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'check', label: 'Check' },
    { value: 'cash', label: 'Cash' }
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'processed', label: 'Processed' },
    { value: 'paid', label: 'Paid' }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link
            to="/payroll"
            className="mr-3 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Payroll' : 'Create New Payroll'}
            </h1>
            <p className="mt-1 text-gray-600">
              {isEditMode 
                ? 'Update payroll information for an employee' 
                : 'Process payroll for an employee'}
            </p>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-700">Base Salary</p>
                <p className="text-lg font-bold text-gray-900">
                  ${(formValues.baseSalary || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-100 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-700">Overtime</p>
                <p className="text-lg font-bold text-gray-900">
                  {formValues.overtimeHours || 0} hours
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-700">Bonus</p>
                <p className="text-lg font-bold text-gray-900">
                  ${(formValues.bonus || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-100 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Percent className="h-5 w-5 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-700">Deductions</p>
                <p className="text-lg font-bold text-gray-900">
                  ${deductions.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Employee Selection & Period */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Employee Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Employee *
                </label>
                <Controller
                  name="employee"
                  control={control}
                  rules={{ required: 'Employee is required' }}
                  render={({ field }) => (
                    <AsyncSelect
                      {...field}
                      cacheOptions
                      defaultOptions={employeeOptions}
                      loadOptions={loadEmployees}
                      onChange={(selectedOption) => {
                        field.onChange(selectedOption?.value);
                        handleEmployeeChange(selectedOption);
                      }}
                      value={employeeOptions.find(opt => opt.value === field.value)}
                      placeholder="Search employee by name or ID..."
                      className="react-select-container"
                      classNamePrefix="react-select"
                      isDisabled={isEditMode}
                    />
                  )}
                />
                {errors.employee && (
                  <p className="mt-1 text-sm text-red-600">{errors.employee.message}</p>
                )}

                {/* Selected Employee Info */}
                {selectedEmployee && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary-600" />
                      </div>
                      <div className="ml-4">
                        <h4 className="text-sm font-medium text-gray-900">
                          {selectedEmployee.firstName} {selectedEmployee.lastName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {selectedEmployee.position} • {selectedEmployee.department}
                        </p>
                        <p className="text-sm text-gray-500">
                          Base Salary: ${selectedEmployee.salary?.toLocaleString()}/month
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Period Selection */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Month *
                    </label>
                    <Controller
                      name="month"
                      control={control}
                      rules={{ required: 'Month is required' }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={months}
                          value={months.find(opt => opt.value === field.value)}
                          onChange={(selected) => field.onChange(selected.value)}
                          className="react-select-container"
                          classNamePrefix="react-select"
                        />
                      )}
                    />
                    {errors.month && (
                      <p className="mt-1 text-sm text-red-600">{errors.month.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Year *
                    </label>
                    <Controller
                      name="year"
                      control={control}
                      rules={{ required: 'Year is required' }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={years}
                          value={years.find(opt => opt.value === field.value)}
                          onChange={(selected) => field.onChange(selected.value)}
                          className="react-select-container"
                          classNamePrefix="react-select"
                        />
                      )}
                    />
                    {errors.year && (
                      <p className="mt-1 text-sm text-red-600">{errors.year.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    {...register('paymentDate', { required: 'Payment date is required' })}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  {errors.paymentDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.paymentDate.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Salary Calculation */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Salary Calculation</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Base Salary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base Salary *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    {...register('baseSalary', { 
                      required: 'Base salary is required',
                      min: { value: 0, message: 'Salary must be positive' }
                    })}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                {errors.baseSalary && (
                  <p className="mt-1 text-sm text-red-600">{errors.baseSalary.message}</p>
                )}
              </div>

              {/* Overtime */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Overtime Hours
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    step="0.5"
                    {...register('overtimeHours', { 
                      min: { value: 0, message: 'Hours cannot be negative' }
                    })}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                {errors.overtimeHours && (
                  <p className="mt-1 text-sm text-red-600">{errors.overtimeHours.message}</p>
                )}
              </div>

              {/* Overtime Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Overtime Rate
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Percent className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    {...register('overtimeRate', { 
                      min: { value: 1, message: 'Rate must be at least 1' }
                    })}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="1.5"
                  />
                </div>
                {errors.overtimeRate && (
                  <p className="mt-1 text-sm text-red-600">{errors.overtimeRate.message}</p>
                )}
              </div>

              {/* Bonus */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bonus Amount
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <TrendingUp className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    {...register('bonus', { 
                      min: { value: 0, message: 'Bonus cannot be negative' }
                    })}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg 
                             focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                {errors.bonus && (
                  <p className="mt-1 text-sm text-red-600">{errors.bonus.message}</p>
                )}
              </div>
            </div>

            {/* Overtime Calculation Preview */}
            {(formValues.overtimeHours > 0) && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <div className="flex items-center">
                  <Calculator className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-sm font-medium text-gray-900">Overtime Calculation</h3>
                </div>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-sm">
                    <p className="text-gray-600">Hourly Rate:</p>
                    <p className="font-medium text-gray-900">
                      ${((formValues.baseSalary || 0) / 160).toFixed(2)}/hour
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-600">Overtime Hours:</p>
                    <p className="font-medium text-gray-900">{formValues.overtimeHours} hours</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-600">Overtime Pay:</p>
                    <p className="font-medium text-green-600">
                      ${(formValues.overtimeHours * (formValues.baseSalary / 160) * formValues.overtimeRate).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Deductions */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Deductions</h2>
              <button
                type="button"
                onClick={addDeduction}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-lg text-green-500 bg-primary-600 hover:bg-primary-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Deduction
              </button>
            </div>
          </div>
          <div className="p-6">
            {deductions.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto" />
                <p className="mt-2 text-gray-600">No deductions added yet</p>
                <p className="text-sm text-gray-500">Add deductions such as taxes, insurance, or loans</p>
              </div>
            ) : (
              <div className="space-y-4">
                {deductions.map((deduction, index) => (
                  <div key={deduction.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Type
                        </label>
                        <select
                          value={deduction.type}
                          onChange={(e) => updateDeduction(deduction.id, 'type', e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg 
                                   focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                        >
                          {deductionTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={deduction.description}
                          onChange={(e) => updateDeduction(deduction.id, 'description', e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg 
                                   focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                          placeholder="e.g., Federal Tax, Health Insurance"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Amount
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="number"
                            step="0.01"
                            value={deduction.amount}
                            onChange={(e) => updateDeduction(deduction.id, 'amount', parseFloat(e.target.value) || 0)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg 
                                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => removeDeduction(deduction.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Total Deductions */}
            {deductions.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Total Deductions:</span>
                  <span className="text-lg font-bold text-red-600">
                    ${deductions.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Details */}
        <div className="card">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Payment Details</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method *
                </label>
                <Controller
                  name="paymentMethod"
                  control={control}
                  rules={{ required: 'Payment method is required' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={paymentMethods}
                      value={paymentMethods.find(opt => opt.value === field.value)}
                      onChange={(selected) => field.onChange(selected.value)}
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                  )}
                />
                {errors.paymentMethod && (
                  <p className="mt-1 text-sm text-red-600">{errors.paymentMethod.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <Controller
                  name="status"
                  control={control}
                  rules={{ required: 'Status is required' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={statusOptions}
                      value={statusOptions.find(opt => opt.value === field.value)}
                      onChange={(selected) => field.onChange(selected.value)}
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                  )}
                />
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                {...register('notes')}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg 
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Add any additional notes or comments..."
              />
            </div>
          </div>
        </div>

        {/* Summary & Actions */}
        <div className="card">
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Salary Summary */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Salary Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Salary:</span>
                    <span className="font-medium">${(formValues.baseSalary || 0).toLocaleString()}</span>
                  </div>
                  
                  {(formValues.overtimeHours > 0) && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Overtime Pay:</span>
                      <span className="font-medium text-blue-600">
                        ${(formValues.overtimeHours * (formValues.baseSalary / 160) * formValues.overtimeRate).toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  {(formValues.bonus > 0) && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Bonus:</span>
                      <span className="font-medium text-green-600">
                        +${(formValues.bonus || 0).toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  {deductions.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Deductions:</span>
                      <span className="font-medium text-red-600">
                        -${deductions.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Net Salary:</span>
                      <span className="text-2xl font-bold text-primary-600">
                        ${netSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => calculateNetSalary(formValues)}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 
                               rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Calculator className="h-4 w-4 mr-2" />
                      Recalculate
                    </button>
                    
                    <button
                      type="button"
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 
                               rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Receipt className="h-4 w-4 mr-2" />
                      Preview Payslip
                    </button>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex space-x-3">
                    <Link
                      to="/payroll"
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 
                               rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </Link>
                    
                    <button
                      type="submit"
                      disabled={calculating || !selectedEmployee}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent 
                               rounded-lg shadow-sm text-sm font-medium text-green-500 bg-primary-600 
                               hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                               focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {calculating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {isEditMode ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          {isEditMode ? 'Update Payroll' : 'Create Payroll'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Add react-select styles */}
      <style jsx>{`
        .react-select-container {
          font-size: 0.875rem;
        }
        
        .react-select__control {
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          min-height: 42px;
          box-shadow: none;
        }
        
        .react-select__control:hover {
          border-color: #d1d5db;
        }
        
        .react-select__control--is-focused {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }
        
        .react-select__menu {
          border-radius: 0.5rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        
        .react-select__option--is-focused {
          background-color: #eff6ff;
        }
        
        .react-select__option--is-selected {
          background-color: #3b82f6;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default PayrollForm;