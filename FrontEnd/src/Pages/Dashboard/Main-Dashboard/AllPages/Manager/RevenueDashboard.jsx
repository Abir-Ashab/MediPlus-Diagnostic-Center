import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { useSelector } from "react-redux";
import Sidebar from "../../GlobalFiles/Sidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import * as XLSX from "xlsx";

const ManagerRevenueDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [doctorData, setDoctorData] = useState([]);
  const [agentData, setAgentData] = useState([]);
  const [hospitalData, setHospitalData] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("hospital");
  const [selectedMonth, setSelectedMonth] = useState(moment().format("YYYY-MM"));
  const [patientModal, setPatientModal] = useState({ visible: false, title: '', patients: [], exportData: [] });
  const [allOrders, setAllOrders] = useState([]);

  const {
    data: { user },
  } = useSelector((state) => state.auth);

  const isManager = user?.userType === "manager";

  useEffect(() => {
    if (isManager) {
      fetchRevenueData();
    }
  }, [isManager, selectedMonth]);

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      const startDate = moment(selectedMonth).startOf("month").toDate();
      const endDate = moment(selectedMonth).endOf("month").toDate();

      const response = await axios.get("https://medi-plus-diagnostic-center-bdbv.vercel.app/testorders/reports/revenue", {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });

      const { doctorBreakdown, agentBreakdown, orders } = response.data;
      setAllOrders(orders || []);

      // Helper: get detailed patient info for a doctor/agent/date
      const getPatientDetails = (filterKey, filterValue) => {
        return orders
          .filter(order => order[filterKey] === filterValue)
          .map(order => ({
            patientName: order.patientName,
            age: order.age,
            gender: order.gender,
            mobile: order.mobile,
            email: order.email,
            address: order.address,
            testNames: order.tests?.map(t => t.testName).join(', '),
            totalAmount: order.totalAmount,
            paidAmount: order.paidAmount,
            dueAmount: order.dueAmount,
            date: order.date,
            doctorName: order.doctorName,
            agentName: order.agentName,
          }));
      };

      const doctorSummary = Object.entries(doctorBreakdown).map(([name, data]) => ({
        doctorName: name,
        totalPatients: data.orders,
        totalDue: data.commission,
        getPatientDetails: () => getPatientDetails('doctorName', name),
      }));

      const agentSummary = Object.entries(agentBreakdown).map(([name, data]) => ({
        agentName: name,
        totalPatients: data.orders,
        totalDue: data.commission,
        getPatientDetails: () => getPatientDetails('agentName', name),
      }));

      setDoctorData(doctorSummary);
      setAgentData(agentSummary);

      // Hospital daily summary
      const hospitalSummary = {};
      orders.forEach(order => {
        const date = order.date;
        if (date) {
          if (!hospitalSummary[date]) {
            hospitalSummary[date] = { totalAmount: 0, paidAmount: 0, dueAmount: 0 };
          }
          hospitalSummary[date].totalAmount += order.totalAmount || 0;
          hospitalSummary[date].paidAmount += order.paidAmount || 0;
          hospitalSummary[date].dueAmount += order.dueAmount || 0;
        }
      });

      const hospitalDaily = Object.entries(hospitalSummary).map(([date, data]) => ({
        date,
        ...data,
        getPatientDetails: () => getPatientDetails('date', date),
      })).sort((a, b) => new Date(a.date) - new Date(b.date));

      setHospitalData(hospitalDaily);
    } catch (error) {
      toast.error("Error fetching revenue data");
      console.error("Error fetching revenue data:", error);
    }
    setLoading(false);
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const exportToExcel = (data, filename) => {
    // Remove getPatientDetails property if present (for doctor/agent summary export)
    const cleanData = data.map(row => {
      const { getPatientDetails, ...rest } = row;
      return rest;
    });
    const worksheet = XLSX.utils.json_to_sheet(cleanData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, `${filename}_${selectedMonth}.xlsx`);
  };

  const hospitalColumns = [
    { key: "date", label: "Date", render: (record) => (
      <button
        className="text-blue-600 underline hover:text-blue-800"
        onClick={() => setPatientModal({
          visible: true,
          title: `Patients on ${record.date}`,
          patients: record.getPatientDetails(),
          exportData: record.getPatientDetails(),
        })}
        type="button"
      >
        {record.date}
      </button>
    ) },
    { key: "totalAmount", label: "Total Provided (₹)", render: (record) => record.totalAmount.toFixed(2) },
    { key: "paidAmount", label: "Paid (₹)", render: (record) => record.paidAmount.toFixed(2) },
    { key: "dueAmount", label: "Due (₹)", render: (record) => record.dueAmount.toFixed(2) },
  ];

  const doctorColumns = [
    { key: "doctorName", label: "Doctor Name", render: (record) => (
      <button
        className="text-blue-600 underline hover:text-blue-800"
        onClick={() => setPatientModal({
          visible: true,
          title: `Patients for Dr. ${record.doctorName}`,
          patients: record.getPatientDetails(),
          exportData: record.getPatientDetails(),
        })}
        type="button"
      >
        {record.doctorName}
      </button>
    ) },
    { key: "totalPatients", label: "Total Patients", render: (record) => record.totalPatients },
    { key: "totalDue", label: "Total Due (₹)", render: (record) => record.totalDue.toFixed(2) },
  ];

  const agentColumns = [
    { key: "agentName", label: "Agent Name", render: (record) => (
      <button
        className="text-blue-600 underline hover:text-blue-800"
        onClick={() => setPatientModal({
          visible: true,
          title: `Patients for Agent ${record.agentName}`,
          patients: record.getPatientDetails(),
          exportData: record.getPatientDetails(),
        })}
        type="button"
      >
        {record.agentName}
      </button>
    ) },
    { key: "totalPatients", label: "Total Patients", render: (record) => record.totalPatients },
    { key: "totalDue", label: "Total Due (₹)", render: (record) => record.totalDue.toFixed(2) },
  ];

  const renderTable = (columns, data, showFooter = false) => (
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
          {data.map((record, index) => (
            <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              {columns.map((col) => (
                <td key={col.key} className="p-3 border-b border-gray-200">
                  {col.render(record)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {showFooter && (
          <tfoot>
            <tr className="bg-gray-200 font-bold">
              <td className="p-3">Total</td>
              <td className="p-3">{data.reduce((sum, r) => sum + r.totalAmount, 0).toFixed(2)}</td>
              <td className="p-3">{data.reduce((sum, r) => sum + r.paidAmount, 0).toFixed(2)}</td>
              <td className="p-3">{data.reduce((sum, r) => sum + r.dueAmount, 0).toFixed(2)}</td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );

  if (!isManager) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 p-4 md:p-8 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">Only managers can access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
      {/* Patient Detail Modal */}
      {patientModal.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold"
              onClick={() => setPatientModal({ visible: false, title: '', patients: [], exportData: [] })}
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-4">{patientModal.title}</h2>
            <button
              className="mb-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={() => exportToExcel(patientModal.exportData, patientModal.title.replace(/\s+/g, '_'))}
            >
              Export Patient Details
            </button>
            {patientModal.patients.length > 0 ? (
              <div className="overflow-x-auto max-h-96">
                <table className="min-w-full border border-gray-200 text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 border">Name</th>
                      <th className="p-2 border">Age</th>
                      <th className="p-2 border">Gender</th>
                      <th className="p-2 border">Mobile</th>
                      <th className="p-2 border">Email</th>
                      <th className="p-2 border">Address</th>
                      <th className="p-2 border">Tests</th>
                      <th className="p-2 border">Total</th>
                      <th className="p-2 border">Paid</th>
                      <th className="p-2 border">Due</th>
                      <th className="p-2 border">Doctor</th>
                      <th className="p-2 border">Agent</th>
                      <th className="p-2 border">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientModal.patients.map((p, idx) => (
                      <tr key={idx}>
                        <td className="p-2 border">{p.patientName}</td>
                        <td className="p-2 border">{p.age}</td>
                        <td className="p-2 border">{p.gender}</td>
                        <td className="p-2 border">{p.mobile}</td>
                        <td className="p-2 border">{p.email}</td>
                        <td className="p-2 border">{p.address}</td>
                        <td className="p-2 border">{p.testNames}</td>
                        <td className="p-2 border">{p.totalAmount}</td>
                        <td className="p-2 border">{p.paidAmount}</td>
                        <td className="p-2 border">{p.dueAmount}</td>
                        <td className="p-2 border">{p.doctorName}</td>
                        <td className="p-2 border">{p.agentName}</td>
                        <td className="p-2 border">{p.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No patients found.</p>
            )}
          </div>
        </div>
      )}
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar onCollapse={setSidebarCollapsed} />
        <div className={`flex-1 p-6 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-0'}`}>
          <div className="flex-1 p-6 ml-40">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Doctor & Agent Revenue Report
              </h1>
              <div className="flex items-center space-x-4">
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={handleMonthChange}
                  className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => exportToExcel(activeTab === "hospital" ? hospitalData : activeTab === "doctors" ? doctorData : agentData, activeTab)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export to Excel
                </button>
              </div>
            </div>
            {loading ? (
              <div className="text-center p-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading revenue data...</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex border-b border-gray-200 mb-6">
                  <button
                    className={`px-4 py-2 font-medium text-sm flex items-center ${activeTab === "hospital" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                    onClick={() => setActiveTab("hospital")}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Hospital
                  </button>
                  <button
                    className={`px-4 py-2 font-medium text-sm flex items-center ${activeTab === "doctors" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                    onClick={() => setActiveTab("doctors")}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Doctors
                  </button>
                  <button
                    className={`px-4 py-2 font-medium text-sm flex items-center ${activeTab === "agents" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                    onClick={() => setActiveTab("agents")}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Agents
                  </button>
                </div>
                {activeTab === "hospital" && renderTable(hospitalColumns, hospitalData, true)}
                {activeTab === "doctors" && renderTable(doctorColumns, doctorData)}
                {activeTab === "agents" && renderTable(agentColumns, agentData)}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ManagerRevenueDashboard;