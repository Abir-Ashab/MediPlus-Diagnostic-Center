import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { useSelector } from "react-redux";
import Sidebar from "../../GlobalFiles/Sidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [testOrders, setTestOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("doctors");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("view"); // view, edit
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedUserType, setSelectedUserType] = useState(null);
  const [formData, setFormData] = useState({});

  const {
    data: { user },
  } = useSelector((state) => state.auth);

  const isAdmin = user?.userType === "admin";

  useEffect(() => {
    if (isAdmin) {
      fetchAllData();
    }
  }, [isAdmin]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchDoctors(),
        fetchBrokers(),
        fetchNurses(),
        fetchAdmins(),
        fetchAllTestOrders(),
      ]);
    } catch (error) {
      toast.error("Error fetching data");
    }
    setLoading(false);
  };

  const fetchDoctors = async () => {
    try {
      const response = await axios.get("https://medi-plus-diagnostic-center-bdbv.vercel.app/doctors");
      setDoctors(response.data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const fetchBrokers = async () => {
    try {
      const response = await axios.get("https://medi-plus-diagnostic-center-bdbv.vercel.app/brokers");
      setBrokers(response.data);
    } catch (error) {
      console.error("Error fetching brokers:", error);
    }
  };

  const fetchNurses = async () => {
    try {
      const response = await axios.get("https://medi-plus-diagnostic-center-bdbv.vercel.app/nurses");
      setNurses(response.data);
    } catch (error) {
      console.error("Error fetching nurses:", error);
    }
  };

  const fetchAdmins = async () => {
    try {
      const response = await axios.get("https://medi-plus-diagnostic-center-bdbv.vercel.app/admin");
      setAdmins(response.data);
    } catch (error) {
      console.error("Error fetching admins:", error);
    }
  };

  const fetchAllTestOrders = async () => {
    try {
      const response = await axios.get("https://medi-plus-diagnostic-center-bdbv.vercel.app/testorders");
      setTestOrders(response.data);
    } catch (error) {
      console.error("Error fetching test orders:", error);
    }
  };

  const handleDelete = async (record, userType) => {
    try {
      let endpoint = "";
      let idField = "";

      switch (userType) {
        case "doctor":
          endpoint = "doctors";
          idField = record._id;
          break;
        case "nurse":
          endpoint = "nurses";
          idField = record._id;
          break;
        case "broker":
          endpoint = "brokers";
          idField = record._id;
          break;
        case "admin":
          endpoint = "admin";
          idField = record._id;
          break;
        case "testorder":
          endpoint = "testOrders";
          idField = record._id;
          break;
        default:
          return;
      }

      await axios.delete(`https://medi-plus-diagnostic-center-bdbv.vercel.app/${endpoint}/${idField}`);
      toast.success(`${userType} deleted successfully`);
      fetchAllData();
    } catch (error) {
      toast.error(`Error deleting ${userType}`);
      console.error("Delete error:", error);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      let endpoint = "";
      let idField = "";

      switch (selectedUserType) {
        case "doctor":
          endpoint = "doctors";
          idField = selectedRecord._id;
          break;
        case "nurse":
          endpoint = "nurses";
          idField = selectedRecord._id;
          break;
        case "broker":
          endpoint = "brokers";
          idField = selectedRecord._id;
          break;
        case "admin":
          endpoint = "admin";
          idField = selectedRecord._id;
          break;
        case "testOrders":
          endpoint = "testOrders";
          idField = selectedRecord._id;
          break;
        default:
          return;
      }

      const formattedData = { ...formData };
      if (formattedData.DOB) {
        formattedData.DOB = moment(formattedData.DOB, 'YYYY-MM-DD').format('YYYY-MM-DD');
      }

      await axios.put(`https://medi-plus-diagnostic-center-bdbv.vercel.app/${endpoint}/${idField}`, formattedData);
      toast.success(`${selectedUserType} updated successfully`);
      setIsModalOpen(false);
      setSelectedRecord(null);
      setSelectedUserType(null);
      setFormData({});
      fetchAllData();
    } catch (error) {
      toast.error(`Error updating ${selectedUserType}`);
      console.error("Update error:", error);
    }
  };

  const openModal = (type, record, userType) => {
    setModalType(type);
    setSelectedRecord(record);
    setSelectedUserType(userType);
    setIsModalOpen(true);

    if (type === "edit" && record) {
      const formData = { ...record };
      if (formData.DOB) {
        formData.DOB = moment(formData.DOB).format('YYYY-MM-DD');
      }
      setFormData(formData);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
    setSelectedUserType(null);
    setFormData({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const getActionButtons = (record, userType) => (
    <div className="flex space-x-2">
      <button
        onClick={() => openModal("view", record, userType)}
        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        View
      </button>
      <button
        onClick={() => openModal("edit", record, userType)}
        className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Edit
      </button>
      <button
        onClick={() => {
          if (window.confirm(`Are you sure you want to delete this ${userType}?`)) {
            handleDelete(record, userType);
          }
        }}
        className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Delete
      </button>
    </div>
  );

  const doctorColumns = [
    { key: "image", label: "Image", render: (record) => (
      <img
        src={record.image || "https://res.cloudinary.com/diverse/image/upload/v1674562453/diverse/oipm1ecb1yudf9eln7az.jpg"}
        alt="avatar"
        className="w-10 h-10 rounded-full"
      />
    )},
    { key: "docID", label: "ID", render: (record) => record.docID },
    { key: "docName", label: "Name", render: (record) => record.docName },
    { key: "department", label: "Department", render: (record) => record.department },
    { key: "email", label: "Email", render: (record) => record.email },
    { key: "mobile", label: "Mobile", render: (record) => record.mobile },
    { key: "actions", label: "Actions", render: (record) => getActionButtons(record, "doctor") },
  ];

  const nurseColumns = [
    { key: "image", label: "Image", render: (record) => (
      <img
        src={record.image || "https://res.cloudinary.com/diverse/image/upload/v1674562453/diverse/oipm1ecb1yudf9eln7az.jpg"}
        alt="avatar"
        className="w-10 h-10 rounded-full"
      />
    )},
    { key: "nurseID", label: "ID", render: (record) => record.nurseID },
    { key: "nurseName", label: "Name", render: (record) => record.nurseName },
    { key: "email", label: "Email", render: (record) => record.email },
    { key: "mobile", label: "Mobile", render: (record) => record.mobile },
    { key: "education", label: "Education", render: (record) => record.education },
    { key: "actions", label: "Actions", render: (record) => getActionButtons(record, "nurse") },
  ];

  const brokerColumns = [
    { key: "image", label: "Image", render: (record) => (
      <img
        src={record.image || "https://res.cloudinary.com/diverse/image/upload/v1674562453/diverse/oipm1ecb1yudf9eln7az.jpg"}
        alt="avatar"
        className="w-10 h-10 rounded-full"
      />
    )},
    { key: "brokerID", label: "ID", render: (record) => record.brokerID },
    { key: "name", label: "Name", render: (record) => record.name },
    { key: "email", label: "Email", render: (record) => record.email },
    { key: "mobile", label: "Mobile", render: (record) => record.mobile },
    { key: "status", label: "Status", render: (record) => (
      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${record.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {record.status?.toUpperCase() || "ACTIVE"}
      </span>
    )},
    { key: "commissionRate", label: "Commission Rate", render: (record) => `${record.commissionRate || 0}%` },
    { key: "actions", label: "Actions", render: (record) => getActionButtons(record, "broker") },
  ];

  const adminColumns = [
    { key: "image", label: "Image", render: (record) => (
      <img
        src={record.image || "https://res.cloudinary.com/diverse/image/upload/v1674562453/diverse/oipm1ecb1yudf9eln7az.jpg"}
        alt="avatar"
        className="w-10 h-10 rounded-full"
      />
    )},
    { key: "adminID", label: "ID", render: (record) => record.adminID },
    { key: "adminName", label: "Name", render: (record) => record.adminName },
    { key: "email", label: "Email", render: (record) => record.email },
    { key: "mobile", label: "Mobile", render: (record) => record.mobile },
    { key: "education", label: "Education", render: (record) => record.education },
    { key: "actions", label: "Actions", render: (record) => getActionButtons(record, "admin") },
  ];

  const testorderColumns = [
    { key: "patientName", label: "Patient Name", render: (record) => record.patientName },
    { key: "age", label: "Age", render: (record) => record.age },
    { key: "gender", label: "Gender", render: (record) => record.gender },
    { key: "disease", label: "Disease", render: (record) => record.disease },
    { key: "doctorName", label: "Doctor", render: (record) => record.doctorName },
    { key: "date", label: "Date", render: (record) => record.date },
    { key: "time", label: "Time", render: (record) => record.time },
    { key: "totalAmount", label: "Total Amount", render: (record) => `₹${record.totalAmount}` },
    { key: "actions", label: "Actions", render: (record) => getActionButtons(record, "testorder") },
  ];

  const renderEditForm = () => {
    if (!selectedRecord || !selectedUserType) return null;

    const commonFields = (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email || ""}
            onChange={handleInputChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
          <input
            type="text"
            name="mobile"
            value={formData.mobile || ""}
            onChange={handleInputChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
          <input
            type="number"
            name="age"
            value={formData.age || ""}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
          <select
            name="gender"
            value={formData.gender || ""}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <textarea
            name="address"
            value={formData.address || ""}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
          <input
            type="date"
            name="DOB"
            value={formData.DOB || ""}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    );

    switch (selectedUserType) {
      case "doctor":
        return (
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Name</label>
                <input
                  type="text"
                  name="docName"
                  value={formData.docName || ""}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department || ""}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                <input
                  type="text"
                  name="education"
                  value={formData.education || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Blood Group</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>
            {commonFields}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
              <textarea
                name="details"
                value={formData.details || ""}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Update
              </button>
            </div>
          </form>
        );
      case "nurse":
        return (
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nurse Name</label>
                <input
                  type="text"
                  name="nurseName"
                  value={formData.nurseName || ""}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                <input
                  type="text"
                  name="education"
                  value={formData.education || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Blood Group</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>
            </div>
            {commonFields}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
              <textarea
                name="details"
                value={formData.details || ""}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Update
              </button>
            </div>
          </form>
        );
      case "broker":
        return (
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Broker Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={formData.status || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Commission Rate (%)</label>
                <input
                  type="number"
                  name="commissionRate"
                  value={formData.commissionRate || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            {commonFields}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                name="notes"
                value={formData.notes || ""}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Update
              </button>
            </div>
          </form>
        );
      case "admin":
        return (
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Admin Name</label>
                <input
                  type="text"
                  name="adminName"
                  value={formData.adminName || ""}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                <input
                  type="text"
                  name="education"
                  value={formData.education || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            {commonFields}
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Update
              </button>
            </div>
          </form>
        );
      default:
        return null;
    }
  };

  const renderViewDetails = () => {
    if (!selectedRecord || !selectedUserType) return null;

    const getDescription = () => {
      switch (selectedUserType) {
        case "doctor":
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><strong>Doctor ID:</strong> {selectedRecord.docID}</div>
              <div><strong>Name:</strong> {selectedRecord.docName}</div>
              <div><strong>Department:</strong> {selectedRecord.department}</div>
              <div><strong>Email:</strong> {selectedRecord.email}</div>
              <div><strong>Mobile:</strong> {selectedRecord.mobile}</div>
              <div><strong>Age:</strong> {selectedRecord.age}</div>
              <div><strong>Gender:</strong> {selectedRecord.gender}</div>
              <div><strong>Blood Group:</strong> {selectedRecord.bloodGroup}</div>
              <div><strong>Date of Birth:</strong> {selectedRecord.DOB}</div>
              <div><strong>Address:</strong> {selectedRecord.address}</div>
              <div><strong>Education:</strong> {selectedRecord.education}</div>
              <div className="col-span-2"><strong>Details:</strong> {selectedRecord.details}</div>
            </div>
          );
        case "nurse":
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><strong>Nurse ID:</strong> {selectedRecord.nurseID}</div>
              <div><strong>Name:</strong> {selectedRecord.nurseName}</div>
              <div><strong>Email:</strong> {selectedRecord.email}</div>
              <div><strong>Mobile:</strong> {selectedRecord.mobile}</div>
              <div><strong>Age:</strong> {selectedRecord.age}</div>
              <div><strong>Gender:</strong> {selectedRecord.gender}</div>
              <div><strong>Blood Group:</strong> {selectedRecord.bloodGroup}</div>
              <div><strong>Date of Birth:</strong> {selectedRecord.DOB}</div>
              <div><strong>Address:</strong> {selectedRecord.address}</div>
              <div><strong>Education:</strong> {selectedRecord.education}</div>
              <div className="col-span-2"><strong>Details:</strong> {selectedRecord.details}</div>
            </div>
          );
        case "broker":
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><strong>Broker ID:</strong> {selectedRecord.brokerID}</div>
              <div><strong>Name:</strong> {selectedRecord.name}</div>
              <div><strong>Email:</strong> {selectedRecord.email}</div>
              <div><strong>Mobile:</strong> {selectedRecord.mobile}</div>
              <div><strong>Age:</strong> {selectedRecord.age}</div>
              <div><strong>Gender:</strong> {selectedRecord.gender}</div>
              <div><strong>Address:</strong> {selectedRecord.address}</div>
              <div><strong>Commission Rate:</strong> {selectedRecord.commissionRate}%</div>
              <div><strong>Status:</strong> {selectedRecord.status}</div>
              <div><strong>Referrals:</strong> {selectedRecord.referrals}</div>
              <div><strong>Total Commission:</strong> ₹{selectedRecord.totalCommission}</div>
              <div><strong>Date Joined:</strong> {selectedRecord.dateJoined ? new Date(selectedRecord.dateJoined).toLocaleDateString() : 'N/A'}</div>
              <div className="col-span-2"><strong>Notes:</strong> {selectedRecord.notes}</div>
            </div>
          );
        case "admin":
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><strong>Admin ID:</strong> {selectedRecord.adminID}</div>
              <div><strong>Name:</strong> {selectedRecord.adminName}</div>
              <div><strong>Email:</strong> {selectedRecord.email}</div>
              <div><strong>Mobile:</strong> {selectedRecord.mobile}</div>
              <div><strong>Age:</strong> {selectedRecord.age}</div>
              <div><strong>Gender:</strong> {selectedRecord.gender}</div>
              <div><strong>Date of Birth:</strong> {selectedRecord.DOB}</div>
              <div><strong>Address:</strong> {selectedRecord.address}</div>
              <div><strong>Education:</strong> {selectedRecord.education}</div>
            </div>
          );
        case "testorder":
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><strong>Patient ID:</strong> {selectedRecord.patientID}</div>
              <div><strong>Patient Name:</strong> {selectedRecord.patientName}</div>
              <div><strong>Age:</strong> {selectedRecord.age}</div>
              <div><strong>Gender:</strong> {selectedRecord.gender}</div>
              <div><strong>Email:</strong> {selectedRecord.email}</div>
              <div><strong>Mobile:</strong> {selectedRecord.mobile}</div>
              <div><strong>Disease:</strong> {selectedRecord.disease}</div>
              <div><strong>Doctor:</strong> {selectedRecord.doctorName}</div>
              <div><strong>Broker:</strong> {selectedRecord.brokerName}</div>
              <div><strong>Address:</strong> {selectedRecord.address}</div>
              <div><strong>Date:</strong> {selectedRecord.date}</div>
              <div><strong>Time:</strong> {selectedRecord.time}</div>
              <div><strong>Total Amount:</strong> ₹{selectedRecord.totalAmount}</div>
              <div><strong>Hospital Revenue:</strong> ₹{selectedRecord.hospitalRevenue}</div>
              <div><strong>Doctor Revenue:</strong> ₹{selectedRecord.doctorRevenue}</div>
              <div><strong>Broker Revenue:</strong> ₹{selectedRecord.brokerRevenue}</div>
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div className="text-center">
        <img
          src={selectedRecord.image || "https://res.cloudinary.com/diverse/image/upload/v1674562453/diverse/oipm1ecb1yudf9eln7az.jpg"}
          alt="avatar"
          className="w-24 h-24 rounded-full mx-auto mb-4"
        />
        <h2 className="text-xl font-semibold text-gray-900">
          {selectedRecord.docName || selectedRecord.nurseName || selectedRecord.name || selectedRecord.adminName || selectedRecord.patientName || "User"}
        </h2>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">{getDescription()}</div>
      </div>
    );
  };

  const renderTable = (columns, data) => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            {columns.map((col) => (
              <th key={col.key} className="p-3 text-left text-sm font-semibold text-gray-700">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.slice(0, 10).map((record, index) => (
            <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              {columns.map((col) => (
                <td key={col.key} className="p-3 border-b border-gray-200">
                  {col.render(record)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length > 10 && (
        <p className="text-center text-gray-600 mt-4">Showing 10 of {data.length} records</p>
      )}
    </div>
  );

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 p-4 md:p-8 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">Only administrators can access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar onCollapse={setSidebarCollapsed} />
        <div className={`flex-1 p-6 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-0'}`}>
          <div className="flex-1 p-6 ml-40">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Control Users - Admin Panel
            </h1>
            {loading ? (
              <div className="text-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading user data...</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex border-b border-gray-200 mb-6">
                  <button
                    className={`px-4 py-2 font-medium text-sm flex items-center ${activeTab === "doctors" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                    onClick={() => setActiveTab("doctors")}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Doctors ({doctors.length})
                  </button>
                  <button
                    className={`px-4 py-2 font-medium text-sm flex items-center ${activeTab === "nurses" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                    onClick={() => setActiveTab("nurses")}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Managers ({nurses.length})
                  </button>
                  <button
                    className={`px-4 py-2 font-medium text-sm flex items-center ${activeTab === "brokers" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                    onClick={() => setActiveTab("brokers")}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Brokers ({brokers.length})
                  </button>
                  <button
                    className={`px-4 py-2 font-medium text-sm flex items-center ${activeTab === "admins" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                    onClick={() => setActiveTab("admins")}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Admins ({admins.length})
                  </button>
                  <button
                    className={`px-4 py-2 font-medium text-sm flex items-center ${activeTab === "testOrders" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                    onClick={() => setActiveTab("testOrders")}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Test Orders ({testOrders.length})
                  </button>
                </div>
                {activeTab === "doctors" && renderTable(doctorColumns, doctors)}
                {activeTab === "nurses" && renderTable(nurseColumns, nurses)}
                {activeTab === "brokers" && renderTable(brokerColumns, brokers)}
                {activeTab === "admins" && renderTable(adminColumns, admins)}
                {activeTab === "testOrders" && renderTable(testorderColumns, testOrders)}
              </div>
            )}
          </div>
        </div>
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
            <div className={`bg-white rounded-lg p-6 ${modalType === "view" ? "w-full max-w-3xl" : "w-full max-w-2xl"} max-h-[90vh] overflow-y-auto`}>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {modalType === "view" ? `View ${selectedUserType?.charAt(0).toUpperCase() + selectedUserType?.slice(1)} Details` : `Edit ${selectedUserType?.charAt(0).toUpperCase() + selectedUserType?.slice(1)}`}
              </h2>
              {modalType === "view" ? renderViewDetails() : renderEditForm()}
              {modalType === "view" && (
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminDashboard;