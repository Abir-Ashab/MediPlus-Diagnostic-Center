import React, { useState, useEffect } from "react";
import Sidebar from "../../GlobalFiles/Sidebar";
import axios from "axios";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Hospital_Revenue = () => {
  const [revenueData, setRevenueData] = useState({
    totalRevenue: 0,
    appointments: 0,
    monthlyData: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [appointments, setAppointments] = useState([]);

  // Fetch hospital revenue data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/appointments/revenue/hospital");
        setRevenueData({
          totalRevenue: response.data.summary.totalRevenue || 0,
          appointments: response.data.summary.appointments || 0,
          monthlyData: response.data.monthly || []
        });
        
        // Also fetch all appointments for filtering
        const appointmentsRes = await axios.get("http://localhost:5000/appointments");
        setAppointments(appointmentsRes.data);
        setFilteredAppointments(appointmentsRes.data);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching revenue data:", error);
        toast.error("Failed to load hospital revenue data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle date range filter
  const handleDateFilter = () => {
    if (!dateRange.start || !dateRange.end) {
      toast.error("Please select both start and end dates");
      return;
    }

    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    
    if (startDate > endDate) {
      toast.error("Start date cannot be after end date");
      return;
    }

    const filtered = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return appointmentDate >= startDate && appointmentDate <= endDate;
    });

    setFilteredAppointments(filtered);

    // Calculate total revenue for filtered appointments
    const totalHospitalRevenue = filtered.reduce((sum, appointment) => sum + appointment.hospitalRevenue, 0);
    
    toast.success(`Found ${filtered.length} appointments in selected date range`);
    setRevenueData({
      ...revenueData,
      totalRevenue: totalHospitalRevenue,
      appointments: filtered.length
    });
  };

  // Reset filters
  const resetFilters = () => {
    setDateRange({ start: "", end: "" });
    setFilteredAppointments(appointments);
    
    // Recalculate total from all appointments
    const totalHospitalRevenue = appointments.reduce((sum, appointment) => sum + appointment.hospitalRevenue, 0);
    
    setRevenueData({
      ...revenueData,
      totalRevenue: totalHospitalRevenue,
      appointments: appointments.length
    });
  };

  // Prepare monthly data for chart
  const chartData = revenueData.monthlyData.map(item => ({
    month: item._id,
    revenue: item.revenue,
    appointments: item.count
  }));

  return (
    <>
      <ToastContainer />
      <div className="container">
        <Sidebar />
        <div className="AfterSideBar">
          <div className="Main_Add_Doctor_div">
            <h1>Hospital Revenue Dashboard</h1>
            
            {/* Summary Cards */}
            <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
              <div style={{ 
                flex: 1, 
                backgroundColor: "#1e88e5", 
                color: "white", 
                padding: "20px", 
                borderRadius: "8px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
              }}>
                <h3 style={{ margin: "0 0 10px 0", fontSize: "18px" }}>Total Hospital Revenue</h3>
                <h2 style={{ margin: "0", fontSize: "28px" }}>{revenueData.totalRevenue.toFixed(0)} Taka</h2>
              </div>
              
              <div style={{ 
                flex: 1, 
                backgroundColor: "#43a047", 
                color: "white", 
                padding: "20px", 
                borderRadius: "8px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
              }}>
                <h3 style={{ margin: "0 0 10px 0", fontSize: "18px" }}>Total Appointments</h3>
                <h2 style={{ margin: "0", fontSize: "28px" }}>{revenueData.appointments}</h2>
              </div>
              
              <div style={{ 
                flex: 1, 
                backgroundColor: "#fb8c00", 
                color: "white", 
                padding: "20px", 
                borderRadius: "8px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
              }}>
                <h3 style={{ margin: "0 0 10px 0", fontSize: "18px" }}>Average Revenue per Appointment</h3>
                <h2 style={{ margin: "0", fontSize: "28px" }}>
                  {revenueData.appointments > 0 
                    ? (revenueData.totalRevenue / revenueData.appointments).toFixed(0) 
                    : 0} Taka
                </h2>
              </div>
            </div>
            
            {/* Date Filter */}
            <div style={{ 
              marginBottom: "30px", 
              padding: "20px", 
              backgroundColor: "#f5f5f5", 
              borderRadius: "8px" 
            }}>
              <h3 style={{ marginTop: "0" }}>Filter by Date Range</h3>
              <div style={{ display: "flex", gap: "15px", alignItems: "flex-end" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "5px" }}>Start Date</label>
                  <input 
                    type="date" 
                    value={dateRange.start} 
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "5px" }}>End Date</label>
                  <input 
                    type="date" 
                    value={dateRange.end} 
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                  />
                </div>
                <button 
                  onClick={handleDateFilter}
                  style={{ 
                    padding: "8px 16px", 
                    backgroundColor: "#2196f3", 
                    color: "white", 
                    border: "none", 
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Apply Filter
                </button>
                <button 
                  onClick={resetFilters}
                  style={{ 
                    padding: "8px 16px", 
                    backgroundColor: "#f44336", 
                    color: "white", 
                    border: "none", 
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
            
            {/* Charts */}
            <div style={{ marginBottom: "30px" }}>
              <h3>Monthly Revenue Trend</h3>
              {loading ? (
                <p>Loading chart data...</p>
              ) : chartData.length > 0 ? (
                <div style={{ height: "400px", width: "100%" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" stroke="#1e88e5" name="Revenue (Taka)" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p>No data available for chart</p>
              )}
            </div>
            
            {/* Recent Appointments Table */}
            <div>
              <h3>Recent Appointments</h3>
              {loading ? (
                <p>Loading appointment data...</p>
              ) : filteredAppointments.length > 0 ? (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f5f5f5" }}>
                        <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Patient Name</th>
                        <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Date</th>
                        <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Tests</th>
                        <th style={{ padding: "12px", textAlign: "right", borderBottom: "1px solid #ddd" }}>Total Amount</th>
                        <th style={{ padding: "12px", textAlign: "right", borderBottom: "1px solid #ddd" }}>Hospital Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAppointments.slice(0, 10).map((appointment, index) => (
                        <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9" }}>
                          <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>{appointment.patientName}</td>
                          <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>{appointment.date}</td>
                          <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
                            {appointment.tests?.map(test => test.testName).join(", ")}
                          </td>
                          <td style={{ padding: "12px", textAlign: "right", borderBottom: "1px solid #ddd" }}>
                            {appointment.totalAmount} Taka
                          </td>
                          <td style={{ padding: "12px", textAlign: "right", borderBottom: "1px solid #ddd", fontWeight: "bold", color: "#1e88e5" }}>
                            {appointment.hospitalRevenue} Taka
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredAppointments.length > 10 && (
                    <p style={{ textAlign: "center", color: "#666", marginTop: "10px" }}>
                      Showing 10 of {filteredAppointments.length} appointments
                    </p>
                  )}
                </div>
              ) : (
                <p>No appointment data available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Hospital_Revenue;