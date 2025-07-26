import React, { useState } from "react";
import { BiTime } from "react-icons/bi";
import { GiMeditation } from "react-icons/gi";
import { AiFillCalendar, AiFillEdit } from "react-icons/ai";
import { MdBloodtype, MdOutlineCastForEducation } from "react-icons/md";
import { BsFillTelephoneFill, BsHouseFill, BsGenderAmbiguous } from "react-icons/bs";
import { FaRegHospital, FaMapMarkedAlt, FaBirthdayCake, FaUser } from "react-icons/fa";
import Sidebar from "../../GlobalFiles/Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { Button, message, Modal } from "antd";
import { UpdateNurse } from "../../../../../Redux/auth/action";

const Manager_Profile = () => {
  const {
    data: { user },
  } = useSelector((state) => state.auth);

  console.log("user", user);
  
  const dispatch = useDispatch();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [formData, setFormData] = useState({
    nurseName: user.nurseName,
    age: user.age,
    gender: user.gender,
    bloodGroup: user.bloodGroup,
    education: user.education,
    mobile: user.mobile,
    DOB: user.DOB,
    ID: user._id,
  });

  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const showModal = () => {
    setOpen(true);
  };

  const handleOk = () => {
    setConfirmLoading(true);
    setTimeout(() => {
      setOpen(false);
      setConfirmLoading(false);
    }, 2000);
  };

  const [messageApi, contextHolder] = message.useMessage();

  const success = (text) => {
    messageApi.success(text);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = () => {
    dispatch(UpdateNurse(formData, user._id));
    success("user updated");
    handleOk();
  };

  return (
    <>
      {contextHolder}
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar onCollapse={setSidebarCollapsed} />
        <div className={`flex-1 p-6 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-0'}`}>
          <div className="flex-1 p-6 ml-40">
            <div className="mb-12 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-5 rounded-3xl"></div>
              <div className="relative z-10 p-8">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <FaUser className="text-white text-xl" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      Manager Profile
                    </h1>
                    <p className="text-slate-600 text-lg font-medium">Manage your professional information with ease</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Main Content */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Enhanced Profile Card */}
              <div className="xl:col-span-1">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
                  {/* Enhanced Profile Image */}
                  <div className="text-center mb-8">
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full blur opacity-30"></div>
                      <img
                        src={user?.image || "https://via.placeholder.com/150"}
                        alt="Profile"
                        className="relative w-40 h-40 rounded-full object-cover mx-auto border-4 border-white shadow-2xl"
                      />
                      <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-3 shadow-xl border-4 border-white">
                        <FaUser className="text-white text-lg" />
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-8"></div>

                  {/* Enhanced Quick Info */}
                  <div className="space-y-5">
                    <div className="group flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-100 hover:shadow-lg transition-all duration-300">
                      <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <GiMeditation className="text-white text-xl" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-500 font-medium">Full Name</p>
                        <p className="font-bold text-slate-800 text-lg">{user?.nurseName || "N/A"}</p>
                      </div>
                    </div>

                    <div className="group flex items-center space-x-4 p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl border border-red-100 hover:shadow-lg transition-all duration-300">
                      <div className="bg-gradient-to-br from-red-500 to-rose-500 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <MdBloodtype className="text-white text-xl" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-500 font-medium">Blood Group</p>
                        <p className="font-bold text-slate-800 text-lg">{user?.bloodGroup || "N/A"}</p>
                      </div>
                    </div>

                    <div className="group flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-100 hover:shadow-lg transition-all duration-300">
                      <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <FaBirthdayCake className="text-white text-xl" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-500 font-medium">Date of Birth</p>
                        <p className="font-bold text-slate-800 text-lg">{user?.DOB || "N/A"}</p>
                      </div>
                    </div>

                    <div className="group flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl border border-purple-100 hover:shadow-lg transition-all duration-300">
                      <div className="bg-gradient-to-br from-purple-500 to-violet-500 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <BsFillTelephoneFill className="text-white text-xl" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-500 font-medium">Mobile</p>
                        <p className="font-bold text-slate-800 text-lg">{user?.mobile || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Edit Button */}
                  <div className="mt-8">
                    <button 
                      onClick={showModal}
                      className="group w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 text-white py-4 px-6 rounded-2xl font-bold hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center space-x-3 shadow-xl hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      <AiFillEdit className="text-xl group-hover:rotate-12 transition-transform duration-300" />
                      <span className="relative z-10">Edit Profile</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Enhanced Details Section */}
              <div className="xl:col-span-2 space-y-8">
                {/* Enhanced Other Info Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 p-8 hover:shadow-2xl transition-all duration-500">
                  <div className="flex items-center space-x-4 mb-8">
                    <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
                      <MdOutlineCastForEducation className="text-white text-lg" />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                      Professional Information
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="group flex items-center space-x-4 p-5 bg-gradient-to-r from-slate-50 to-gray-50 rounded-2xl border border-slate-200 hover:shadow-lg transition-all duration-300">
                      <div className="bg-gradient-to-br from-slate-500 to-gray-600 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <BsGenderAmbiguous className="text-white text-xl" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-500 font-medium">Gender</p>
                        <p className="font-bold text-slate-800 text-lg capitalize">{user?.gender || "N/A"}</p>
                      </div>
                    </div>

                    <div className="group flex items-center space-x-4 p-5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-200 hover:shadow-lg transition-all duration-300">
                      <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <AiFillCalendar className="text-white text-xl" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-500 font-medium">Age</p>
                        <p className="font-bold text-slate-800 text-lg">{user?.age || "N/A"} years</p>
                      </div>
                    </div>

                    <div className="group flex items-center space-x-4 p-5 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl border border-indigo-200 hover:shadow-lg transition-all duration-300">
                      <div className="bg-gradient-to-br from-indigo-500 to-blue-500 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <MdOutlineCastForEducation className="text-white text-xl" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-500 font-medium">Education</p>
                        <p className="font-bold text-slate-800 text-lg">{user?.education || "N/A"}</p>
                      </div>
                    </div>

                    <div className="group flex items-center space-x-4 p-5 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-2xl border border-teal-200 hover:shadow-lg transition-all duration-300">
                      <div className="bg-gradient-to-br from-teal-500 to-cyan-500 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <BsHouseFill className="text-white text-xl" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-500 font-medium">Address</p>
                        <p className="font-bold text-slate-800 text-lg">{user?.address || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Modal */}
        <Modal
          title={
            <div className="flex items-center space-x-3 text-xl font-bold text-slate-800 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <AiFillEdit className="text-white text-sm" />
              </div>
              <span>Edit Profile Details</span>
            </div>
          }
          open={open}
          onOk={handleOk}
          confirmLoading={confirmLoading}
          onCancel={handleCancel}
          footer={[
            <Button 
              key="back" 
              onClick={handleCancel}
              className="bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200 font-semibold px-6 py-2 rounded-xl transition-all duration-300"
            >
              Cancel
            </Button>,
            <Button 
              key="submit" 
              onClick={handleFormSubmit}
              type="primary"
              loading={confirmLoading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-semibold px-6 py-2 rounded-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Save Changes
            </Button>,
          ]}
          width={700}
          className="custom-modal"
        >
          <div className="py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Full Name
                </label>
                <input
                  name="nurseName"
                  value={formData.nurseName}
                  onChange={handleFormChange}
                  type="text"
                  placeholder="Enter full name"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-slate-50 hover:bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Age
                </label>
                <input
                  name="age"
                  value={formData.age}
                  onChange={handleFormChange}
                  type="number"
                  placeholder="Enter age"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-slate-50 hover:bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Gender
                </label>
                <select 
                  name="gender" 
                  value={formData.gender}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-slate-50 hover:bg-white"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Others</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Blood Group
                </label>
                <input
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleFormChange}
                  type="text"
                  placeholder="Enter blood group"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-slate-50 hover:bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Education
                </label>
                <input
                  name="education"
                  value={formData.education}
                  onChange={handleFormChange}
                  type="text"
                  placeholder="Enter education details"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-slate-50 hover:bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Mobile Number
                </label>
                <input
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleFormChange}
                  type="tel"
                  placeholder="Enter mobile number"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-slate-50 hover:bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Date of Birth
                </label>
                <input
                  name="DOB"
                  value={formData.DOB}
                  onChange={handleFormChange}
                  type="date"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-slate-50 hover:bg-white"
                />
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default Manager_Profile;