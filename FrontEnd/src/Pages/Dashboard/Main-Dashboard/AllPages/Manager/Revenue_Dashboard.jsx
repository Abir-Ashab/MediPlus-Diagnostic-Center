import React, { useState, useEffect } from "react";
import Sidebar from "../../GlobalFiles/Sidebar";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HospitalRevenue from "../../../../../Components/Revenue/HospitalRevenue";
import DoctorRevenue from "../../../../../Components/Revenue/DoctorRevenue";
import BrokerRevenue from "../../../../../Components/Revenue/BrokerRevenue";

const RevenueDashboard = () => {
  const [activeTab, setActiveTab] = useState("hospital");
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [hospitalDateFilter, setHospitalDateFilter] = useState("all");
  const [hospitalCustomDateRange, setHospitalCustomDateRange] = useState({ start: "", end: "" });
  const [hospitalData, setHospitalData] = useState({
    totalRevenue: 0,
    appointments: 0,
    monthlyData: [],
    records: [],
    filteredRecords: [],
  });

  // Doctor state
  const [doctorDateFilter, setDoctorDateFilter] = useState("all");
  const [doctorCustomDateRange, setDoctorCustomDateRange] = useState({ start: "", end: "" });
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [doctorData, setDoctorData] = useState({
    doctors: [],
    totalDoctorRevenue: 0,
    totalAppointments: 0,
    doctorRecords: [],
    filteredDoctorRecords: [],
  });

  // Broker state
  const [brokerDateFilter, setBrokerDateFilter] = useState("all");
  const [brokerCustomDateRange, setBrokerCustomDateRange] = useState({ start: "", end: "" });
  const [selectedBroker, setSelectedBroker] = useState("");
  const [brokerData, setBrokerData] = useState({
    brokers: [],
    totalBrokerRevenue: 0,
    totalAppointments: 0,
    brokerAppointments: [],
    filteredBrokerAppointments: [],
  });

  // Date filter helper functions
  const getDateRangeForFilter = (filterType, customRange) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    switch (filterType) {
      case "week":
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(today);
        weekEnd.setDate(today.getDate() + (6 - today.getDay()));
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
          start: customRange.start ? new Date(customRange.start) : null,
          end: customRange.end ? new Date(customRange.end) : null,
        };

      default:
        return { start: null, end: null };
    }
  };

  const filterRecordsByDateRange = (records, filterType, customRange) => {
    if (filterType === "all") return records;

    const dateRange = getDateRangeForFilter(filterType, customRange);
    if (!dateRange.start || !dateRange.end) return records;

    return records.filter((record) => {
      const recordDate = new Date(record.date);
      return recordDate >= dateRange.start && recordDate <= dateRange.end;
    });
  };

  // Apply filter for specific type
  const applyFilterForType = (filterType, setDataFunc, data, dataType) => {
    let recordsKey = dataType === "doctor" ? "doctorRecords" : dataType === "broker" ? "brokerAppointments" : "records";
    let filteredKey = dataType === "doctor" ? "filteredDoctorRecords" : dataType === "broker" ? "filteredBrokerAppointments" : "filteredRecords";
    let customRange = dataType === "doctor" ? doctorCustomDateRange : dataType === "broker" ? brokerCustomDateRange : hospitalCustomDateRange;

    if (!data[recordsKey] || data[recordsKey].length === 0) {
      toast.info(`No ${dataType} records to filter. Please select a ${dataType} first.`);
      return;
    }

    const filteredRecords = filterRecordsByDateRange(data[recordsKey], filterType, customRange);

    setDataFunc((prev) => ({
      ...prev,
      [filteredKey]: filteredRecords,
    }));
  };

  // Hospital filter handlers
  const handleHospitalDateFilterChange = (filterType) => {
    setHospitalDateFilter(filterType);
    if (filterType !== "custom") {
      setHospitalCustomDateRange({ start: "", end: "" });
      if (hospitalData.records && hospitalData.records.length > 0) {
        applyFilterForType(filterType, setHospitalData, hospitalData, "hospital");
      }
    }
  };

  const applyHospitalDateFilter = () => {
    if (hospitalDateFilter === "custom" && (!hospitalCustomDateRange.start || !hospitalCustomDateRange.end)) {
      toast.error("Please select both start and end dates");
      return;
    }
    applyFilterForType(hospitalDateFilter, setHospitalData, hospitalData, "hospital");
  };

  const resetHospitalFilters = () => {
    setHospitalDateFilter("all");
    setHospitalCustomDateRange({ start: "", end: "" });
    if (hospitalData.records && hospitalData.records.length > 0) {
      applyFilterForType("all", setHospitalData, hospitalData, "hospital");
    } else {
      setHospitalData((prev) => ({
        ...prev,
        filteredRecords: [],
      }));
    }
  };

  const handleDoctorDateFilterChange = (filterType) => {
    setDoctorDateFilter(filterType);
    if (filterType !== "custom") {
      setDoctorCustomDateRange({ start: "", end: "" });
      if (doctorData.doctorRecords && doctorData.doctorRecords.length > 0) {
        applyFilterForType(filterType, setDoctorData, doctorData, "doctor");
      }
    }
  };

  const applyDoctorDateFilter = () => {
    if (doctorDateFilter === "custom" && (!doctorCustomDateRange.start || !doctorCustomDateRange.end)) {
      toast.error("Please select both start and end dates");
      return;
    }
    applyFilterForType(doctorDateFilter, setDoctorData, doctorData, "doctor");
  };

  const resetDoctorFilters = () => {
    setDoctorDateFilter("all");
    setDoctorCustomDateRange({ start: "", end: "" });
    setSelectedDoctor("");
    if (doctorData.doctorRecords && doctorData.doctorRecords.length > 0) {
      applyFilterForType("all", setDoctorData, doctorData, "doctor");
    } else {
      setDoctorData((prev) => ({
        ...prev,
        filteredDoctorRecords: [],
      }));
    }
  };

  // Broker filter handlers
  const handleBrokerDateFilterChange = (filterType) => {
    setBrokerDateFilter(filterType);
    if (filterType !== "custom") {
      setBrokerCustomDateRange({ start: "", end: "" });
      if (brokerData.brokerAppointments && brokerData.brokerAppointments.length > 0) {
        applyFilterForType(filterType, setBrokerData, brokerData, "broker");
      }
    }
  };

  const applyBrokerDateFilter = () => {
    if (brokerDateFilter === "custom" && (!brokerCustomDateRange.start || !brokerCustomDateRange.end)) {
      toast.error("Please select both start and end dates");
      return;
    }
    applyFilterForType(brokerDateFilter, setBrokerData, brokerData, "broker");
  };

  const resetBrokerFilters = () => {
    setBrokerDateFilter("all");
    setBrokerCustomDateRange({ start: "", end: "" });
    setSelectedBroker("");
    if (brokerData.brokerAppointments && brokerData.brokerAppointments.length > 0) {
      applyFilterForType("all", setBrokerData, brokerData, "broker");
    } else {
      setBrokerData((prev) => ({
        ...prev,
        filteredBrokerAppointments: [],
      }));
    }
  };

  // Handle doctor selection
  const handleDoctorSelect = async (doctorName) => {
    setSelectedDoctor(doctorName);
    try {
      const [appointmentsResponse, testOrdersResponse] = await Promise.all([
        axios.get(`https://medi-plus-diagnostic-center-bdbv.vercel.app/appointments?doctorName=${doctorName}`),
        axios.get(`https://medi-plus-diagnostic-center-bdbv.vercel.app/testorders`),
      ]);

      const doctorTestOrders = testOrdersResponse.data.filter((order) => order.doctorName === doctorName);
      const formattedTestOrders = doctorTestOrders.map((order) => ({
        patientName: order.patientName,
        date: order.date,
        disease: order.tests?.map((test) => test.testName).join(", ") || "N/A",
        totalAmount: order.totalAmount || 0,
        doctorRevenue: order.doctorRevenue || 0,
        recordType: "Test Order",
      }));

      const formattedAppointments = appointmentsResponse.data.map((appointment) => ({
        ...appointment,
        recordType: "Appointment",
        doctorRevenue: appointment.doctorRevenue || 0,
      }));

      const combinedRecords = [...formattedAppointments, ...formattedTestOrders].sort((a, b) => new Date(b.date) - new Date(a.date));
      const filteredRecords = filterRecordsByDateRange(combinedRecords, doctorDateFilter, doctorCustomDateRange);

      setDoctorData({
        ...doctorData,
        doctorRecords: combinedRecords,
        filteredDoctorRecords: filteredRecords,
      });
    } catch (error) {
      console.error("Error fetching doctor records:", error);
      toast.error("Failed to load doctor records");
    }
  };

  // Handle broker selection
  const handleBrokerSelect = async (brokerName) => {
    setSelectedBroker(brokerName);
    try {
      const response = await axios.get(`https://medi-plus-diagnostic-center-bdbv.vercel.app/testorders?brokerName=${brokerName}`);
      const appointments = response.data;
      const filteredAppointments = filterRecordsByDateRange(appointments, brokerDateFilter, brokerCustomDateRange);
      setBrokerData({
        ...brokerData,
        brokerAppointments: appointments,
        filteredBrokerAppointments: filteredAppointments,
      });
    } catch (error) {
      console.error("Error fetching broker appointments:", error);
      toast.error("Failed to load broker appointments");
    }
  };

  // Fetch all revenue data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [appointmentResponse, testOrderResponse, appointmentsRes] = await Promise.all([
          axios.get("https://medi-plus-diagnostic-center-bdbv.vercel.app/appointments/revenue/hospital").catch(() => ({ data: { brokers: [], summary: {} } })),
          axios.get("https://medi-plus-diagnostic-center-bdbv.vercel.app/testorders").catch(() => ({ data: [] })),
          axios.get("https://medi-plus-diagnostic-center-bdbv.vercel.app/appointments").catch(() => ({ data: [] })),
        ]);

        // Process hospital data
        const hospitalRevenue = (appointmentResponse.data.brokers || []).filter((broker) => broker._id !== null);
        let totalTestOrderRevenue = 0;
        let totalTestOrders = 0;

        testOrderResponse.data.forEach((order) => {
          if (order.hospitalRevenue) {
            totalTestOrderRevenue += order.hospitalRevenue;
            totalTestOrders += 1;
          }
        });

        const formattedAppointments = appointmentsRes.data.map((appointment) => ({
          ...appointment,
          recordType: "Appointment",
        }));

        const formattedTestOrders = testOrderResponse.data.map((order) => ({
          patientName: order.patientName,
          date: order.date,
          time: order.time,
          tests: order.tests || [],
          totalAmount: order.totalAmount || 0,
          hospitalRevenue: order.hospitalRevenue,
          recordType: "Test Order",
        }));

        const hospitalRecords = [...formattedAppointments, ...formattedTestOrders].sort((a, b) => new Date(b.date) - new Date(a.date));

        // Process monthly data
        const appointmentMonthlyData = appointmentResponse.data.monthly || [];
        const testOrdersByMonth = {};
        testOrderResponse.data.forEach((order) => {
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
        Object.keys(testOrdersByMonth).forEach((month) => {
          const existingMonthIndex = combinedMonthlyData.findIndex((item) => item._id === month);
          if (existingMonthIndex >= 0) {
            combinedMonthlyData[existingMonthIndex].revenue += testOrdersByMonth[month].revenue;
            combinedMonthlyData[existingMonthIndex].count += testOrdersByMonth[month].count;
          } else {
            combinedMonthlyData.push({
              _id: month,
              revenue: testOrdersByMonth[month].revenue,
              count: testOrdersByMonth[month].count,
            });
          }
        });

        combinedMonthlyData.sort((a, b) => {
          const monthOrder = {
            January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
            July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
          };
          return monthOrder[a._id] - monthOrder[b._id];
        });

        setHospitalData({
          totalRevenue: (appointmentResponse.data.summary.totalRevenue || 0) + totalTestOrderRevenue,
          appointments: (appointmentResponse.data.summary.appointments || 0) + totalTestOrders,
          monthlyData: combinedMonthlyData,
          records: hospitalRecords,
          filteredRecords: hospitalRecords,
        });

        // Process doctor data
        const doctorResponse = await axios.get("https://medi-plus-diagnostic-center-bdbv.vercel.app/appointments/revenue/doctor").catch(() => ({ data: { doctors: [], summary: {} } }));
        const doctorsRevenue = (doctorResponse.data.doctors || []).filter((doctor) => doctor._id !== null);
        const testOrdersByDoctor = {};
        testOrderResponse.data.forEach((order) => {
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

        Object.keys(testOrdersByDoctor).forEach((doctorName) => {
          combinedDoctors.push({
            _id: doctorName,
            totalRevenue: testOrdersByDoctor[doctorName].totalRevenue,
            appointments: testOrdersByDoctor[doctorName].appointments,
          });
          totalDoctorTestRevenue += testOrdersByDoctor[doctorName].totalRevenue;
          totalDoctorTestOrders += testOrdersByDoctor[doctorName].appointments;
        });

        setDoctorData({
          doctors: combinedDoctors,
          totalDoctorRevenue: (doctorResponse.data.summary.totalDoctorRevenue || 0) + totalDoctorTestRevenue,
          totalAppointments: doctorsRevenue.reduce((sum, doctor) => sum + doctor.appointments, 0) + totalDoctorTestOrders,
          doctorRecords: [],
          filteredDoctorRecords: [],
        });

        // Process broker data
        const brokerResponse = await axios.get("https://medi-plus-diagnostic-center-bdbv.vercel.app/appointments/revenue/broker").catch(() => ({ data: { brokers: [], summary: {} } }));
        const filteredBrokers = (brokerResponse.data.brokers || []).filter((broker) => broker._id !== null);
        setBrokerData({
          brokers: filteredBrokers,
          totalBrokerRevenue: brokerResponse.data.summary.totalBrokerRevenue || 0,
          totalAppointments: filteredBrokers.reduce((sum, broker) => sum + broker.appointments, 0),
          brokerAppointments: [],
          filteredBrokerAppointments: [],
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

  return (
    <>
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
        <div className={`flex-1 p-6 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-0'}`}>
          <div className="flex-1 p-6 ml-40">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Revenue Dashboard</h1>
            
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'hospital' 
                    ? 'border-b-2 border-blue-500 text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('hospital')}
              >
                Hospital Revenue
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'doctor' 
                    ? 'border-b-2 border-blue-500 text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('doctor')}
              >
                Doctor Revenue
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === 'broker' 
                    ? 'border-b-2 border-blue-500 text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('broker')}
              >
                Broker Revenue
              </button>
            </div>

            {/* Render active tab content */}
            {activeTab === 'hospital' && (
              <HospitalRevenue
                hospitalData={hospitalData}
                hospitalDateFilter={hospitalDateFilter}
                hospitalCustomDateRange={hospitalCustomDateRange}
                setHospitalDateFilter={setHospitalDateFilter}
                setHospitalCustomDateRange={setHospitalCustomDateRange}
                handleHospitalDateFilterChange={handleHospitalDateFilterChange}
                applyHospitalDateFilter={applyHospitalDateFilter}
                resetHospitalFilters={resetHospitalFilters}
                loading={loading}
              />
            )}

            {activeTab === 'doctor' && (
              <DoctorRevenue
                doctorData={doctorData}
                doctorDateFilter={doctorDateFilter}
                doctorCustomDateRange={doctorCustomDateRange}
                selectedDoctor={selectedDoctor}
                setDoctorCustomDateRange={setDoctorCustomDateRange}
                handleDoctorDateFilterChange={handleDoctorDateFilterChange}
                applyDoctorDateFilter={applyDoctorDateFilter}
                resetDoctorFilters={resetDoctorFilters}
                handleDoctorSelect={handleDoctorSelect}
                loading={loading}
                filterRecordsByDateRange={filterRecordsByDateRange}
              />
            )}

            {activeTab === 'broker' && (
              <BrokerRevenue
                brokerData={brokerData}
                brokerDateFilter={brokerDateFilter}
                brokerCustomDateRange={brokerCustomDateRange}
                selectedBroker={selectedBroker}
                setBrokerCustomDateRange={setBrokerCustomDateRange}
                handleBrokerDateFilterChange={handleBrokerDateFilterChange}
                applyBrokerDateFilter={applyBrokerDateFilter}
                resetBrokerFilters={resetBrokerFilters}
                handleBrokerSelect={handleBrokerSelect}
                loading={loading}
                filterRecordsByDateRange={filterRecordsByDateRange}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default RevenueDashboard;