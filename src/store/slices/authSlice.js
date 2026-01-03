import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "../../services/authService";

export const login = createAsyncThunk(
  "auth/login",
  async (userData, thunkAPI) => {
    try {
      const response = await axios.post("/api/auth/login", userData);
      localStorage.setItem("token", response.data.token); // Store token
      localStorage.setItem("user", JSON.stringify(response.data.user)); // Store user data
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

const user = JSON.parse(localStorage.getItem("user"));

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: user ? user : null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      authService.logout();
      state.user = null;
    },
    clearError: (state) => {
      state.error = null;
    },

    setUser: (state, action) => {
      state.user = null;
      console.log(action.payload);

      localStorage.setItem("user", JSON.stringify(action.payload));
      window.location.href = "/";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError,setUser } = authSlice.actions;
export default authSlice.reducer;
