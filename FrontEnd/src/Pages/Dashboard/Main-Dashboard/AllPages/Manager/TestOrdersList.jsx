import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../../../api";
import { Modal, Button, Input, Spin, Select, DatePicker, TimePicker } from "antd";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import { usePrintReport } from "../../../../../Components/PrintReport";
import Sidebar from "../../GlobalFiles/Sidebar";
import { TestCategories, TestsList } from "./MixedObjectData";
import PrintTestReport from "../../../../../Components/PrintReport/PrintTestReport";
import {
  Search,
  Eye,
  Trash2,
  Calendar,
  User,
  Phone,
  MapPin,
  Heart,
  DollarSign,
  Clock,
  ChevronLeft,
  ChevronRight,
  FileText,
  UserCheck,
  Building,
  Filter,
  Edit,
} from "lucide-react";
import moment from "moment";

const TestOrdersList = () => {
  const { data: { user } = {} } = useSelector((state) => state.auth || {});
  const { printReport } = usePrintReport();

  const getCurrentUserName = () => {
    if (!user) return "System";
    return (
      user.nurseName ||
      user.doctorName ||
      user.adminName ||
      user.name ||
      "Unknown User"
    );
  };

  const [testOrders, setTestOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("schedule");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({});
  const itemsPerPage = 10;

  const fetchTestOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
  `${API_BASE_URL}/testorders`
      );
      setTestOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching test orders:", error);
      toast.error("Error loading test orders: " + (error.message || "Unknown error"));
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestOrders();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(
  `${API_BASE_URL}/testorders/${orderId}/status`,
        {
          status: newStatus,
        }
      );
      toast.success(`Order status updated to ${newStatus}`);
      fetchTestOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    }
  };

  const deleteTestOrder = async (orderId) => {
    try {
      await axios.delete(
  `${API_BASE_URL}/testorders/${orderId}`
      );
      toast.success("Test order deleted successfully");
      setIsConfirmDeleteOpen(false);
      setOrderToDelete(null);
      fetchTestOrders();
    } catch (error) {
      console.error("Error deleting test order:", error);
      toast.error("Failed to delete test order");
    }
  };

  const handleEdit = async () => {
    try {
      const formattedData = {
        ...formData,
        date: formData.date ? moment(formData.date).format("YYYY-MM-DD") : undefined,
        time: formData.time ? moment(formData.time).format("HH:mm") : undefined,
        totalAmount: formData.baseAmount
          ? Number(formData.baseAmount) +
            (Number(formData.baseAmount) * Number(formData.vatRate || 1)) / 100 -
            Number(formData.discountAmount || 0)
          : formData.totalAmount,
        dueAmount: formData.totalAmount
          ? Number(formData.totalAmount) - Number(formData.paidAmount || 0)
          : formData.dueAmount,
      };
      await axios.put(
  `${API_BASE_URL}/testorders/${selectedOrder._id}`,
        formattedData
      );
      toast.success("Test order updated successfully");
      setIsEditModalVisible(false);
      setSelectedOrder(null);
      setFormData({});
      fetchTestOrders();
    } catch (error) {
      console.error("Error updating test order:", error);
      toast.error("Failed to update test order");
    }
  };

  const handlePrintReport = (order) => {
    printReport(order);
  };

  const filteredOrders = testOrders?.filter(
    (order) =>
      order.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.mobile &&
        typeof order.mobile === "string" &&
        order.mobile.includes(searchQuery)) ||
      order.doctorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.brokerName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedOrders = filteredOrders?.sort((a, b) => {
    if (sortBy === "schedule") {
      return new Date(a.date) - new Date(b.date);
    } else {
      const dateA = new Date(a.createdAt || a._id);
      const dateB = new Date(b.createdAt || b._id);
      return dateB - dateA;
    }
  });

  const totalPages = Math.ceil((sortedOrders?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = sortedOrders?.slice(startIndex, endIndex);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const handleEditClick = (order) => {
    setSelectedOrder(order);
    setFormData({
      patientName: order.patientName,
      age: order.age,
      gender: order.gender,
      email: order.email || "",
      mobile: order.mobile,
      disease: order.disease || "",
      doctorName: order.doctorName || "",
      brokerName: order.brokerName || "",
      address: order.address || "",
      date: moment(order.date).format("YYYY-MM-DD"),
      time: moment(order.time, "HH:mm"),
      baseAmount: order.baseAmount || 0,
      vatRate: order.vatRate || 1,
      vatAmount: order.vatAmount || 0,
      discountAmount: order.discountAmount || 0,
      paidAmount: order.paidAmount || 0,
      totalAmount: order.totalAmount,
      dueAmount: order.dueAmount || 0,
      hospitalRevenue: order.hospitalRevenue,
      doctorRevenue: order.doctorRevenue,
      brokerRevenue: order.brokerRevenue,
    });
    setIsEditModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedOrder(null);
  };

  const handleCloseEditModal = () => {
    setIsEditModalVisible(false);
    setSelectedOrder(null);
    setFormData({});
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, date });
  };

  const handleTimeChange = (time) => {
    setFormData({ ...formData, time });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-emerald-100 text-emerald-700";
      case "in progress":
        return "bg-amber-100 text-amber-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar onCollapse={setSidebarCollapsed} />
        <div
          className={`flex-1 p-6 transition-all duration-300 ${
            sidebarCollapsed ? "ml-20" : "ml-0"
          }`}
        >
          <div className="flex-1 p-6 ml-40">
            <div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900">Test Orders</h1>
                        <p className="text-gray-600">View and manage all test orders</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2">
                      <Search className="w-5 h-5 text-gray-400" />
                      <Input
                        placeholder="Search by name, email, mobile, doctor, or broker"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border-none bg-transparent focus:ring-0 focus:border-none"
                        style={{ width: 300, boxShadow: "none" }}
                      />
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2">
                      <Filter className="w-5 h-5 text-gray-400" />
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="border-none bg-transparent focus:ring-0 text-gray-700"
                      >
                        <option value="schedule">Sort by Schedule</option>
                        <option value="created">Sort by Created</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Total Orders</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {testOrders?.length || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Filtered Results</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {filteredOrders?.length || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <Search className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">Current Page</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {currentPage} of {totalPages}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-100 rounded-full">
                      <FileText className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Spin size="large" />
                    <p className="mt-4 text-gray-600">Loading test orders...</p>
                  </div>
                ) : (
                  <>
                    {currentOrders?.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16">
                        <div className="p-4 bg-gray-100 rounded-full mb-4">
                          <Calendar className="w-12 h-12 text-gray-400" />
                        </div>
                        <p className="text-gray-600 text-lg">No test orders found</p>
                        <p className="text-gray-500 text-sm mt-2">
                          Try adjusting your search criteria
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="hidden md:block overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="text-left p-4 font-semibold text-gray-700">
                                  Patient
                                </th>
                                <th className="text-left p-4 font-semibold text-gray-700">
                                  Contact
                                </th>
                                <th className="text-left p-4 font-semibold text-gray-700">
                                  Tests
                                </th>
                                <th className="text-left p-4 font-semibold text-gray-700">
                                  Doctor
                                </th>
                                <th className="text-left p-4 font-semibold text-gray-700">
                                  Broker
                                </th>
                                <th className="text-left p-4 font-semibold text-gray-700">
                                  Schedule
                                </th>
                                <th className="text-left p-4 font-semibold text-gray-700">
                                  Status
                                </th>
                                <th className="text-left p-4 font-semibold text-gray-700">
                                  Due Amount
                                </th>
                                <th className="text-left p-4 font-semibold text-gray-700">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {currentOrders?.map((order) => (
                                <tr
                                  key={order._id}
                                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                >
                                  <td className="p-4">
                                    <div className="flex items-center gap-3">
                                      <div className="p-2 bg-blue-100 rounded-full">
                                        <User className="w-4 h-4 text-blue-600" />
                                      </div>
                                      <div>
                                        <p className="font-medium text-gray-900">
                                          {order.patientName}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                          {order.age} years, {order.gender}
                                        </p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-700">
                                          {order.mobile}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-700">
                                          {order.email || "N/A"}
                                        </span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <div className="space-y-1">
                                      {order.tests &&
                                        order.tests.map((test, i) => (
                                          <div
                                            key={i}
                                            className="flex justify-between items-center"
                                          >
                                            <span className="text-sm text-gray-700">
                                              {test.testName}
                                            </span>
                                            <span className="text-sm text-gray-700">
                                              ৳{test.testPrice}
                                            </span>
                                          </div>
                                        ))}
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <div className="flex items-center gap-2">
                                      <UserCheck className="w-4 h-4 text-green-500" />
                                      <span className="text-sm text-gray-700">
                                        {order.doctorName || "N/A"}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <div className="flex items-center gap-2">
                                      <Building className="w-4 h-4 text-indigo-500" />
                                      <span className="text-sm text-gray-700">
                                        {order.brokerName || "N/A"}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-blue-500" />
                                        <span className="text-sm text-gray-700">
                                          {new Date(order.date).toLocaleDateString()}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-purple-500" />
                                        <span className="text-sm text-gray-700">
                                          {order.time}
                                        </span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="p-4">
                                    <button
                                      onClick={() => {
                                        const statuses = [
                                          "Pending",
                                          "In Progress",
                                          "Completed",
                                          "Cancelled",
                                        ];
                                        const currentIndex = statuses.findIndex(
                                          (s) =>
                                            s.toLowerCase() ===
                                            (order.status || "pending").toLowerCase()
                                        );
                                        const nextIndex = (currentIndex + 1) % statuses.length;
                                        updateOrderStatus(order._id, statuses[nextIndex]);
                                      }}
                                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium ${getStatusColor(
                                        order.status
                                      )}`}
                                    >
                                      {order.status || "Pending"}
                                    </button>
                                  </td>
                                  <td className="p-4">
                                    <span className="text-sm text-gray-700">
                                      ৳{order.dueAmount || 0}
                                    </span>
                                  </td>
                                  <td className="p-4">
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleViewDetails(order)}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors text-sm font-medium"
                                      >
                                        <Eye className="w-4 h-4" />
                                        View
                                      </button>
                                      <button
                                        onClick={() => handleEditClick(order)}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors text-sm font-medium"
                                      >
                                        <Edit className="w-4 h-4" />
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => handlePrintReport(order)}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors text-sm font-medium"
                                      >
                                        <FileText className="w-4 h-4" />
                                        Print
                                      </button>
                                      <PrintTestReport order={order} />
                                      <button
                                        onClick={() => {
                                          setOrderToDelete(order);
                                          setIsConfirmDeleteOpen(true);
                                        }}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors text-sm font-medium"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="md:hidden">
                          {currentOrders?.map((order) => (
                            <div
                              key={order._id}
                              className="p-4 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-blue-100 rounded-full">
                                    <User className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <div>
                                    <h3 className="font-medium text-gray-900">
                                      {order.patientName}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                      {order.age} years, {order.gender}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleViewDetails(order)}
                                    className="p-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleEditClick(order)}
                                    className="p-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handlePrintReport(order)}
                                    className="p-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors"
                                  >
                                    <FileText className="w-4 h-4" />
                                  </button>
                                  <PrintTestReport order={order} />
                                  <button
                                    onClick={() => {
                                      setOrderToDelete(order);
                                      setIsConfirmDeleteOpen(true);
                                    }}
                                    className="p-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Phone className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-700">{order.mobile}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Heart className="w-4 h-4 text-red-500" />
                                  <span className="text-sm text-gray-700">
                                    {order.disease || "N/A"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Building className="w-4 h-4 text-indigo-500" />
                                  <span className="text-sm text-gray-700">
                                    {order.brokerName || "N/A"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-blue-500" />
                                  <span className="text-sm text-gray-700">
                                    {new Date(order.date).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <DollarSign className="w-4 h-4 text-yellow-500" />
                                  <span className="text-sm text-gray-700">
                                    Due: ৳{order.dueAmount || 0}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {totalPages > 1 && (
                          <div className="p-4 border-t border-gray-200 bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-700">
                                Showing {startIndex + 1} to{" "}
                                {Math.min(endIndex, sortedOrders?.length || 0)} of{" "}
                                {sortedOrders?.length || 0} results
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={handlePreviousPage}
                                  disabled={currentPage === 1}
                                  className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  <ChevronLeft className="w-4 h-4" />
                                  Previous
                                </button>
                                <div className="flex gap-1">
                                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                                    (page) => (
                                      <button
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={`px-3 py-2 rounded-lg transition-colors ${
                                          currentPage === page
                                            ? "bg-blue-600 text-white"
                                            : "bg-white border border-gray-300 hover:bg-gray-50"
                                        }`}
                                      >
                                        {page}
                                      </button>
                                    )
                                  )}
                                </div>
                                <button
                                  onClick={handleNextPage}
                                  disabled={currentPage === totalPages}
                                  className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  Next
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            <Modal
              title={
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Test Order Details
                    </h3>
                    <p className="text-sm text-gray-600">
                      Complete test order information
                    </p>
                  </div>
                </div>
              }
              open={isModalVisible}
              onCancel={handleCloseModal}
              footer={[
                <Button
                  key="delete"
                  onClick={() => {
                    setOrderToDelete(selectedOrder);
                    setIsConfirmDeleteOpen(true);
                    setIsModalVisible(false);
                  }}
                  className="bg-red-100 hover:bg-red-200 border-red-300 text-red-700"
                >
                  Delete Order
                </Button>,
                <Button
                  key="edit"
                  onClick={() => {
                    handleEditClick(selectedOrder);
                    setIsModalVisible(false);
                  }}
                  className="bg-green-100 hover:bg-green-200 border-green-300 text-green-700"
                >
                  Edit Order
                </Button>,
                <Button
                  key="back"
                  onClick={handleCloseModal}
                  className="bg-gray-100 hover:bg-gray-200 border-gray-300"
                >
                  Close
                </Button>,
              ]}
              width={800}
              className="custom-modal"
            >
              {selectedOrder && (
                <div className="space-y-6 pt-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">Patient Information</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium text-gray-900">
                            {selectedOrder.patientName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Age:</span>
                          <span className="font-medium text-gray-900">{selectedOrder.age}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Gender:</span>
                          <span className="font-medium text-gray-900">
                            {selectedOrder.gender}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Mobile:</span>
                          <span className="font-medium text-gray-900">
                            {selectedOrder.mobile}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Email:</span>
                          <span className="font-medium text-gray-900">
                            {selectedOrder.email || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Address:</span>
                          <span className="font-medium text-gray-900">
                            {selectedOrder.address || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Heart className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold text-gray-900">Medical Information</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Disease:</span>
                        <span className="font-medium text-gray-900">
                          {selectedOrder.disease || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Doctor:</span>
                        <span className="font-medium text-gray-900">
                          {selectedOrder.doctorName || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Broker:</span>
                        <span className="font-medium text-gray-900">
                          {selectedOrder.brokerName || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="w-5 h-5 text-purple-600" />
                      <h4 className="font-semibold text-gray-900">Tests Information</h4>
                    </div>
                    {selectedOrder.tests && selectedOrder.tests.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-purple-100">
                              <th className="text-left p-2 font-medium text-gray-700">#</th>
                              <th className="text-left p-2 font-medium text-gray-700">
                                Test Name
                              </th>
                              <th className="text-left p-2 font-medium text-gray-700">
                                Price
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedOrder.tests.map((test, index) => (
                              <tr key={index} className="border-t border-purple-200">
                                <td className="p-2 text-gray-900">{index + 1}</td>
                                <td className="p-2 text-gray-900">{test.testName}</td>
                                <td className="p-2 text-gray-900">৳{test.testPrice}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-600">No tests information available</p>
                    )}
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign className="w-5 h-5 text-yellow-600" />
                      <h4 className="font-semibold text-gray-900">Financial Information</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Base Amount:</span>
                          <span className="font-medium text-gray-900">
                            ৳{selectedOrder.baseAmount || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">VAT Rate:</span>
                          <span className="font-medium text-gray-900">
                            {selectedOrder.vatRate || 1}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">VAT Amount:</span>
                          <span className="font-medium text-gray-900">
                            ৳{selectedOrder.vatAmount || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Discount Amount:</span>
                          <span className="font-medium text-gray-900">
                            ৳{selectedOrder.discountAmount || 0}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Amount:</span>
                          <span className="font-medium text-gray-900">
                            ৳{selectedOrder.totalAmount}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Paid Amount:</span>
                          <span className="font-medium text-gray-900">
                            ৳{selectedOrder.paidAmount || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Due Amount:</span>
                          <span className="font-medium text-gray-900">
                            ৳{selectedOrder.dueAmount || 0}
                          </span>
                        </div>
                        {selectedOrder.hospitalRevenue !== undefined && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Hospital Revenue:</span>
                            <span className="font-medium text-gray-900">
                              ৳{selectedOrder.hospitalRevenue.toFixed(0)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-5 h-5 text-indigo-600" />
                      <h4 className="font-semibold text-gray-900">Order Schedule</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium text-gray-900">
                          {new Date(selectedOrder.date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time:</span>
                        <span className="font-medium text-gray-900">{selectedOrder.time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <select
                          value={selectedOrder.status || "Pending"}
                          onChange={(e) => {
                            updateOrderStatus(selectedOrder._id, e.target.value);
                            setSelectedOrder({
                              ...selectedOrder,
                              status: e.target.value,
                            });
                          }}
                          className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Modal>

            <Modal
              title={
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Edit className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Edit Test Order
                    </h3>
                    <p className="text-sm text-gray-600">Update test order details</p>
                  </div>
                </div>
              }
              open={isEditModalVisible}
              onCancel={handleCloseEditModal}
              footer={[
                <Button
                  key="cancel"
                  onClick={handleCloseEditModal}
                  className="bg-gray-100 hover:bg-gray-200 border-gray-300"
                >
                  Cancel
                </Button>,
                <Button
                  key="submit"
                  onClick={handleEdit}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Update
                </Button>,
              ]}
              width={800}
              className="custom-modal"
            >
              {selectedOrder && (
                <div className="space-y-6 pt-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <User className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">Patient Information</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name
                        </label>
                        <Input
                          name="patientName"
                          value={formData.patientName || ""}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Age
                        </label>
                        <Input
                          type="number"
                          name="age"
                          value={formData.age || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Gender
                        </label>
                        <Select
                          name="gender"
                          value={formData.gender || ""}
                          onChange={(value) => setFormData({ ...formData, gender: value })}
                          className="w-full"
                        >
                          <Select.Option value="">Select Gender</Select.Option>
                          <Select.Option value="Male">Male</Select.Option>
                          <Select.Option value="Female">Female</Select.Option>
                          <Select.Option value="Other">Other</Select.Option>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mobile
                        </label>
                        <Input
                          name="mobile"
                          value={formData.mobile || ""}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <Input
                          type="email"
                          name="email"
                          value={formData.email || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address
                        </label>
                        <Input.TextArea
                          name="address"
                          value={formData.address || ""}
                          onChange={handleInputChange}
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Heart className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold text-gray-900">Medical Information</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Disease
                        </label>
                        <Input
                          name="disease"
                          value={formData.disease || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Doctor Name
                        </label>
                        <Input
                          name="doctorName"
                          value={formData.doctorName || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Broker Name
                        </label>
                        <Input
                          name="brokerName"
                          value={formData.brokerName || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-5 h-5 text-indigo-600" />
                      <h4 className="font-semibold text-gray-900">Order Schedule</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date
                        </label>
                        <DatePicker
                          value={formData.date ? moment(formData.date) : null}
                          onChange={handleDateChange}
                          className="w-full"
                          format="YYYY-MM-DD"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Time
                        </label>
                        <TimePicker
                          value={formData.time ? moment(formData.time, "HH:mm") : null}
                          onChange={handleTimeChange}
                          className="w-full"
                          format="HH:mm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign className="w-5 h-5 text-yellow-600" />
                      <h4 className="font-semibold text-gray-900">Financial Information</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Base Amount
                        </label>
                        <Input
                          type="number"
                          name="baseAmount"
                          value={formData.baseAmount || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          VAT Rate (%)
                        </label>
                        <Input
                          type="number"
                          name="vatRate"
                          value={formData.vatRate || 1}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          VAT Amount
                        </label>
                        <Input
                          type="number"
                          name="vatAmount"
                          value={formData.vatAmount || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Discount Amount
                        </label>
                        <Input
                          type="number"
                          name="discountAmount"
                          value={formData.discountAmount || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Total Amount
                        </label>
                        <Input
                          type="number"
                          name="totalAmount"
                          value={formData.totalAmount || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Paid Amount
                        </label>
                        <Input
                          type="number"
                          name="paidAmount"
                          value={formData.paidAmount || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Due Amount
                        </label>
                        <Input
                          type="number"
                          name="dueAmount"
                          value={formData.dueAmount || ""}
                          onChange={handleInputChange}
                          disabled
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Hospital Revenue
                        </label>
                        <Input
                          type="number"
                          name="hospitalRevenue"
                          value={formData.hospitalRevenue || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Doctor Revenue
                        </label>
                        <Input
                          type="number"
                          name="doctorRevenue"
                          value={formData.doctorRevenue || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Broker Revenue
                        </label>
                        <Input
                          type="number"
                          name="brokerRevenue"
                          value={formData.brokerRevenue || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Modal>

            <Modal
              title={
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
                </div>
              }
              open={isConfirmDeleteOpen}
              onCancel={() => {
                setIsConfirmDeleteOpen(false);
                setOrderToDelete(null);
              }}
              footer={[
                <Button
                  key="cancel"
                  onClick={() => {
                    setIsConfirmDeleteOpen(false);
                    setOrderToDelete(null);
                  }}
                  className="bg-gray-100 hover:bg-gray-200 border-gray-300"
                >
                  Cancel
                </Button>,
                <Button
                  key="delete"
                  onClick={() => deleteTestOrder(orderToDelete._id)}
                  className="bg-red-100 hover:bg-red-200 border-red-300 text-red-700"
                >
                  Delete
                </Button>,
              ]}
              width={400}
              className="custom-modal"
            >
              <div className="space-y-4">
                <p className="text-gray-600 text-center">
                  Are you sure you want to delete the test order for{" "}
                  <span className="font-semibold">{orderToDelete?.patientName}</span>?
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm font-medium text-center">
                    ⚠️ This action cannot be undone.
                  </p>
                </div>
              </div>
            </Modal>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestOrdersList;