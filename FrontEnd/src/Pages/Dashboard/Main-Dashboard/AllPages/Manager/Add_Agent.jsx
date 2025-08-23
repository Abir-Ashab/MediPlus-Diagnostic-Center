import React, { useState } from "react";
import { User, Phone, Mail, Calendar, MapPin, Lock, Info, Activity, UserPlus } from 'lucide-react';
import NarayanganjAddressSelect from "../../../../../Components/AddressAutocomplete";
import agentAvatar from "../../../../../img/profile.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "../../GlobalFiles/Sidebar";

const notify = (text) => toast(text);

const AddAgent = () => {
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const initData = {
    name: "",
    age: "",
    mobile: "",
    email: "",
    gender: "",
    address: "",
    agentID: Date.now(),
    password: "password123", // Default password
  // commissionRate removed
    status: "active",
    notes: "",
  };
  const [AgentValue, setAgentValue] = useState(initData);

  const HandleAgentChange = (e) => {
    setAgentValue({ ...AgentValue, [e.target.name]: e.target.value });
  };

  const HandleAgentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch("https://medi-plus-diagnostic-center-bdbv.vercel.app/agents/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(AgentValue),
      });
      
      const data = await response.json();
      
      if (data.message === "Agent already exists") {
        notify("Agent Already Exists");
      } else {
        notify("Agent Added Successfully");
        console.log("AGENT REGISTERED:", data);
        // Reset form after successful submission
        setAgentValue(initData);
      }
    } catch (error) {
      console.error("Error adding agent:", error);
      notify("Something went wrong, Please try Again");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar onCollapse={setSidebarCollapsed} />
        <div className={`flex-1 p-6 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-0'}`}>
          <div className="flex-1 p-6 ml-40">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <UserPlus className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Add Agent</h1>
                  <p className="text-gray-600">Register a new agent to the system</p>
                </div>
              </div>
              <div className="w-32 h-32 mx-auto mt-4 rounded-full border-2 border-blue-200 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center overflow-hidden">
                <img src={agentAvatar} alt="Agent Avatar" className="w-full h-full object-cover" />
              </div>
            </div>

            <form onSubmit={HandleAgentSubmit} className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Agent Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Full Name"
                        name="name"
                        value={AgentValue.name}
                        onChange={HandleAgentChange}
                        required
                        className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age *</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        placeholder="Age"
                        name="age"
                        value={AgentValue.age}
                        onChange={HandleAgentChange}
                        required
                        className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        max="150"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        placeholder="Mobile Number"
                        name="mobile"
                        value={AgentValue.mobile}
                        onChange={HandleAgentChange}
                        required
                        className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        placeholder="abc@abc.com"
                        name="email"
                        value={AgentValue.email}
                        onChange={HandleAgentChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                    <select
                      name="gender"
                      value={AgentValue.gender}
                      onChange={HandleAgentChange}
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Choose Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                    <NarayanganjAddressSelect
                      value={AgentValue.address}
                      onChange={val => setAgentValue({ ...AgentValue, address: val })}
                      placeholder="Type to search or select address in Narayanganj..."
                    />
                  </div>
                </div>
              </div>


              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-8 py-2 font-medium rounded-md shadow-sm transition-all duration-200 ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {loading ? 'Loading...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddAgent;