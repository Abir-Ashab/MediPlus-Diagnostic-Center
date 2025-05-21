import { Modal, Button, Input, Spin } from "antd";
import { useEffect, useState } from "react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import {
  DeleteAppointment,
  GetAllAppointment,
} from "../../../../../Redux/Datas/action";
import Sidebar from "../../GlobalFiles/Sidebar";
import { SearchOutlined } from "@ant-design/icons";

const Check_Appointment = () => {
  const { data } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Get All Appointments
  const AllAppointment = useSelector((state) => state.data.Appointments);
  
  // Filter appointments based on search term
  const filteredAppointments = AllAppointment?.filter(appointment =>
    (appointment.patientName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (appointment.disease?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (appointment.mobile && typeof appointment.mobile === 'string' && appointment.mobile.includes(searchTerm))
  );

  // Delete Appointment Handler
  const handleDeleteAppointment = (id) => {
    if(window.confirm("Are you sure you want to delete this appointment?")) {
      dispatch(DeleteAppointment(id));
    }
  };

  // View Appointment Details Handler
  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setIsModalVisible(true);
  };

  // Close Modal Handler
  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedAppointment(null);
  };

  // Load appointments on component mount
  useEffect(() => {
    setLoading(true);
    dispatch(GetAllAppointment())
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
  }, [dispatch]);

  // Check if user is authenticated
  if (data?.isAuthticated === false) {
    return <Navigate to={"/"} />;
  }

  return (
    <>
      <div className="container">
        <Sidebar />
        <div className="AfterSideBar">
          <div className="appointment-page">
            <div className="appointment-header">
              <h1>Appointment Details</h1>
              <div className="search-container">
                <Input
                  placeholder="Search by name, disease or mobile"
                  prefix={<SearchOutlined />}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: 300 }}
                />
              </div>
            </div>

            {loading ? (
              <div className="loading-container">
                <Spin size="large" />
                <p>Loading appointments...</p>
              </div>
            ) : (
              <div className="appointment-table">
                {filteredAppointments?.length === 0 ? (
                  <div className="no-appointments">
                    <p>No appointments found</p>
                  </div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>Patient Name</th>
                        <th>Mobile</th>
                        <th>Disease</th>
                        <th>Doctor</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAppointments?.map((appointment) => (
                        <tr key={appointment._id}>
                          <td>{appointment.patientName}</td>
                          <td>{appointment.mobile}</td>
                          <td>{appointment.disease}</td>
                          <td>{appointment.doctorName || "Not Assigned"}</td>
                          <td>{appointment.date}</td>
                          <td className="action-buttons">
                            <Button 
                              type="primary"
                              onClick={() => handleViewDetails(appointment)}
                            >
                              View Details
                            </Button>
                            <Button 
                              type="danger"
                              onClick={() => handleDeleteAppointment(appointment._id)}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>

          {/* Appointment Details Modal */}
          <Modal
            title="Appointment Details"
            open={isModalVisible}
            onCancel={handleCloseModal}
            footer={[
              <Button key="back" onClick={handleCloseModal}>
                Close
              </Button>
            ]}
            width={700}
          >
            {selectedAppointment && (
              <div className="appointment-details">
                <div className="detail-section">
                  <h3>Patient Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Name:</span> 
                      <span className="value">{selectedAppointment.patientName}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Age:</span> 
                      <span className="value">{selectedAppointment.age}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Gender:</span> 
                      <span className="value">{selectedAppointment.gender}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Mobile:</span> 
                      <span className="value">{selectedAppointment.mobile}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Email:</span> 
                      <span className="value">{selectedAppointment.email}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Address:</span> 
                      <span className="value">{selectedAppointment.address}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Medical Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Disease:</span> 
                      <span className="value">{selectedAppointment.disease}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Doctor:</span> 
                      <span className="value">{selectedAppointment.doctorName || "Not Assigned"}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Broker:</span> 
                      <span className="value">{selectedAppointment.brokerName || "None"}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Tests Information</h3>
                  {selectedAppointment.tests && selectedAppointment.tests.length > 0 ? (
                    <table className="tests-table">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Test Name</th>
                          <th>Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedAppointment.tests.map((test, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{test.testName}</td>
                            <td>{test.testPrice} Taka</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>No tests information available</p>
                  )}
                </div>

                <div className="detail-section">
                  <h3>Financial Information</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Total Amount:</span> 
                      <span className="value">{selectedAppointment.totalAmount} Taka</span>
                    </div>
                    
                    {selectedAppointment.hospitalRevenue !== undefined && (
                      <div className="detail-item">
                        <span className="label">Hospital Revenue:</span> 
                        <span className="value">{selectedAppointment.hospitalRevenue} Taka</span>
                      </div>
                    )}
                    
                    {selectedAppointment.doctorRevenue !== undefined && (
                      <div className="detail-item">
                        <span className="label">Doctor Revenue:</span> 
                        <span className="value">{selectedAppointment.doctorRevenue} Taka</span>
                      </div>
                    )}
                    
                    {selectedAppointment.brokerRevenue !== undefined && (
                      <div className="detail-item">
                        <span className="label">Broker Revenue:</span> 
                        <span className="value">{selectedAppointment.brokerRevenue} Taka</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="detail-section">
                  <h3>Appointment Schedule</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="label">Date:</span> 
                      <span className="value">{selectedAppointment.date}</span>
                    </div>
                    <div className="detail-item">
                      <span className="label">Time:</span> 
                      <span className="value">{selectedAppointment.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Modal>
        </div>
      </div>
    </>
  );
};

export default Check_Appointment;