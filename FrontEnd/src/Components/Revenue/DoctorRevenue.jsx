import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Calendar } from "lucide-react";
import * as XLSX from "xlsx";
import axios from "axios";
import { toast } from "react-toastify";

const DoctorRevenue = ({
  doctorData,
  doctorDateFilter,
  doctorCustomDateRange,
  selectedDoctor,
  setDoctorCustomDateRange,
  handleDoctorDateFilterChange,
  applyDoctorDateFilter,
  resetDoctorFilters,
  handleDoctorSelect,
  loading,
  filterRecordsByDateRange,
}) => {
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  const [doctorPayments, setDoctorPayments] = useState({});
  const [exportLoading, setExportLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState({});

  // Fetch payment data on mount or date filter change
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const promises = doctorData.doctors.map((doctor) =>
          axios.get(`https://medi-plus-diagnostic-center-bdbv.vercel.app/doctorPayments/${doctor._id}`, {
            params: { dateFilter: doctorDateFilter },
          })
        );
        const responses = await Promise.all(promises);
        const payments = responses.reduce((acc, res, index) => {
          const payment = res.data.find((p) => p.dateFilter === doctorDateFilter) || {};
          return { ...acc, [doctorData.doctors[index]._id]: payment.paymentAmount || 0 };
        }, {});
        setDoctorPayments(payments);
      } catch (error) {
        console.error("Error fetching payments:", error);
        toast.error("Failed to fetch payment data");
      }
    };
    fetchPayments();
  }, [doctorData.doctors, doctorDateFilter]);

  // Handle payment input change (local state only)
  const handlePaymentChange = (doctorId, payment) => {
    const paymentAmount = Math.max(Number(payment) || 0, 0);
    setDoctorPayments((prev) => ({
      ...prev,
      [doctorId]: paymentAmount,
    }));
  };

  // Save payment to backend
  const handleSavePayment = async (doctorId) => {
    setSaveLoading((prev) => ({ ...prev, [doctorId]: true }));
    const paymentAmount = doctorPayments[doctorId] || 0;

    try {
      const response = await axios.post(`https://medi-plus-diagnostic-center-bdbv.vercel.app/doctorPayments`, {
        doctorName: doctorId,
        paymentAmount,
        dateFilter: doctorDateFilter,
        customDateRange: doctorDateFilter === 'custom' ? doctorCustomDateRange : {},
      });
      if (response.data.message === 'Payment cannot exceed total revenue') {
        toast.error("Payment cannot exceed total revenue!");
        setSaveLoading((prev) => ({ ...prev, [doctorId]: false }));
        return;
      }
      setDoctorPayments((prev) => ({
        ...prev,
        [doctorId]: response.data.paymentAmount || 0,
      }));
      toast.success("Payment saved successfully!");
    } catch (error) {
      console.error("Error saving payment:", error);
      toast.error("Failed to save payment");
    } finally {
      setSaveLoading((prev) => ({ ...prev, [doctorId]: false }));
    }
  };

  // Fetch doctor records
  const fetchDoctorRecords = async (doctorName) => {
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

      return [...formattedAppointments, ...formattedTestOrders].sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
      console.error("Error fetching doctor records:", error);
      throw error;
    }
  };

  // Export doctor data
  const handleExportDoctor = async (doctorName) => {
    if (exportLoading) return;
    setExportLoading(true);
    try {
      // Fetch latest payment data
      const paymentResponse = await axios.get(`https://medi-plus-diagnostic-center-bdbv.vercel.app/doctorPayments/${doctorName}`, {
        params: { dateFilter: doctorDateFilter },
      });
      const paymentData = paymentResponse.data.find((p) => p.dateFilter === doctorDateFilter) || {};
      const payment = Number(paymentData.paymentAmount) || 0;

      const combinedRecords = await fetchDoctorRecords(doctorName);
      const filteredRecords = filterRecordsByDateRange(combinedRecords, doctorDateFilter, doctorCustomDateRange);

      const totalRevenue = filteredRecords.reduce((sum, record) => sum + (Number(record.doctorRevenue) || 0), 0);

      // Distribute payment proportionally across records based on revenue
      const data = filteredRecords.map((record) => {
        const recordRevenue = Number(record.doctorRevenue) || 0;
        const paymentShare = totalRevenue > 0 ? (recordRevenue / totalRevenue) * payment : 0;
        const dueAmount = recordRevenue - paymentShare;
        return {
          "Patient Name": record.patientName,
          Date: record.date,
          Type: record.recordType,
          Details: record.disease || record.tests?.map((test) => test.testName).join(", ") || "N/A",
          Revenue: recordRevenue.toFixed(2),
          "Payment Share": paymentShare.toFixed(2),
          "Due Amount": dueAmount.toFixed(2),
        };
      });

      // Add total row
      data.push({
        "Patient Name": "Total",
        Revenue: totalRevenue.toFixed(2),
        "Payment Share": payment.toFixed(2),
        "Due Amount": (totalRevenue - payment).toFixed(2),
      });

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, `Doctor_${doctorName}`);
      XLSX.writeFile(wb, `doctor_${doctorName}_revenue.xlsx`);
      toast.success("Report exported successfully!");
    } catch (error) {
      console.error("Error exporting doctor revenue:", error);
      toast.error("Failed to export doctor revenue");
    } finally {
      setExportLoading(false);
    }
  };

  const doctorChartData = doctorData.doctors.map((doctor) => ({
    name: doctor._id,
    value: doctor.totalRevenue,
  }));

  const displayRecords = (doctorData.filteredDoctorRecords && doctorData.filteredDoctorRecords.length > 0)
    ? doctorData.filteredDoctorRecords
    : (doctorData.doctorRecords || []);

  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
      </div>

      {/* Date Filter */}
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

      {/* Chart */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Distribution by Doctor</h3>
        {loading ? (
          <p className="text-gray-600">Loading chart data...</p>
        ) : (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={doctorChartData.filter((entry) => entry.name && entry.value)}
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
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Doctor Details */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Doctor Details</h3>
        <div className="max-h-96 overflow-y-auto">
          {doctorData.doctors.map((doctor, index) => (
            doctor._id && (
              <div key={index} className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="font-medium text-gray-900">Dr. {doctor._id}</div>
                  <div className="flex gap-4 items-center">
                    <div className="text-right">
                      <div className="font-bold text-purple-600">
                        {(doctor.totalRevenue - (doctorPayments[doctor._id] || 0)).toFixed(0)} Taka (Due)
                      </div>
                      <div className="text-sm text-gray-600">Records: {doctor.appointments}</div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="block text-sm font-medium text-gray-700">Payment</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="0"
                          value={doctorPayments[doctor._id] || ""}
                          onChange={(e) => handlePaymentChange(doctor._id, e.target.value)}
                          className="w-24 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter payment"
                        />
                        <button
                          onClick={() => handleSavePayment(doctor._id)}
                          className={`px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${saveLoading[doctor._id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={saveLoading[doctor._id]}
                        >
                          {saveLoading[doctor._id] ? 'Saving...' : 'Save Payment'}
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDoctorSelect(doctor._id)}
                      className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleExportDoctor(doctor._id)}
                      className={`px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors ${exportLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={exportLoading}
                    >
                      {exportLoading ? 'Exporting...' : 'Export'}
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Avg: {doctor.appointments > 0 ? (doctor.totalRevenue / doctor.appointments).toFixed(0) : 0} Taka
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Records for Dr. {selectedDoctor || 'Select a Doctor'}
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
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Type</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Details</th>
                  <th className="p-3 text-right text-sm font-semibold text-gray-700">Total Amount</th>
                  <th className="p-3 text-right text-sm font-semibold text-gray-700">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {displayRecords
                  .slice(0, 10)
                  .map((record, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3 border-b border-gray-200">{record.patientName}</td>
                      <td className="p-3 border-b border-gray-200">{record.date}</td>
                      <td className="p-3 border-b border-gray-200">{record.recordType || 'N/A'}</td>
                      <td className="p-3 border-b border-gray-200">
                        {record.tests?.map((test) => test.testName).join(", ") || record.disease || 'N/A'}
                      </td>
                      <td className="p-3 text-right border-b border-gray-200">{record.totalAmount?.toFixed(0) || 0} Taka</td>
                      <td className="p-3 text-right border-b border-gray-200 font-bold text-purple-600">
                        {record.doctorRevenue?.toFixed(0) || 0} Taka
                      </td>
                    </tr>
                  ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100">
                  <td colSpan="5" className="p-3 text-right font-bold">
                    Total ({displayRecords.length > 10 ? `showing 10 of ${displayRecords.length}` : displayRecords.length}):
                  </td>
                  <td className="p-3 text-right font-bold text-purple-600">
                    {displayRecords
                      .slice(0, 10)
                      .reduce((sum, record) => sum + (record.doctorRevenue || 0), 0)
                      .toFixed(0)} Taka
                  </td>
                </tr>
              </tfoot>
            </table>
            {displayRecords.length > 10 && (
              <p className="text-center text-gray-600 mt-4">
                Showing 10 of {displayRecords.length} records
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default DoctorRevenue;