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
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [records, setRecords] = useState([]);

  // Fetch hospital revenue data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch appointment revenue data
        const appointmentResponse = await axios.get("http://localhost:5000/appointments/revenue/hospital");
        
        // Try to fetch test order revenue data
        let testOrderResponse;
        try {
          testOrderResponse = await axios.get("http://localhost:5000/testorders");
        } catch (error) {
          console.warn("Could not fetch test orders, continuing with appointment data only", error);
          testOrderResponse = { data: [] };
        }
        
        // Calculate test order revenue and combine with appointment data
        let totalTestOrderRevenue = 0;
        let totalTestOrders = 0;
        
        // Process test orders
        testOrderResponse.data.forEach(order => {
          if (order.hospitalRevenue) {
            totalTestOrderRevenue += order.hospitalRevenue;
            totalTestOrders += 1;
          }
        });
        
        // Also fetch all appointments for filtering
        const appointmentsRes = await axios.get("http://localhost:5000/appointments");
        
        // Format appointments to include type
        const formattedAppointments = appointmentsRes.data.map(appointment => ({
          ...appointment,
          recordType: "Appointment"  // Add a type to differentiate
        }));
        
        // Format test orders to match appointment structure for consistent display
        const formattedTestOrders = testOrderResponse.data.map(order => ({
          patientName: order.patientName,
          date: order.date,
          time: order.time,
          tests: order.tests || [],
          totalAmount: order.totalAmount,
          hospitalRevenue: order.hospitalRevenue,
          recordType: "Test Order"  // Add a type to differentiate
        }));
        
        // Combine and sort by date (most recent first)
        const combinedRecords = [...formattedAppointments, ...formattedTestOrders].sort((a, b) => {
          return new Date(b.date) - new Date(a.date);
        });
        
        // Create monthly data by combining both sources
        const appointmentMonthlyData = appointmentResponse.data.monthly || [];
        
        // Process test orders by month for chart data
        const testOrdersByMonth = {};
        testOrderResponse.data.forEach(order => {
          if (order.date && order.hospitalRevenue) {
            // Extract month from date string (assuming format YYYY-MM-DD or MM/DD/YYYY)
            let dateParts;
            if (order.date.includes('-')) {
              dateParts = order.date.split('-');
            } else if (order.date.includes('/')) {
              dateParts = order.date.split('/');
            }
            
            let month;
            if (dateParts) {
              // Check format based on parts
              if (dateParts[0].length === 4) {
                // YYYY-MM-DD
                month = dateParts[1];
              } else {
                // MM/DD/YYYY
                month = dateParts[0];
              }
              
              // Convert to month name
              const monthNames = ["January", "February", "March", "April", "May", "June", 
                                "July", "August", "September", "October", "November", "December"];
              const monthIndex = parseInt(month, 10) - 1;  // Convert to 0-based index
              const monthName = monthNames[monthIndex];
              
              if (!testOrdersByMonth[monthName]) {
                testOrdersByMonth[monthName] = { revenue: 0, count: 0 };
              }
              testOrdersByMonth[monthName].revenue += order.hospitalRevenue;
              testOrdersByMonth[monthName].count += 1;
            }
          }
        });
        
        // Combine monthly data from both sources
        const combinedMonthlyData = [...appointmentMonthlyData];
        
        // Add test order monthly data to existing months or create new entries
        Object.keys(testOrdersByMonth).forEach(month => {
          const existingMonthIndex = combinedMonthlyData.findIndex(item => item._id === month);
          
          if (existingMonthIndex >= 0) {
            // Update existing month
            combinedMonthlyData[existingMonthIndex].revenue += testOrdersByMonth[month].revenue;
            combinedMonthlyData[existingMonthIndex].count += testOrdersByMonth[month].count;
          } else {
            // Add new month
            combinedMonthlyData.push({
              _id: month,
              revenue: testOrdersByMonth[month].revenue,
              count: testOrdersByMonth[month].count
            });
          }
        });
        
        // Sort monthly data by month number
        const monthOrder = {
          "January": 1, "February": 2, "March": 3, "April": 4, "May": 5, "June": 6,
          "July": 7, "August": 8, "September": 9, "October": 10, "November": 11, "December": 12
        };
        
        combinedMonthlyData.sort((a, b) => monthOrder[a._id] - monthOrder[b._id]);
        
        // Calculate updated summary
        const totalHospitalRevenue = 
          (appointmentResponse.data.summary.totalRevenue || 0) + totalTestOrderRevenue;
        const totalAppointments = 
          (appointmentResponse.data.summary.appointments || 0) + totalTestOrders;
        
        setRevenueData({
          totalRevenue: totalHospitalRevenue,
          appointments: totalAppointments,
          monthlyData: combinedMonthlyData
        });
        
        setRecords(combinedRecords);
        setFilteredRecords(combinedRecords);
        
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

    const filtered = records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= startDate && recordDate <= endDate;
    });

    setFilteredRecords(filtered);

    // Calculate total revenue for filtered records
    const totalHospitalRevenue = filtered.reduce((sum, record) => sum + record.hospitalRevenue, 0);
    
    toast.success(`Found ${filtered.length} records in selected date range`);
    setRevenueData({
      ...revenueData,
      totalRevenue: totalHospitalRevenue,
      appointments: filtered.length
    });
  };

  // Reset filters
  const resetFilters = () => {
    setDateRange({ start: "", end: "" });
    setFilteredRecords(records);
    
    // Recalculate total from all records
    const totalHospitalRevenue = records.reduce((sum, record) => sum + record.hospitalRevenue, 0);
    
    setRevenueData({
      ...revenueData,
      totalRevenue: totalHospitalRevenue,
      appointments: records.length
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
                <h3 style={{ margin: "0 0 10px 0", fontSize: "18px" }}>Total Records</h3>
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
                <h3 style={{ margin: "0 0 10px 0", fontSize: "18px" }}>Average Revenue per Record</h3>
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
            
            {/* Recent Records Table */}
            <div>
              <h3>Recent Records</h3>
              {loading ? (
                <p>Loading record data...</p>
              ) : filteredRecords.length > 0 ? (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f5f5f5" }}>
                        <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Patient Name</th>
                        <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Date</th>
                        <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Type</th>
                        <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid #ddd" }}>Tests/Procedures</th>
                        <th style={{ padding: "12px", textAlign: "right", borderBottom: "1px solid #ddd" }}>Total Amount</th>
                        <th style={{ padding: "12px", textAlign: "right", borderBottom: "1px solid #ddd" }}>Hospital Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecords.slice(0, 10).map((record, index) => (
                        <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9" }}>
                          <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>{record.patientName}</td>
                          <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>{record.date}</td>
                          <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>{record.recordType}</td>
                          <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
                            {record.tests?.map(test => test.testName).join(", ") || record.disease || "N/A"}
                          </td>
                          <td style={{ padding: "12px", textAlign: "right", borderBottom: "1px solid #ddd" }}>
                            {record.totalAmount} Taka
                          </td>
                          <td style={{ padding: "12px", textAlign: "right", borderBottom: "1px solid #ddd", fontWeight: "bold", color: "#1e88e5" }}>
                            {record.hospitalRevenue} Taka
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ backgroundColor: "#f0f0f0" }}>
                        <td colSpan="5" style={{ padding: "12px", fontWeight: "bold", textAlign: "right" }}>
                          Total ({filteredRecords.length > 10 ? "showing 10 of " + filteredRecords.length : filteredRecords.length}):
                        </td>
                        <td style={{ padding: "12px", fontWeight: "bold", textAlign: "right", color: "#1e88e5" }}>
                          {filteredRecords.slice(0, 10).reduce((sum, record) => sum + record.hospitalRevenue, 0).toFixed(0)} Taka
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                  {filteredRecords.length > 10 && (
                    <p style={{ textAlign: "center", color: "#666", marginTop: "10px" }}>
                      Showing 10 of {filteredRecords.length} records
                    </p>
                  )}
                </div>
              ) : (
                <p>No record data available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Hospital_Revenue;