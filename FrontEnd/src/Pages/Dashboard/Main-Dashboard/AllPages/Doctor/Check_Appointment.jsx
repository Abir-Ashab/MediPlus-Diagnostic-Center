import { Modal, Button, Input, Spin } from "antd";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import {
  DeleteAppointment,
  GetAllAppointment,
} from "../../../../../Redux/Datas/action";
import Sidebar from "../../GlobalFiles/Sidebar";
import { Search, Eye, Trash2, Calendar, User, Phone, MapPin, Heart, DollarSign, Clock, ChevronLeft, ChevronRight, FileText, UserCheck, Building } from 'lucide-react';
import { ToastContainer } from "react-toastify";

const Check_Appointment = () => {
  const { data } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const AllAppointment = useSelector((state) => state.data.Appointments);
  
  const filteredAppointments = AllAppointment?.filter(appointment =>
    (appointment.patientName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (appointment.disease?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (appointment.mobile && typeof appointment.mobile === 'string' && appointment.mobile.includes(searchTerm))
  );

  const sortedAppointments = filteredAppointments?.sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });

  const totalPages = Math.ceil((sortedAppointments?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAppointments = sortedAppointments?.slice(startIndex, endIndex);

  const handleDeleteAppointment = (id) => {
    if(window.confirm("Are you sure you want to delete this appointment?")) {
      dispatch(DeleteAppointment(id));
    }
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedAppointment(null);
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

  useEffect(() => {
    setLoading(true);
    dispatch(GetAllAppointment())
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
  }, [dispatch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Check if user is authenticated
  if (data?.isAuthticated === false) {
    return <Navigate to={"/"} />;
  }

  return (
    <div>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar onCollapse={setSidebarCollapsed} />
        <div className={`flex-1 p-6 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-0'}`}>
          <div className="flex-1 p-6 ml-40">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">Appointment Management</h1>
                      <p className="text-gray-600">View and manage all appointments</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2">
                    <Search className="w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="Search by name, disease or mobile"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="border-none bg-transparent focus:ring-0 focus:border-none"
                      style={{ width: 300, boxShadow: 'none' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Appointments</p>
                    <p className="text-2xl font-bold text-gray-900">{AllAppointment?.length || 0}</p>
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
                    <p className="text-2xl font-bold text-gray-900">{filteredAppointments?.length || 0}</p>
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
                    <p className="text-2xl font-bold text-gray-900">{currentPage} of {totalPages}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Spin size="large" />
                  <p className="mt-4 text-gray-600">Loading appointments...</p>
                </div>
              ) : (
                <>
                  {currentAppointments?.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="p-4 bg-gray-100 rounded-full mb-4">
                        <Calendar className="w-12 h-12 text-gray-400" />
                      </div>
                      <p className="text-gray-600 text-lg">No appointments found</p>
                      <p className="text-gray-500 text-sm mt-2">Try adjusting your search criteria</p>
                    </div>
                  ) : (
                    <>
                      {/* Desktop Table */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                              <th className="text-left p-4 font-semibold text-gray-700">Patient</th>
                              <th className="text-left p-4 font-semibold text-gray-700">Contact</th>
                              <th className="text-left p-4 font-semibold text-gray-700">Medical Info</th>
                              <th className="text-left p-4 font-semibold text-gray-700">Schedule</th>
                              <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentAppointments?.map((appointment) => (
                              <tr key={appointment._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-full">
                                      <User className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-900">{appointment.patientName}</p>
                                      <p className="text-sm text-gray-600">{appointment.age} years, {appointment.gender}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <Phone className="w-4 h-4 text-gray-400" />
                                      <span className="text-sm text-gray-700">{appointment.mobile}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <MapPin className="w-4 h-4 text-gray-400" />
                                      <span className="text-sm text-gray-700">{appointment.email}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <Heart className="w-4 h-4 text-red-500" />
                                      <span className="text-sm text-gray-700">{appointment.disease}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <UserCheck className="w-4 h-4 text-green-500" />
                                      <span className="text-sm text-gray-700">{appointment.doctorName || "Not Assigned"}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <Calendar className="w-4 h-4 text-blue-500" />
                                      <span className="text-sm text-gray-700">{appointment.date}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-4 h-4 text-purple-500" />
                                      <span className="text-sm text-gray-700">{appointment.time}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={() => handleViewDetails(appointment)}
                                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors text-sm font-medium"
                                    >
                                      <Eye className="w-4 h-4" />
                                      View
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteAppointment(appointment._id)}
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

                      {/* Mobile Cards */}
                      <div className="md:hidden">
                        {currentAppointments?.map((appointment) => (
                          <div key={appointment._id} className="p-4 border-b border-gray-100 last:border-b-0">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-full">
                                  <User className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <h3 className="font-medium text-gray-900">{appointment.patientName}</h3>
                                  <p className="text-sm text-gray-600">{appointment.age} years, {appointment.gender}</p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleViewDetails(appointment)}
                                  className="p-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteAppointment(appointment._id)}
                                  className="p-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-700">{appointment.mobile}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Heart className="w-4 h-4 text-red-500" />
                                <span className="text-sm text-gray-700">{appointment.disease}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-blue-500" />
                                <span className="text-sm text-gray-700">{appointment.date}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="p-4 border-t border-gray-200 bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                              Showing {startIndex + 1} to {Math.min(endIndex, sortedAppointments?.length || 0)} of {sortedAppointments?.length || 0} results
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
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                  <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`px-3 py-2 rounded-lg transition-colors ${
                                      currentPage === page
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white border border-gray-300 hover:bg-gray-50'
                                    }`}
                                  >
                                    {page}
                                  </button>
                                ))}
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

          {/* Enhanced Modal */}
          <Modal
            title={
              <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Appointment Details</h3>
                  <p className="text-sm text-gray-600">Complete patient and appointment information</p>
                </div>
              </div>
            }
            open={isModalVisible}
            onCancel={handleCloseModal}
            footer={[
              <Button key="back" onClick={handleCloseModal} className="bg-gray-100 hover:bg-gray-200 border-gray-300">
                Close
              </Button>
            ]}
            width={800}
            className="custom-modal"
          >
            {selectedAppointment && (
              <div className="space-y-6 pt-4">
                {/* Patient Information */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">Patient Information</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium text-gray-900">{selectedAppointment.patientName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Age:</span>
                        <span className="font-medium text-gray-900">{selectedAppointment.age}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gender:</span>
                        <span className="font-medium text-gray-900">{selectedAppointment.gender}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mobile:</span>
                        <span className="font-medium text-gray-900">{selectedAppointment.mobile}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium text-gray-900">{selectedAppointment.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Address:</span>
                        <span className="font-medium text-gray-900">{selectedAppointment.address}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-gray-900">Medical Information</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Disease:</span>
                      <span className="font-medium text-gray-900">{selectedAppointment.disease}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Doctor:</span>
                      <span className="font-medium text-gray-900">{selectedAppointment.doctorName || "Not Assigned"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Broker:</span>
                      <span className="font-medium text-gray-900">{selectedAppointment.brokerName || "None"}</span>
                    </div>
                  </div>
                </div>

                {/* Tests Information */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold text-gray-900">Tests Information</h4>
                  </div>
                  {selectedAppointment.tests && selectedAppointment.tests.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-purple-100">
                            <th className="text-left p-2 font-medium text-gray-700">#</th>
                            <th className="text-left p-2 font-medium text-gray-700">Test Name</th>
                            <th className="text-left p-2 font-medium text-gray-700">Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedAppointment.tests.map((test, index) => (
                            <tr key={index} className="border-t border-purple-200">
                              <td className="p-2 text-gray-900">{index + 1}</td>
                              <td className="p-2 text-gray-900">{test.testName}</td>
                              <td className="p-2 text-gray-900">{test.testPrice} Taka</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-600">No tests information available</p>
                  )}
                </div>

                {/* Financial Information */}
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-5 h-5 text-yellow-600" />
                    <h4 className="font-semibold text-gray-900">Financial Information</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="font-medium text-gray-900">{selectedAppointment.totalAmount} Taka</span>
                      </div>
                      {selectedAppointment.hospitalRevenue !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Hospital Revenue:</span>
                          <span className="font-medium text-gray-900">{selectedAppointment.hospitalRevenue} Taka</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      {selectedAppointment.doctorRevenue !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Doctor Revenue:</span>
                          <span className="font-medium text-gray-900">{selectedAppointment.doctorRevenue} Taka</span>
                        </div>
                      )}
                      {selectedAppointment.brokerRevenue !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Broker Revenue:</span>
                          <span className="font-medium text-gray-900">{selectedAppointment.brokerRevenue} Taka</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Appointment Schedule */}
                <div className="bg-indigo-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    <h4 className="font-semibold text-gray-900">Appointment Schedule</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium text-gray-900">{selectedAppointment.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium text-gray-900">{selectedAppointment.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default Check_Appointment;