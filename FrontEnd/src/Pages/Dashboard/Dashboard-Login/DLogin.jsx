import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AdminLogin, forgetPassword, NurseLogin } from "../../../Redux/auth/action";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import banner from "../../../img/banner.png";
import admin from "../../../img/admin.jpg";

const notify = (text) => toast(text);

const DLogin = () => {
  const [open, setOpen] = useState(false);
  const [Loading, setLoading] = useState(false);
  const [placement, SetPlacement] = useState("Manager");
  const [formvalue, setFormvalue] = useState({ ID: "", password: "" });
  const [ForgetPassword, setForgetPassword] = useState({ type: "", email: "" });
  const [forgetLoading, setforgetLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const showDrawer = () => setOpen(true);
  const onClose = () => {
    setOpen(false);
    setForgetPassword({ type: "", email: "" });
  };

  const Handlechange = (e) => {
    setFormvalue({ ...formvalue, [e.target.name]: e.target.value });
  };

  const HandleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    if (formvalue.ID && formvalue.password) {
      if (placement === "Manager") {
        let data = { ...formvalue, nurseID: formvalue.ID };
        dispatch(NurseLogin(data)).then((res) => {
          setLoading(false);
          if (res.message === "Successful") {
            notify("Login Successful");
            return navigate("/dashboard");
          }
          if (res.message === "Wrong credentials") {
            notify("Wrong credentials");
          }
          if (res.message === "Error") {
            notify("Something went Wrong, Please Try Again");
          }
        });
      } else if (placement === "Admin") {
        let data = { ...formvalue, adminID: formvalue.ID };
        dispatch(AdminLogin(data)).then((res) => {
          setLoading(false);
          if (res.message === "Successful") {
            notify("Login Successful");
            return navigate("/admin-dashboard");
          }
          if (res.message === "Wrong credentials") {
            notify("Wrong credentials");
          }
          if (res.message === "Error") {
            notify("Something went Wrong, Please Try Again");
          }
        });
      }
    } else {
      setLoading(false);
      notify("Please fill all fields");
    }
  };

  const placementChange = (e) => {
    SetPlacement(e.target.value);
  };

  const HandleForgetPassword = (e) => {
    setForgetPassword({ ...ForgetPassword, [e.target.name]: e.target.value });
  };

  const HandleChangePassword = () => {
    if (!ForgetPassword.type || !ForgetPassword.email) {
      return notify("Please fill all fields");
    }
    const data = {
      ...ForgetPassword,
      type: ForgetPassword.type === "Manager" ? "nurse" : ForgetPassword.type,
    };
    setforgetLoading(true);
    dispatch(forgetPassword(data)).then((res) => {
      setforgetLoading(false);
      if (res.message === "User not found") {
        return notify("User Not Found");
      }
      setForgetPassword({ type: "", email: "" });
      onClose();
      return notify("Account Details Sent");
    });
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="light" />
      <div className="min-h-screen flex flex-col lg:flex-row bg-gray-100">
        {/* Left Banner Section */}
        <div className="lg:w-1/2 bg-blue-600 flex items-center justify-center p-4">
          <img
            src={banner}
            alt="MediPlus Banner"
            className="max-w-full max-h-[80vh] object-contain"
          />
        </div>

        {/* Right Login Section */}
        <div className="lg:w-1/2 flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 md:p-8">
            <div className="text-center mb-6">
              <img
                src={admin}
                alt="Profile"
                className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-blue-100"
              />
              <h1 className="text-3xl font-bold text-gray-900">Welcome to MediPlus</h1>
              <p className="text-gray-600 mt-2">Login to manage your diagnostic center</p>
            </div>

            {/* Role Selection */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex rounded-md shadow-sm" role="group">
                {["Manager", "Admin"].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => placementChange({ target: { value: role } })}
                    className={`px-4 py-2 text-sm font-medium border border-gray-200 transition-colors duration-200 ${
                      placement === role
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    } ${role === "Manager" ? "rounded-l-md" : "rounded-r-md"}`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={HandleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {placement} ID
                </label>
                <input
                  type="number"
                  name="ID"
                  value={formvalue.ID}
                  onChange={Handlechange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`Enter ${placement} ID`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formvalue.password}
                  onChange={Handlechange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
              </div>
              <button
                type="submit"
                disabled={Loading}
                className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {Loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Loading...
                  </>
                ) : (
                  "Login"
                )}
              </button>
              <p className="text-center text-sm text-gray-600 mt-4">
                Forgot Password?{" "}
                <button
                  type="button"
                  onClick={showDrawer}
                  className="text-blue-600 hover:underline"
                >
                  Reset via Email
                </button>
              </p>
            </form>
          </div>
        </div>

        {/* Forget Password Modal */}
        {open && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Reset Password</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User Type
                  </label>
                  <select
                    name="type"
                    value={ForgetPassword.type}
                    onChange={HandleForgetPassword}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select User Type</option>
                    <option value="Manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={ForgetPassword.email}
                    onChange={HandleForgetPassword}
                    required
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="example@mail.com"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={HandleChangePassword}
                    disabled={forgetLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center"
                  >
                    {forgetLoading ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 mr-2 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Loading...
                      </>
                    ) : (
                      "Send Mail"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DLogin;