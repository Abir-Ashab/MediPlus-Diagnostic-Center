import React, { useState, useRef, useEffect } from "react";
import NarayanganjAddressSelect from "../../../../../Components/AddressAutocomplete";
import doctor from "../../../../../img/doctoravatar.png";
import { useDispatch, useSelector } from "react-redux";
import { DoctorRegister, SendPassword } from "../../../../../Redux/auth/action";
import Sidebar from "../../GlobalFiles/Sidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Navigate } from "react-router-dom";
import { User, Phone, Mail, Calendar, MapPin, Book, Stethoscope, Lock, Info } from 'lucide-react';

const notify = (text) => toast(text);

const AddDoctor = () => {
  const { data } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const initData = {
    docName: "",
    age: "",
    mobile: "",
    email: "",
    bloodGroup: "",
    gender: "",
    DOB: "",
    address: "",
    education: "",
    department: "",
    docID: Date.now(),
    password: "password123",
    details: "",
  // remuneration and testReferralCommission removed
  };
  const [DoctorValue, setDoctorValue] = useState(initData);
  const [deptSearch, setDeptSearch] = useState("");
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [showOtherDepartment, setShowOtherDepartment] = useState(false);
  const deptDropdownRef = useRef(null);

  const departmentOptions = [
    "General",
    "Cardiology",
    "Neurology",
    "ENT",
    "Ophthalmologist",
    "Anesthesiologist",
    "Dermatologist",
    "Oncologist",
    "Psychiatrist",
    "Orthopedics",
    "Pediatrics",
    "Radiology",
    "Pathology",
    "Gastroenterology",
    "Nephrology",
    "Urology",
    "Pulmonology",
    "Endocrinology",
    "Rheumatology",
    "Plastic Surgery",
    "Emergency Medicine",
    "Family Medicine",
    "Obstetrics & Gynecology",
    "Hematology",
    "Infectious Disease",
    "Other"
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (deptDropdownRef.current && !deptDropdownRef.current.contains(event.target)) {
        setShowDeptDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const HandleDoctorChange = (e) => {
    setDoctorValue({ ...DoctorValue, [e.target.name]: e.target.value });
  };

  const HandleDoctorSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    dispatch(DoctorRegister(DoctorValue)).then((res) => {
      if (res.message === "Doctor already exists") {
        setLoading(false);
        return notify("Doctor Already Exist");
      }
      if (res.message === "error") {
        setLoading(false);
        return notify("Something went wrong, Please try Again");
      }
      let data = {
        email: res.data.email,
        password: res.data.password,
        userId: res.data.docID,
      };
      console.log(data, "DOCTOR REGISTER SUCCESSFULLY");
      dispatch(SendPassword(data)).then((res) => notify("DOCTOR REGISTER SUCCESSFULLY"));
      setLoading(false);
      setDoctorValue(initData);
    });
  };

  if (data?.isAuthticated === false) {
    return <Navigate to="/" />;
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar onCollapse={setSidebarCollapsed} />
        <div className={`flex-1 p-6 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-0'}`}>
          <div className="flex-1 p-6 ml-40">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Add Doctor</h1>
                  <p className="text-gray-600">Register a new doctor to the system</p>
                </div>
              </div>
              <img src={doctor} alt="doctor" className="w-32 h-32 mx-auto mt-4 rounded-full border-2 border-blue-200" />
            </div>

            <form onSubmit={HandleDoctorSubmit} className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Doctor Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Full Name"
                        name="docName"
                        value={DoctorValue.docName}
                        onChange={HandleDoctorChange}
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
                        value={DoctorValue.age}
                        onChange={HandleDoctorChange}
                        required
                        className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        max="150"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Number *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        placeholder="Emergency Number"
                        name="mobile"
                        value={DoctorValue.mobile}
                        onChange={HandleDoctorChange}
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
                        value={DoctorValue.email}
                        onChange={HandleDoctorChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                    <select
                      name="gender"
                      value={DoctorValue.gender}
                      onChange={HandleDoctorChange}
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Choose Gender">Choose Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group *</label>
                    <select
                      name="bloodGroup"
                      value={DoctorValue.bloodGroup}
                      onChange={HandleDoctorChange}
                      required
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Choose Blood Group">Select</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Birthdate </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        name="DOB"
                        value={DoctorValue.DOB}
                        onChange={HandleDoctorChange}
                        className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                    <NarayanganjAddressSelect
                      value={DoctorValue.address}
                      onChange={val => setDoctorValue({ ...DoctorValue, address: val })}
                      placeholder="Type to search or select address in Narayanganj..."
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Education *</label>
                    <div className="relative">
                      <Book className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="e.g. MBBS"
                        name="education"
                        value={DoctorValue.education}
                        onChange={HandleDoctorChange}
                        required
                        className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                    <div className="relative" ref={deptDropdownRef}>
                      <input
                        type="text"
                        name="department"
                        placeholder="Type or select department..."
                        value={showOtherDepartment ? "Other" : (deptSearch || DoctorValue.department)}
                        onChange={e => {
                          setDeptSearch(e.target.value);
                          setShowDeptDropdown(true);
                          setShowOtherDepartment(false);
                          setDoctorValue({ ...DoctorValue, department: e.target.value });
                        }}
                        onFocus={() => setShowDeptDropdown(true)}
                        autoComplete="off"
                        required
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {showDeptDropdown && !showOtherDepartment && (
                        <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto mt-1">
                          {departmentOptions.filter(dept => dept.toLowerCase().includes((deptSearch || "").toLowerCase())).length > 0 ? (
                            departmentOptions.filter(dept => dept.toLowerCase().includes((deptSearch || "").toLowerCase())).map((dept, idx) => (
                              <div
                                key={dept}
                                className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm"
                                onClick={() => {
                                  setDoctorValue({ ...DoctorValue, department: dept });
                                  setDeptSearch("");
                                  setShowDeptDropdown(false);
                                  if (dept === "Other") setShowOtherDepartment(true);
                                  else setShowOtherDepartment(false);
                                }}
                              >
                                {dept}
                              </div>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-gray-500 text-sm">No matching department</div>
                          )}
                        </div>
                      )}
                    </div>
                    {showOtherDepartment && (
                      <input
                        type="text"
                        name="department"
                        placeholder="Enter department name"
                        value={DoctorValue.department === "Other" ? "" : DoctorValue.department}
                        onChange={e => setDoctorValue({ ...DoctorValue, department: e.target.value })}
                        className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    )}
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
    </>
  );
};

export default AddDoctor;