import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AdminRegister, SendPassword } from "../../../../../Redux/auth/action";
import Sidebar from "../../GlobalFiles/Sidebar";
import admin from "../../../../../img/admin.jpg";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Navigate } from "react-router-dom";
const notify = (text) => toast(text);

const Add_Admin = () => {
  const { data } = useSelector((store) => store.auth);

  const [loading, setloading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const InitData = {
    adminName: "",
    age: "",
    mobile: "",
    email: "",
    gender: "",
    DOB: "",
    address: "",
    education: "",
    adminID: Date.now(),
    password: "",
  };
  const [AdminValue, setAdminValue] = useState(InitData);

  const HandleDoctorChange = (e) => {
    setAdminValue({ ...AdminValue, [e.target.name]: e.target.value });
  };
  const dispatch = useDispatch();

  const HandleDoctorSubmit = (e) => {
    e.preventDefault();
    setloading(true);
    dispatch(AdminRegister(AdminValue)).then((res) => {
      if (res.message === "Admin already exists") {
        setloading(false);
        return notify("Admin Already Exist");
      }
      if (res.message === "error") {
        setloading(false);
        return notify("Something went wrong, Please try Again");
      }
      notify("Admin Added");

      let data = {
        email: res.data.email,
        password: res.data.password,
        userId: res.data.adminID,
      };
      dispatch(SendPassword(data)).then((res) => notify("Account Detais Sent"));
      setloading(false);
      setAdminValue(InitData);
    });
  };

  if (data?.isAuthticated === false) {
    return <Navigate to={"/"} />;
  }

  if (data?.user.userType !== "admin") {
    return <Navigate to={"/dashboard"} />;
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar onCollapse={setSidebarCollapsed} />
        <div className={`flex-1 p-6 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-0'}`}>
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">Add Admin</h1>
            <div className="flex justify-center mb-8">
              <img src={admin} alt="doctor" className="w-24 h-24 rounded-full object-cover border-4 border-blue-500" />
            </div>
            <form onSubmit={HandleDoctorSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <div>
                  <input
                    type="text"
                    placeholder="Full Name"
                    name="adminName"
                    value={AdminValue.adminName}
                    onChange={HandleDoctorChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                <div>
                  <input
                    type="number"
                    placeholder="Age"
                    name="age"
                    value={AdminValue.age}
                    onChange={HandleDoctorChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number</label>
                <div>
                  <input
                    type="number"
                    placeholder="Emergency Number"
                    name="mobile"
                    value={AdminValue.mobile}
                    onChange={HandleDoctorChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div>
                  <input
                    type="email"
                    placeholder="abc@abc.com"
                    name="email"
                    value={AdminValue.email}
                    onChange={HandleDoctorChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <div>
                  <select
                    name="gender"
                    value={AdminValue.gender}
                    onChange={HandleDoctorChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Choose Gender">Choose Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Birthdate</label>
                <div>
                  <input
                    type="date"
                    placeholder="dd-mm-yy"
                    name="DOB"
                    value={AdminValue.DOB}
                    onChange={HandleDoctorChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <div>
                  <input
                    type="text"
                    placeholder="Address"
                    name="address"
                    value={AdminValue.address}
                    onChange={HandleDoctorChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
                <div>
                  <input
                    type="text"
                    placeholder="eg.MBBS"
                    name="education"
                    value={AdminValue.education}
                    onChange={HandleDoctorChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div>
                  <input
                    type="text"
                    placeholder="Password"
                    name="password"
                    value={AdminValue.password}
                    onChange={HandleDoctorChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? "Loading..." : "Submit"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Add_Admin;