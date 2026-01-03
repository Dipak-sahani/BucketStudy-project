import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async Thunks
export const fetchPayrolls = createAsyncThunk(
  'payroll/fetchPayrolls',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.get('/payroll', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payroll data');
    }
  }
);

export const fetchPayrollById = createAsyncThunk(
  'payroll/fetchPayrollById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/payroll/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payroll');
    }
  }
);

export const createPayroll = createAsyncThunk(
  'payroll/createPayroll',
  async (payrollData, { rejectWithValue }) => {
    try {
      const response = await api.post(import.meta.env.VITE_PAYROLL, payrollData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create payroll');
    }
  }
);

export const updatePayroll = createAsyncThunk(
  'payroll/updatePayroll',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/payroll/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update payroll');
    }
  }
);

export const deletePayroll = createAsyncThunk(
  'payroll/deletePayroll',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/payroll/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete payroll');
    }
  }
);

export const processPayroll = createAsyncThunk(
  'payroll/processPayroll',
  async ({ month, year }, { rejectWithValue }) => {
    try {
      const response = await api.post('/payroll/process', { month, year });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to process payroll');
    }
  }
);

// Initial State
const initialState = {
  payrolls: [],
  currentPayroll: null,
  loading: false,
  error: null,
  stats: {
    totalPayroll: 0,
    averageSalary: 0,
    totalDeductions: 0,
    totalBonuses: 0,
  },
  summary: {
    byDepartment: {},
    byStatus: {},
  },
};

// Slice
const payrollSlice = createSlice({
  name: 'payroll',
  initialState,
  reducers: {
    clearCurrentPayroll: (state) => {
      state.currentPayroll = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearPayrolls: (state) => {
      state.payrolls = [];
      state.currentPayroll = null;
      state.stats = {
        totalPayroll: 0,
        averageSalary: 0,
        totalDeductions: 0,
        totalBonuses: 0,
      };
      state.summary = {
        byDepartment: {},
        byStatus: {},
      };
    },
    setPayrollStats: (state, action) => {
      state.stats = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Payrolls
      .addCase(fetchPayrolls.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayrolls.fulfilled, (state, action) => {
        state.loading = false;
        state.payrolls = action.payload.payrolls || action.payload;
        
        // Calculate stats
        const payrolls = action.payload.payrolls || action.payload;
        const totalPayroll = payrolls.reduce((sum, payroll) => sum + payroll.netSalary, 0);
        const totalDeductions = payrolls.reduce((sum, payroll) => sum + payroll.totalDeductions, 0);
        const totalBonuses = payrolls.reduce((sum, payroll) => sum + payroll.bonus, 0);
        
        state.stats = {
          totalPayroll,
          averageSalary: payrolls.length > 0 ? totalPayroll / payrolls.length : 0,
          totalDeductions,
          totalBonuses,
        };
        
        // Calculate summary
        const byDepartment = {};
        const byStatus = {};
        
        payrolls.forEach(payroll => {
          // By department
          const dept = payroll.employee?.department || 'Unknown';
          byDepartment[dept] = (byDepartment[dept] || 0) + payroll.netSalary;
          
          // By status
          byStatus[payroll.status] = (byStatus[payroll.status] || 0) + 1;
        });
        
        state.summary = { byDepartment, byStatus };
      })
      .addCase(fetchPayrolls.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Payroll By ID
      .addCase(fetchPayrollById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayrollById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayroll = action.payload;
      })
      .addCase(fetchPayrollById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Payroll
      .addCase(createPayroll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPayroll.fulfilled, (state, action) => {
        state.loading = false;
        state.payrolls.unshift(action.payload);
      })
      .addCase(createPayroll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Payroll
      .addCase(updatePayroll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePayroll.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.payrolls.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.payrolls[index] = action.payload;
        }
        if (state.currentPayroll && state.currentPayroll._id === action.payload._id) {
          state.currentPayroll = action.payload;
        }
      })
      .addCase(updatePayroll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Payroll
      .addCase(deletePayroll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePayroll.fulfilled, (state, action) => {
        state.loading = false;
        state.payrolls = state.payrolls.filter(p => p._id !== action.payload);
        if (state.currentPayroll && state.currentPayroll._id === action.payload) {
          state.currentPayroll = null;
        }
      })
      .addCase(deletePayroll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Process Payroll
      .addCase(processPayroll.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(processPayroll.fulfilled, (state, action) => {
        state.loading = false;
        // Add newly processed payrolls
        if (Array.isArray(action.payload)) {
          state.payrolls = [...action.payload, ...state.payrolls];
        } else {
          state.payrolls.unshift(action.payload);
        }
      })
      .addCase(processPayroll.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentPayroll, clearError, clearPayrolls, setPayrollStats } = payrollSlice.actions;
export default payrollSlice.reducer;