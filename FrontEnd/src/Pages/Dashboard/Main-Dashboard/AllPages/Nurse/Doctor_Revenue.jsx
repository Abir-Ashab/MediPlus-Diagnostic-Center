import React, { useState, useEffect } from "react";
import Sidebar from "../../GlobalFiles/Sidebar";
import axios from "axios";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Doctor_Revenue = () => {
  const [revenueData, setRevenueData] = useState({
    doctors: [],
    totalDoctorRevenue: 0,
    totalAppointments: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [doctorAppointments, setDoctorAppointments] = useState([]);

  // Fetch doctor revenue data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/appointments/revenue/doctor");
        setRevenueData({
          doctors: response.data.doctors || [],
          totalDoctorRevenue: response.data.summary.totalDoctorRevenue || 0,
          totalAppointments: response.data.summary.totalAppointments || 0
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching doctor revenue data:", error);
        toast.error("Failed to load doctor revenue data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle doctor selection
  const handleDoctorSelect = async (doctorName) => {
    setSelectedDoctor(doctorName);
    
    try {
      const response = await axios.get(`http://localhost:5000/appointments?doctorName=${doctorName}`);
      setDoctorAppointments(response.data);
      toast.success(`Loaded ${response.data.length} appointments for Dr. ${doctorName}`);
    } catch (error) {
      console.error("Error fetching doctor appointments:", error);
      toast.error("Failed to load doctor appointments");
    }
  };

  // Prepare chart data
  const pieChartData = revenueData.doctors.map(doctor => ({
    name: doctor._id,
    value: doctor.totalRevenue
  }));

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <>
      <ToastContainer />
      <div className="container">
        <Sidebar />
        <div className="AfterSideBar">
          <div className="Main_Add_Doctor_div">
            <h1>Doctor Revenue Dashboard</h1>
            
            {/* Summary Cards */}
            <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
              <div style={{ 
                flex: 1, 
                backgroundColor: "#8e24aa", 
                color: "white", 
                padding: "20px", 
                borderRadius: "8px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
              }}>
                <h3 style={{ margin: "0 0 10px 0", fontSize: "18px" }}>Total Doctor Revenue</h3>
                <h2 style={{ margin: "0", fontSize: "28px" }}>{revenueData.totalDoctorRevenue.toFixed(0)} Taka</h2>
              </div>
              
              <div style={{ 
                flex: 1, 
                backgroundColor: "#5e35b1", 
                color: "white", 
                padding: "20px", 
                borderRadius: "8px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
              }}>
                <h3 style={{ margin: "0 0 10px 0", fontSize: "18px" }}>Doctor Appointments</h3>
                <h2 style={{ margin: "0", fontSize: "28px" }}>{revenueData.totalAppointments}</h2>
              </div>
              
              <div style={{ 
                flex: 1, 
                backgroundColor: "#3949ab", 
                color: "white", 
                padding: "20px", 
                borderRadius: "8px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
              }}>
                <h3 style={{ margin: "0 0 10px 0", fontSize: "18px" }}>Active Doctors</h3>
                <h2 style={{ margin: "0", fontSize: "28px" }}>{revenueData.doctors.length}</h2>
              </div>
            </div>
            
            {/* Doctor Revenue Distribution */}
            <div style={{ marginBottom: "30px" }}>
              <h3>Revenue Distribution by Doctor</h3>
              {loading ? (
                <p>Loading chart data...</p>
              ) : pieChartData.length > 0 ? (
                <div style={{ display: "flex", gap: "30px" }}>
                  {/* Pie Chart */}
                  <div style={{ width: "50%", height: "400px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={150}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value} Taka`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Doctor List */}
                  <div style={{ width: "50%" }}>
                    <h4>Select a Doctor to View Details</h4>
                    <div style={{ 
                      maxHeight: "350px", 
                      overflowY: "auto", 
                      border: "1px solid #ddd", 
                      borderRadius: "8px",
                      padding: "10px"
                    }}>
                      {revenueData.doctors.map((doctor, index) => (
                        <div 
                          key={index}
                          onClick={() => handleDoctorSelect(doctor._id)}
                          style={{ 
                            padding: "12px", 
                            borderBottom: "1px solid #eee",
                            backgroundColor: selectedDoctor === doctor._id ? "#f0f7ff" : "white",
                            cursor: "pointer"
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <div style={{ fontWeight: "bold" }}>{doctor._id}</div>
                            <div style={{ color: "#8e24aa", fontWeight: "bold" }}>{doctor.totalRevenue.toFixed(0)} Taka</div>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#666", marginTop: "5px" }}>
                            <div>Appointments: {doctor.appointments}</div>
                            <div>Avg: {doctor.appointments > 0 ? (doctor.totalRevenue / doctor.appointments).toFixed(0) : 0} Taka</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p>No data available for chart</p>
              )}
            </div>
            
            {/* Doctor Appointments Table */}
            {selectedDoctor && (
              <div>
                <h3>Appointments for Dr. {selectedDoctor}</h3>
                {doctorAppointments.length > 0 ? (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ backgroundColor: "#f5f5f5" }}>
                          <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Patient Name</th>
                          <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Date</th>
                          <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Disease</th>
                          <th style={{ padding: "12px", textAlign: "right", borderBottom: "1px solid #ddd" }}>Total Amount</th>
                          <th style={{ padding: "12px", textAlign: "right", borderBottom: "1px solid #ddd" }}>Doctor Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {doctorAppointments.map((appointment, index) => (
                          <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9" }}>
                            <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>{appointment.patientName}</td>
                            <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>{appointment.date}</td>
                            <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>{appointment.disease}</td>
                            <td style={{ padding: "12px", textAlign: "right", borderBottom: "1px solid #ddd" }}>
                              {appointment.totalAmount} Taka
                            </td>
                            <td style={{ padding: "12px", textAlign: "right", borderBottom: "1px solid #ddd", fontWeight: "bold", color: "#8e24aa" }}>
                              {appointment.doctorRevenue} Taka
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ backgroundColor: "#f0f0f0" }}>
                          <td colSpan="4" style={{ padding: "12px", fontWeight: "bold", textAlign: "right" }}>Total:</td>
                          <td style={{ padding: "12px", fontWeight: "bold", textAlign: "right", color: "#8e24aa" }}>
                            {doctorAppointments.reduce((sum, appointment) => sum + appointment.doctorRevenue, 0).toFixed(0)} Taka
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <p>No appointments found for this doctor</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Doctor_Revenue;