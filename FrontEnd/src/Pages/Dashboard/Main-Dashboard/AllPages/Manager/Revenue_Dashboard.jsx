import React, { useState, useEffect } from "react";
import Sidebar from "../../GlobalFiles/Sidebar";
import axios from "axios";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ToastContainer, toast } from "react-toastify";
import { Calendar } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

const RevenueDashboard = () => {
  const [activeTab, setActiveTab] = useState("hospital");
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [doctorDateFilter, setDoctorDateFilter] = useState("all"); // "all", "week", "month", "year", "custom"
  const [doctorCustomDateRange, setDoctorCustomDateRange] = useState({ start: "", end: "" });
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState("");
  
  // Date filter helper functions
  const getDateRangeForFilter = (filterType) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    
    switch (filterType) {
      case "week":
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
        const weekEnd = new Date(today);
        weekEnd.setDate(today.getDate() + (6 - today.getDay())); // End of week (Saturday)
        return { start: weekStart, end: weekEnd };
        
      case "month":
        const monthStart = new Date(currentYear, currentMonth, 1);
        const monthEnd = new Date(currentYear, currentMonth + 1, 0);
        return { start: monthStart, end: monthEnd };
        
      case "year":
        const yearStart = new Date(currentYear, 0, 1);
        const yearEnd = new Date(currentYear, 11, 31);
        return { start: yearStart, end: yearEnd };
        
      case "custom":
        return {
          start: doctorCustomDateRange.start ? new Date(doctorCustomDateRange.start) : null,
          end: doctorCustomDateRange.end ? new Date(doctorCustomDateRange.end) : null
        };
        
      default:
        return { start: null, end: null };
    }
  };

  const filterRecordsByDateRange = (records, filterType) => {
    if (filterType === "all") return records;
    
    const dateRange = getDateRangeForFilter(filterType);
    if (!dateRange.start || !dateRange.end) return records;
    
    return records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= dateRange.start && recordDate <= dateRange.end;
    });
  };

  // Reset filters for doctors
  const resetDoctorFilters = () => {
    setDoctorDateFilter("all");
    setDoctorCustomDateRange({ start: "", end: "" });
    setSelectedDoctor("");
    
    // Only apply "all" filter if we have data to reset
    if (doctorData.doctorRecords && doctorData.doctorRecords.length > 0) {
      applyFilterForType("all");
    } else {
      // Reset the filtered records to empty when clearing doctor selection
      setDoctorData(prev => ({
        ...prev,
        filteredDoctorRecords: []
      }));
    }
  };

  // Handle doctor date filter change
  const handleDoctorDateFilterChange = (filterType) => {
    setDoctorDateFilter(filterType);
    if (filterType !== "custom") {
      setDoctorCustomDateRange({ start: "", end: "" });
      // Only apply filter automatically for non-custom filters and when we have data
      if (doctorData.doctorRecords && doctorData.doctorRecords.length > 0) {
        applyFilterForType(filterType);
      }
    }
  };

  // Helper function to apply filter for a specific type
  const applyFilterForType = (filterType) => {
    // Don't filter if there are no records
    if (!doctorData.doctorRecords || doctorData.doctorRecords.length === 0) {
      toast.info("No doctor records to filter. Please select a doctor first.");
      return;
    }

    const filteredRecords = filterRecordsByDateRange(doctorData.doctorRecords, filterType);
    
    // Update doctor data with filtered records
    setDoctorData(prev => ({
      ...prev,
      filteredDoctorRecords: filteredRecords
    }));

    const filterLabels = {
      week: "this week",
      month: "this month", 
      year: "this year",
      custom: "selected date range",
      all: "all time"
    };

    toast.success(`Showing ${filteredRecords.length} records for ${filterLabels[filterType]}`);
  };

  // Apply doctor date filter
  const applyDoctorDateFilter = () => {
    if (doctorDateFilter === "custom" && (!doctorCustomDateRange.start || !doctorCustomDateRange.end)) {
      toast.error("Please select both start and end dates");
      return;
    }

    applyFilterForType(doctorDateFilter);
  };

  const [hospitalData, setHospitalData] = useState({
    totalRevenue: 0,
    appointments: 0,
    monthlyData: [],
    records: [],
    filteredRecords: []
  });
  
  const [doctorData, setDoctorData] = useState({
    doctors: [],
    totalDoctorRevenue: 0,
    totalAppointments: 0,
    doctorRecords: [],
    filteredDoctorRecords: [] // Initialize with empty array
  });
  
  const [brokerData, setBrokerData] = useState({
    brokers: [],
    totalBrokerRevenue: 0,
    totalAppointments: 0,
    brokerAppointments: []
  });

  // Fetch all revenue data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch hospital revenue data
        const [appointmentResponse, testOrderResponse, appointmentsRes] = await Promise.all([
          axios.get("https://medi-plus-diagnostic-center-bdbv.vercel.app/appointments/revenue/hospital").catch(() => ({ data: { brokers: [], summary: {} } })),
          axios.get("https://medi-plus-diagnostic-center-bdbv.vercel.app/testorders").catch(() => ({ data: [] })),
          axios.get("https://medi-plus-diagnostic-center-bdbv.vercel.app/appointments").catch(() => ({ data: [] }))
        ]);

        // Process hospital data
        const hospitalRevenue = (appointmentResponse.data.brokers || []).filter(broker => broker._id !== null);
        let totalTestOrderRevenue = 0;
        let totalTestOrders = 0;
        
        testOrderResponse.data.forEach(order => {
          if (order.hospitalRevenue) {
            totalTestOrderRevenue += order.hospitalRevenue;
            totalTestOrders += 1;
          }
        });

        const formattedAppointments = appointmentsRes.data.map(appointment => ({
          ...appointment,
          recordType: "Appointment"
        }));

        const formattedTestOrders = testOrderResponse.data.map(order => ({
          patientName: order.patientName,
          date: order.date,
          time: order.time,
          tests: order.tests || [],
          totalAmount: order.totalAmount || 0,
          hospitalRevenue: order.hospitalRevenue,
          recordType: "Test Order"
        }));

        const hospitalRecords = [...formattedAppointments, ...formattedTestOrders].sort((a, b) => new Date(b.date) - new Date(a.date));

        const appointmentMonthlyData = appointmentResponse.data.monthly || [];
        const testOrdersByMonth = {};
        testOrderResponse.data.forEach(order => {
          if (order.date && order.hospitalRevenue) {
            let month;
            const dateParts = order.date.includes('-') ? order.date.split('-') : order.date.split('/');
            month = dateParts[0].length === 4 ? dateParts[1] : dateParts[0];
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            const monthName = monthNames[parseInt(month, 10) - 1];
            if (!testOrdersByMonth[monthName]) testOrdersByMonth[monthName] = { revenue: 0, count: 0 };
            testOrdersByMonth[monthName].revenue += order.hospitalRevenue;
            testOrdersByMonth[monthName].count += 1;
          }
        });

        const combinedMonthlyData = [...appointmentMonthlyData];
        Object.keys(testOrdersByMonth).forEach(month => {
          const existingMonthIndex = combinedMonthlyData.findIndex(item => item._id === month);
          if (existingMonthIndex >= 0) {
            combinedMonthlyData[existingMonthIndex].revenue += testOrdersByMonth[month].revenue;
            combinedMonthlyData[existingMonthIndex].count += testOrdersByMonth[month].count;
          } else {
            combinedMonthlyData.push({
              _id: month,
              revenue: testOrdersByMonth[month].revenue,
              count: testOrdersByMonth[month].count
            });
          }
        });

        combinedMonthlyData.sort((a, b) => {
          const monthOrder = { "January": 1, "February": 2, "March": 3, "April": 4, "May": 5, "June": 6, "July": 7, "August": 8, "September": 9, "October": 10, "November": 11, "December": 12 };
          return monthOrder[a._id] - monthOrder[b._id];
        });

        setHospitalData({
          totalRevenue: (appointmentResponse.data.summary.totalRevenue || 0) + totalTestOrderRevenue,
          appointments: (appointmentResponse.data.summary.appointments || 0) + totalTestOrders,
          monthlyData: combinedMonthlyData,
          records: hospitalRecords,
          filteredRecords: hospitalRecords
        });

        // Fetch doctor revenue data
        const doctorResponse = await axios.get("https://medi-plus-diagnostic-center-bdbv.vercel.app/appointments/revenue/doctor").catch(() => ({ data: { doctors: [], summary: {} } }));
        const doctorsRevenue = (doctorResponse.data.doctors || []).filter(doctor => doctor._id !== null);
        const testOrdersByDoctor = {};
        testOrderResponse.data.forEach(order => {
          if (order.doctorName && order.doctorRevenue) {
            if (!testOrdersByDoctor[order.doctorName]) {
              testOrdersByDoctor[order.doctorName] = { totalRevenue: 0, appointments: 0 };
            }
            testOrdersByDoctor[order.doctorName].totalRevenue += order.doctorRevenue;
            testOrdersByDoctor[order.doctorName].appointments += 1;
          }
        });

        const combinedDoctors = [...doctorsRevenue];
        let totalDoctorTestRevenue = 0;
        let totalDoctorTestOrders = 0;

        for (let i = 0; i < combinedDoctors.length; i++) {
          const doctorName = combinedDoctors[i]._id;
          if (testOrdersByDoctor[doctorName]) {
            combinedDoctors[i].totalRevenue += testOrdersByDoctor[doctorName].totalRevenue;
            combinedDoctors[i].appointments += testOrdersByDoctor[doctorName].appointments;
            totalDoctorTestRevenue += testOrdersByDoctor[doctorName].totalRevenue;
            totalDoctorTestOrders += testOrdersByDoctor[doctorName].appointments;
            delete testOrdersByDoctor[doctorName];
          }
        }

        Object.keys(testOrdersByDoctor).forEach(doctorName => {
          combinedDoctors.push({
            _id: doctorName,
            totalRevenue: testOrdersByDoctor[doctorName].totalRevenue,
            appointments: testOrdersByDoctor[doctorName].appointments
          });
          totalDoctorTestRevenue += testOrdersByDoctor[doctorName].totalRevenue;
          totalDoctorTestOrders += testOrdersByDoctor[doctorName].appointments;
        });

        setDoctorData({
          doctors: combinedDoctors,
          totalDoctorRevenue: (doctorResponse.data.summary.totalDoctorRevenue || 0) + totalDoctorTestRevenue,
          totalAppointments: doctorsRevenue.reduce((sum, doctor) => sum + doctor.appointments, 0) + totalDoctorTestOrders,
          doctorRecords: []
        });

        // Fetch broker revenue data
        const brokerResponse = await axios.get("https://medi-plus-diagnostic-center-bdbv.vercel.app/appointments/revenue/broker").catch(() => ({ data: { brokers: [], summary: {} } }));
        const filteredBrokers = (brokerResponse.data.brokers || []).filter(broker => broker._id !== null);
        setBrokerData({
          brokers: filteredBrokers,
          totalBrokerRevenue: brokerResponse.data.summary.totalBrokerRevenue || 0,
          totalAppointments: filteredBrokers.reduce((sum, broker) => sum + broker.appointments, 0),
          brokerAppointments: []
        });

        setLoading(false);
      } catch (error) {
        console.error("Error fetching revenue data:", error);
        toast.error("Failed to load revenue data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle date range filter for hospital data
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

    const filtered = hospitalData.records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= startDate && recordDate <= endDate;
    });

    setHospitalData({
      ...hospitalData,
      filteredRecords: filtered,
      totalRevenue: filtered.reduce((sum, record) => sum + (record.hospitalRevenue || 0), 0),
      appointments: filtered.length
    });

    toast.success(`Found ${filtered.length} records in selected date range`);
  };

  // Reset hospital filters
  const resetFilters = () => {
    setDateRange({ start: "", end: "" });
    setHospitalData({
      ...hospitalData,
      filteredRecords: hospitalData.records,
      totalRevenue: hospitalData.records.reduce((sum, record) => sum + (record.hospitalRevenue || 0), 0),
      appointments: hospitalData.records.length
    });
  };

  // Handle doctor selection
  const handleDoctorSelect = async (doctorName) => {
    setSelectedDoctor(doctorName);
    try {
      const [appointmentsResponse, testOrdersResponse] = await Promise.all([
        axios.get(`https://medi-plus-diagnostic-center-bdbv.vercel.app/appointments?doctorName=${doctorName}`),
        axios.get(`https://medi-plus-diagnostic-center-bdbv.vercel.app/testorders`)
      ]);

      const doctorTestOrders = testOrdersResponse.data.filter(order => order.doctorName === doctorName);
      const formattedTestOrders = doctorTestOrders.map(order => ({
        patientName: order.patientName,
        date: order.date,
        disease: order.tests?.map(test => test.testName).join(", ") || "N/A",
        totalAmount: order.totalAmount || 0,
        doctorRevenue: order.doctorRevenue || 0,
        recordType: "Test Order"
      }));

      const formattedAppointments = appointmentsResponse.data.map(appointment => ({
        ...appointment,
        recordType: "Appointment",
        doctorRevenue: appointment.doctorRevenue || 0
      }));

      const combinedRecords = [...formattedAppointments, ...formattedTestOrders].sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // Apply current filter to the new data
      const filteredRecords = filterRecordsByDateRange(combinedRecords, doctorDateFilter);
      
      setDoctorData({ 
        ...doctorData, 
        doctorRecords: combinedRecords,
        filteredDoctorRecords: filteredRecords
      });
      
      const filterLabels = {
        week: "this week",
        month: "this month", 
        year: "this year",
        custom: "selected date range",
        all: "all time"
      };
      
      toast.success(`Loaded ${combinedRecords.length} records for Dr. ${doctorName}. Showing ${filteredRecords.length} records for ${filterLabels[doctorDateFilter]}`);
    } catch (error) {
      console.error("Error fetching doctor records:", error);
      toast.error("Failed to load doctor records");
    }
  };

  // Handle broker selection
  const handleBrokerSelect = async (brokerName) => {
    setSelectedBroker(brokerName);
    try {
      const response = await axios.get(`https://medi-plus-diagnostic-center-bdbv.vercel.app/appointments?brokerName=${brokerName}`);
      setBrokerData({ ...brokerData, brokerAppointments: response.data });
      toast.success(`Loaded ${response.data.length} appointments for broker ${brokerName}`);
    } catch (error) {
      console.error("Error fetching broker appointments:", error);
      toast.error("Failed to load broker appointments");
    }
  };

  // Chart data preparation
  const hospitalChartData = hospitalData.monthlyData.map(item => ({
    month: item._id,
    revenue: item.revenue,
    appointments: item.count
  }));

  const doctorChartData = doctorData.doctors.map(doctor => ({
    name: doctor._id,
    value: doctor.totalRevenue
  }));

  const brokerChartData = brokerData.brokers.map(broker => ({
    name: broker._id,
    revenue: broker.totalRevenue,
    appointments: broker.appointments
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar onCollapse={setSidebarCollapsed} />
        <div className={`flex-1 p-6 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-0'}`}>
          <div className="flex-1 p-6 ml-40">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Revenue Dashboard</h1>
            <div className="flex border-b border-gray-200 mb-6">
              <button
                className={`px-4 py-2 font-medium text-sm ${activeTab === 'hospital' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('hospital')}
              >
                Hospital Revenue
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${activeTab === 'doctor' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('doctor')}
              >
                Doctor Revenue
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${activeTab === 'broker' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('broker')}
              >
                Broker Revenue
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {activeTab === 'hospital' && (
                <>
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-700">Total Hospital Revenue</h3>
                    <p className="text-2xl font-bold text-blue-600">{hospitalData.totalRevenue.toFixed(0)} Taka</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-700">Total Records</h3>
                    <p className="text-2xl font-bold text-blue-600">{hospitalData.appointments}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-700">Average Revenue per Record</h3>
                    <p className="text-2xl font-bold text-blue-600">
                      {hospitalData.appointments > 0 ? (hospitalData.totalRevenue / hospitalData.appointments).toFixed(0) : 0} Taka
                    </p>
                  </div>
                </>
              )}
              {activeTab === 'doctor' && (
                <>
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-700">Total Doctor Revenue</h3>
                    <p className="text-2xl font-bold text-purple-600">{doctorData.totalDoctorRevenue.toFixed(0)} Taka</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-700">Total Records</h3>
                    <p className="text-2xl font-bold text-purple-600">{doctorData.totalAppointments}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-700">Active Doctors</h3>
                    <p className="text-2xl font-bold text-purple-600">{doctorData.doctors.length}</p>
                  </div>
                </>
              )}
              {activeTab === 'broker' && (
                <>
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-700">Total Broker Revenue</h3>
                    <p className="text-2xl font-bold text-orange-600">{brokerData.totalBrokerRevenue.toFixed(0)} Taka</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-700">Broker Referrals</h3>
                    <p className="text-2xl font-bold text-orange-600">{brokerData.totalAppointments}</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-700">Active Brokers</h3>
                    <p className="text-2xl font-bold text-orange-600">{brokerData.brokers.length}</p>
                  </div>
                </>
              )}
            </div>

            {/* Date Filter for Hospital Tab */}
            {activeTab === 'hospital' && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Date Range</h3>
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDateFilter}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Apply Filter
                    </button>
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Date Filter for Doctor Tab */}
            {activeTab === 'doctor' && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Doctor Revenue</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
                    <select
                      value={doctorDateFilter}
                      onChange={(e) => handleDoctorDateFilterChange(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="all">All Time</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="year">This Year</option>
                      <option value="custom">Custom Range</option>
                    </select>
                  </div>
                  
                  {doctorDateFilter === "custom" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                        <input
                          type="date"
                          value={doctorCustomDateRange.start}
                          onChange={(e) => setDoctorCustomDateRange({ ...doctorCustomDateRange, start: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                        <input
                          type="date"
                          value={doctorCustomDateRange.end}
                          onChange={(e) => setDoctorCustomDateRange({ ...doctorCustomDateRange, end: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      onClick={applyDoctorDateFilter}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      Apply Filter
                    </button>
                    <button
                      onClick={resetDoctorFilters}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </div>
                
                {doctorDateFilter !== "all" && (
                  <div className="mt-4 p-3 bg-purple-50 rounded-md">
                    <p className="text-sm text-purple-700">
                      Showing records for: <strong>
                        {doctorDateFilter === "week" && "This Week"}
                        {doctorDateFilter === "month" && "This Month"}
                        {doctorDateFilter === "year" && "This Year"}
                        {doctorDateFilter === "custom" && doctorCustomDateRange.start && doctorCustomDateRange.end && 
                          `${doctorCustomDateRange.start} to ${doctorCustomDateRange.end}`}
                      </strong>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Charts */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {activeTab === 'hospital' ? 'Monthly Revenue Trend' : activeTab === 'doctor' ? 'Revenue Distribution by Doctor' : 'Revenue by Broker'}
              </h3>
              {loading ? (
                <p className="text-gray-600">Loading chart data...</p>
              ) : (
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    {activeTab === 'hospital' ? (
                      <LineChart data={hospitalChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value.toFixed(0)} Taka`} />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Revenue (Taka)" />
                      </LineChart>
                    ) : activeTab === 'doctor' ? (
                      <PieChart>
                        <Pie
                          data={doctorChartData.filter(entry => entry.name && entry.value)}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }) => name && percent && `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={150}
                          dataKey="value"
                        >
                          {doctorChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value.toFixed(0)} Taka`} />
                      </PieChart>
                    ) : (
                      <BarChart data={brokerChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value.toFixed(0)} Taka`} />
                        <Legend />
                        <Bar dataKey="revenue" name="Revenue (Taka)" fill="#f59e0b" />
                        <Bar dataKey="appointments" name="Appointments" fill="#10b981" />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Details Section */}
            {(activeTab === 'doctor' || activeTab === 'broker') && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {activeTab === 'doctor' ? 'Doctor Details' : 'Broker Details'}
                </h3>
                <div className="max-h-96 overflow-y-auto">
                  {activeTab === 'doctor' && doctorData.doctors.map((doctor, index) => (
                    doctor._id && (
                      <div
                        key={index}
                        onClick={() => handleDoctorSelect(doctor._id)}
                        className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-blue-50 transition-colors ${
                          selectedDoctor === doctor._id ? 'bg-blue-100' : ''
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="font-medium text-gray-900">Dr. {doctor._id}</div>
                          <div className="font-bold text-purple-600">{doctor.totalRevenue.toFixed(0)} Taka</div>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 mt-2">
                          <span>Records: {doctor.appointments}</span>
                          <span>Avg: {doctor.appointments > 0 ? (doctor.totalRevenue / doctor.appointments).toFixed(0) : 0} Taka</span>
                        </div>
                      </div>
                    )
                  ))}
                  {activeTab === 'broker' && brokerData.brokers.map((broker, index) => (
                    broker._id && (
                      <div
                        key={index}
                        className="p-4 border-b border-gray-200"
                      >
                        <div className="flex justify-between items-center">
                          <div className="font-medium text-gray-900">{broker._id}</div>
                          <div className="flex gap-4">
                            <div className="text-right">
                              <div className="font-bold text-orange-600">{broker.totalRevenue.toFixed(0)} Taka</div>
                              <div className="text-sm text-gray-600">Referrals: {broker.appointments}</div>
                            </div>
                            <button
                              onClick={() => handleBrokerSelect(broker._id)}
                              className="px-3 py-1 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                          Avg. Revenue/Referral: {broker.appointments > 0 ? (broker.totalRevenue / broker.appointments).toFixed(0) : 0} Taka
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Records Table */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {activeTab === 'hospital' ? 'Recent Records' : activeTab === 'doctor' ? `Records for Dr. ${selectedDoctor || 'Select a Doctor'}` : `Appointments by ${selectedBroker || 'Select a Broker'}`}
              </h3>
              {loading ? (
                <p className="text-gray-600">Loading record data...</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Patient Name</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Date</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-700">{activeTab === 'hospital' ? 'Type' : activeTab === 'doctor' ? 'Type' : 'Doctor'}</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-700">{activeTab === 'broker' ? 'Tests' : 'Details'}</th>
                        <th className="p-3 text-right text-sm font-semibold text-gray-700">Total Amount</th>
                        <th className="p-3 text-right text-sm font-semibold text-gray-700">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(activeTab === 'hospital' ? hospitalData.filteredRecords : activeTab === 'doctor' ? ((doctorData.filteredDoctorRecords && doctorData.filteredDoctorRecords.length > 0) ? doctorData.filteredDoctorRecords : (doctorData.doctorRecords || [])) : (brokerData.brokerAppointments || []))
                        .slice(0, 10)
                        .map((record, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="p-3 border-b border-gray-200">{record.patientName}</td>
                            <td className="p-3 border-b border-gray-200">{record.date}</td>
                            <td className="p-3 border-b border-gray-200">
                              {activeTab === 'broker' ? record.doctorName || 'N/A' : record.recordType || 'N/A'}
                            </td>
                            <td className="p-3 border-b border-gray-200">
                              {activeTab === 'broker' ? record.tests?.map(test => test.testName).join(", ") || 'N/A' : record.tests?.map(test => test.testName).join(", ") || record.disease || 'N/A'}
                            </td>
                            <td className="p-3 text-right border-b border-gray-200">{record.totalAmount?.toFixed(0) || 0} Taka</td>
                            <td className="p-3 text-right border-b border-gray-200 font-bold"
                                style={{ color: activeTab === 'hospital' ? '#3b82f6' : activeTab === 'doctor' ? '#8b5cf6' : '#f59e0b' }}>
                              {(activeTab === 'hospital' ? record.hospitalRevenue : activeTab === 'doctor' ? record.doctorRevenue : record.brokerRevenue || (record.totalAmount * 0.05))?.toFixed(0) || 0} Taka
                            </td>
                          </tr>
                        ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-100">
                        <td colSpan="5" className="p-3 text-right font-bold">
                          Total ({(activeTab === 'hospital' ? (hospitalData.filteredRecords || []) : activeTab === 'doctor' ? ((doctorData.filteredDoctorRecords && doctorData.filteredDoctorRecords.length > 0) ? doctorData.filteredDoctorRecords : (doctorData.doctorRecords || [])) : (brokerData.brokerAppointments || [])).length > 10 ? `showing 10 of ${(activeTab === 'hospital' ? (hospitalData.filteredRecords || []) : activeTab === 'doctor' ? ((doctorData.filteredDoctorRecords && doctorData.filteredDoctorRecords.length > 0) ? doctorData.filteredDoctorRecords : (doctorData.doctorRecords || [])) : (brokerData.brokerAppointments || [])).length}` : (activeTab === 'hospital' ? (hospitalData.filteredRecords || []) : activeTab === 'doctor' ? ((doctorData.filteredDoctorRecords && doctorData.filteredDoctorRecords.length > 0) ? doctorData.filteredDoctorRecords : (doctorData.doctorRecords || [])) : (brokerData.brokerAppointments || [])).length}):
                        </td>
                        <td className="p-3 text-right font-bold" style={{ color: activeTab === 'hospital' ? '#3b82f6' : activeTab === 'doctor' ? '#8b5cf6' : '#f59e0b' }}>
                          {(activeTab === 'hospital' ? (hospitalData.filteredRecords || []) : activeTab === 'doctor' ? ((doctorData.filteredDoctorRecords && doctorData.filteredDoctorRecords.length > 0) ? doctorData.filteredDoctorRecords : (doctorData.doctorRecords || [])) : (brokerData.brokerAppointments || []))
                            .slice(0, 10)
                            .reduce((sum, record) => sum + (activeTab === 'hospital' ? record.hospitalRevenue : activeTab === 'doctor' ? record.doctorRevenue : record.brokerRevenue || (record.totalAmount * 0.05) || 0), 0)
                            .toFixed(0)} Taka
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                  {(activeTab === 'hospital' ? (hospitalData.filteredRecords || []) : activeTab === 'doctor' ? ((doctorData.filteredDoctorRecords && doctorData.filteredDoctorRecords.length > 0) ? doctorData.filteredDoctorRecords : (doctorData.doctorRecords || [])) : (brokerData.brokerAppointments || [])).length > 10 && (
                    <p className="text-center text-gray-600 mt-4">
                      Showing 10 of {(activeTab === 'hospital' ? (hospitalData.filteredRecords || []) : activeTab === 'doctor' ? ((doctorData.filteredDoctorRecords && doctorData.filteredDoctorRecords.length > 0) ? doctorData.filteredDoctorRecords : (doctorData.doctorRecords || [])) : (brokerData.brokerAppointments || [])).length} records
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RevenueDashboard;