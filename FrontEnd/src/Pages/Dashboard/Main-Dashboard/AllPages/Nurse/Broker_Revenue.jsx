import React, { useState, useEffect } from "react";
import Sidebar from "../../GlobalFiles/Sidebar";
import axios from "axios";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Broker_Revenue = () => {
  const [revenueData, setRevenueData] = useState({
    brokers: [],
    totalBrokerRevenue: 0,
    totalAppointments: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedBroker, setSelectedBroker] = useState("");
  const [brokerAppointments, setBrokerAppointments] = useState([]);

  // Fetch broker revenue data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/appointments/revenue/broker");
        setRevenueData({
          brokers: response.data.brokers || [],
          totalBrokerRevenue: response.data.summary.totalBrokerRevenue || 0,
          totalAppointments: response.data.summary.totalAppointments || 0
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching broker revenue data:", error);
        toast.error("Failed to load broker revenue data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle broker selection
  const handleBrokerSelect = async (brokerName) => {
    setSelectedBroker(brokerName);
    
    //  http://localhost:8080/appointments?brokerName=brokerName
    try {
      const response = await axios.get(`http://localhost:5000/appointments?brokerName=${brokerName}`);
      setBrokerAppointments(response.data);
      toast.success(`Loaded ${response.data.length} appointments for broker ${brokerName}`);
    } catch (error) {
      console.error("Error fetching broker appointments:", error);
      toast.error("Failed to load broker appointments");
    }
  };

  // Prepare chart data
  const chartData = revenueData.brokers.map(broker => ({
    name: broker._id,
    revenue: broker.totalRevenue,
    appointments: broker.appointments
  }));

  // Colors for charts
  const COLORS = ['#ff6e40', '#ff9e80', '#ffab40', '#ffd180', '#ffe57f', '#9ccc65'];

  return (
    <>
      <ToastContainer />
      <div className="container">
        <Sidebar />
        <div className="AfterSideBar">
          <div className="Main_Add_Doctor_div">
            <h1>Broker Revenue Dashboard</h1>
            
            {/* Summary Cards */}
            <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
              <div style={{ 
                flex: 1, 
                backgroundColor: "#e64a19", 
                color: "white", 
                padding: "20px", 
                borderRadius: "8px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
              }}>
                <h3 style={{ margin: "0 0 10px 0", fontSize: "18px" }}>Total Broker Revenue</h3>
                <h2 style={{ margin: "0", fontSize: "28px" }}>{revenueData.totalBrokerRevenue.toFixed(0)} Taka</h2>
              </div>
              
              <div style={{ 
                flex: 1, 
                backgroundColor: "#f57c00", 
                color: "white", 
                padding: "20px", 
                borderRadius: "8px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
              }}>
                <h3 style={{ margin: "0 0 10px 0", fontSize: "18px" }}>Broker Referrals</h3>
                <h2 style={{ margin: "0", fontSize: "28px" }}>{revenueData.totalAppointments}</h2>
              </div>
              
              <div style={{ 
                flex: 1, 
                backgroundColor: "#ff8f00", 
                color: "white", 
                padding: "20px", 
                borderRadius: "8px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
              }}>
                <h3 style={{ margin: "0 0 10px 0", fontSize: "18px" }}>Active Brokers</h3>
                <h2 style={{ margin: "0", fontSize: "28px" }}>{revenueData.brokers.length}</h2>
              </div>
            </div>
            
            {/* Broker Revenue Chart */}
            <div style={{ marginBottom: "30px" }}>
              <h3>Revenue by Broker</h3>
              {loading ? (
                <p>Loading chart data...</p>
              ) : chartData.length > 0 ? (
                <div style={{ height: "400px", width: "100%" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="revenue" name="Revenue (Taka)" fill="#ff6e40" />
                      <Bar dataKey="appointments" name="Appointments" fill="#ffd180" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p>No data available for chart</p>
              )}
            </div>
            
            {/* Broker List */}
            <div style={{ marginBottom: "30px" }}>
              <h3>Broker Details</h3>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f5f5f5" }}>
                      <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Broker Name</th>
                      <th style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #ddd" }}>Referrals</th>
                      <th style={{ padding: "12px", textAlign: "right", borderBottom: "1px solid #ddd" }}>Total Revenue</th>
                      <th style={{ padding: "12px", textAlign: "right", borderBottom: "1px solid #ddd" }}>Avg. Revenue/Referral</th>
                      <th style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #ddd" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueData.brokers.map((broker, index) => (
                      <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9" }}>
                        <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>{broker._id}</td>
                        <td style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #ddd" }}>{broker.appointments}</td>
                        <td style={{ padding: "12px", textAlign: "right", borderBottom: "1px solid #ddd", fontWeight: "bold" }}>
                          {broker.totalRevenue.toFixed(0)} Taka
                        </td>
                        <td style={{ padding: "12px", textAlign: "right", borderBottom: "1px solid #ddd" }}>
                          {broker.appointments > 0 ? (broker.totalRevenue / broker.appointments).toFixed(0) : 0} Taka
                        </td>
                        <td style={{ padding: "12px", textAlign: "center", borderBottom: "1px solid #ddd" }}>
                          <button 
                            onClick={() => handleBrokerSelect(broker._id)}
                            style={{ 
                              padding: "6px 12px",
                              backgroundColor: "#ff6e40",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer"
                            }}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Selected Broker Appointments */}
            {selectedBroker && (
              <div>
                <h3>Appointments by {selectedBroker}</h3>
                {brokerAppointments.length > 0 ? (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ backgroundColor: "#f5f5f5" }}>
                          <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Patient Name</th>
                          <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Date</th>
                          <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Doctor</th>
                          <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Tests</th>
                          <th style={{ padding: "12px", textAlign: "right", borderBottom: "1px solid #ddd" }}>Total Amount</th>
                          <th style={{ padding: "12px", textAlign: "right", borderBottom: "1px solid #ddd" }}>Broker Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {brokerAppointments.map((appointment, index) => (
                          <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9" }}>
                            <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>{appointment.patientName}</td>
                            <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>{appointment.date}</td>
                            <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>{appointment.doctorName || "N/A"}</td>
                            <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
                              {appointment.tests?.map(test => test.testName).join(", ")}
                            </td>
                            <td style={{ padding: "12px", textAlign: "right", borderBottom: "1px solid #ddd" }}>
                              {appointment.totalAmount} Taka
                            </td>
                            <td style={{ padding: "12px", textAlign: "right", borderBottom: "1px solid #ddd", fontWeight: "bold", color: "#e64a19" }}>
                              {appointment.brokerRevenue || (appointment.totalAmount * 0.05).toFixed(0)} Taka
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ backgroundColor: "#f0f0f0" }}>
                          <td colSpan="5" style={{ padding: "12px", fontWeight: "bold", textAlign: "right" }}>Total:</td>
                          <td style={{ padding: "12px", fontWeight: "bold", textAlign: "right", color: "#e64a19" }}>
                            {brokerAppointments.reduce((sum, appointment) => 
                              sum + (appointment.brokerRevenue || appointment.totalAmount * 0.05), 0).toFixed(0)} Taka
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <p>No appointments found for this broker</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Broker_Revenue;