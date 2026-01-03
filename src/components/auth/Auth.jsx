import React, { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser } from "../../store/slices/authSlice";
import {
  User,
  Mail,
  Lock,
  Camera,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
} from "lucide-react";

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    password: "",
    role: "",
    avatar: null,
  });

  const handleChange = (e) => {
    if (e.target.name === "avatar") {
      const file = e.target.files[0];
      setFormData({ ...formData, avatar: file });

      // Create preview
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAvatarPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setAvatarPreview(null);
      }
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const url = isSignUp
      ? import.meta.env.VITE_REGISTER_USER
      : import.meta.env.VITE_LOGIN_USER;

    try {
      let payload;

      if (isSignUp) {
        payload = new FormData();
        payload.append("fullName", formData.fullName);
        payload.append("username", formData.username);
        payload.append("email", formData.email);
        payload.append("password", formData.password);
        if (formData.avatar) {
          payload.append("avatar", formData.avatar);
        }
      } else {
        payload = {
          email: formData.email,
          password: formData.password,
        };
      }

      console.log(formData);

      const response = await axios.post(url, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        dispatch(setUser(response.data.User));
        // console.log(response.data.User);

        localStorage.setItem("token", response.data.accessToken);
        alert(response.data.message || "Success!");
      }
      if (response.status === 201) {
        alert(response.data.message || "Success Register!");
        window.location.reload();
      }
    } catch (error) {
      if (error.response?.status === 409) {
        alert(
          `User already exists with username ${formData.username} and email ${formData.email}`
        );
      } else {
        alert(error.response?.data?.message || "Something went wrong!");
      }
      console.error("Error:", error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Left Side - Form */}
          <div className="lg:w-1/2 p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </h1>
              <p className="text-gray-600 mt-2">
                {isSignUp
                  ? "Sign up to get started with our platform"
                  : "Sign in to continue to your account"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {isSignUp && (
                <>
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="johndoe"
                        required
                      />
                    </div>
                  </div>

                  {/* Avatar Upload */}
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Picture
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="h-20 w-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                          {avatarPreview ? (
                            <img
                              src={avatarPreview}
                              alt="Avatar preview"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Camera className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            name="avatar"
                            accept="image/*"
                            onChange={handleChange}
                            className="hidden"
                          />
                          <div className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
                            <Camera className="h-4 w-4 mr-2" />
                            <span className="text-sm font-medium">
                              {avatarPreview ? "Change Photo" : "Upload Photo"}
                            </span>
                          </div>
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          JPG, PNG or GIF (Max 5MB)
                        </p>
                      </div>
                    </div>
                  </div> */}
                </>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 pr-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {!isSignUp && (
                  <div className="flex justify-end mt-2">
                    <a
                      href="#"
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      Forgot password?
                    </a>
                  </div>
                )}
              </div>
              {/* role */}
              {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>

                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg bg-white
                 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                 transition-colors"
                      required
                    >
                      <option value="" disabled>
                        Select role
                      </option>
                      <option value="employee">Employee</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Submit Button - FIXED STYLING */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {isSignUp ? "Creating Account..." : "Signing In..."}
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    {isSignUp ? (
                      <>
                        <UserPlus className="h-5 w-5 mr-2" />
                        Create Account
                      </>
                    ) : (
                      <>
                        <LogIn className="h-5 w-5 mr-2" />
                        Sign In
                      </>
                    )}
                  </div>
                )}
              </button>
            </form>

            {/* Toggle Sign Up/Sign In */}
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                {isSignUp
                  ? "Already have an account? "
                  : "Don't have an account? "}
                <button
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setAvatarPreview(null);
                    setFormData({
                      fullName: "",
                      email: "",
                      username: "",
                      password: "",
                      avatar: null,
                    });
                  }}
                  className="text-blue-600 font-semibold hover:text-blue-500 transition-colors ml-1"
                >
                  {isSignUp ? "Sign In" : "Sign Up"}
                </button>
              </p>
            </div>

            {/* Terms */}
            {isSignUp && (
              <p className="mt-6 text-center text-xs text-gray-500">
                By creating an account, you agree to our{" "}
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  Privacy Policy
                </a>
              </p>
            )}
          </div>

          {/* Right Side - Image & Info */}
          <div className="lg:w-1/2 bg-linear-to-br from-blue-500 to-blue-600 p-8 md:p-12 text-white relative hidden lg:block">
            <div className="absolute inset-0 overflow-hidden">
              <img
                src="img4.jpeg"
                alt="Authentication Visual"
                className="w-full h-full object-cover opacity-20"
              />
            </div>
            <div className="relative z-10 h-full flex flex-col justify-center">
              <div className="max-w-md mx-auto">
                <h2 className="text-4xl font-bold mb-6">
                  {isSignUp ? "Join Our Community" : "Welcome Back"}
                </h2>
                <p className="text-lg mb-8 opacity-90">
                  {isSignUp
                    ? "Connect with amazing people and explore new opportunities. Your journey starts here."
                    : "Continue your journey with us. Access all your tools and resources in one place."}
                </p>

                <div className="space-y-6">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center mr-4">
                      <div className="h-5 w-5 bg-white rounded-full"></div>
                    </div>
                    <div>
                      <h3 className="font-semibold">Secure Platform</h3>
                      <p className="text-sm opacity-80">
                        Bank-level security for your data
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center mr-4">
                      <div className="h-5 w-5 bg-white rounded-full"></div>
                    </div>
                    <div>
                      <h3 className="font-semibold">24/7 Support</h3>
                      <p className="text-sm opacity-80">
                        Always here to help you
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center mr-4">
                      <div className="h-5 w-5 bg-white rounded-full"></div>
                    </div>
                    <div>
                      <h3 className="font-semibold">Easy to Use</h3>
                      <p className="text-sm opacity-80">
                        Intuitive and user-friendly interface
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-white/20">
                <p className="text-center text-sm opacity-80">
                  Trusted by thousands of users worldwide
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
