import React, { useState, useEffect, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Calendar } from "lucide-react";
import * as XLSX from "xlsx";
import axios from "axios";
import { toast } from "react-toastify";

const DoctorRevenue = ({
  doctorDateFilter,
  doctorCustomDateRange,
  selectedDoctor,
  setDoctorCustomDateRange,
  handleDoctorDateFilterChange,
  applyDoctorDateFilter,
  resetDoctorFilters,
  filterRecordsByDateRange,
  handleDoctorSelect,
}) => {
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  const [doctorPayments, setDoctorPayments] = useState({});
  const [exportLoading, setExportLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState({});
  const [allTestOrders, setAllTestOrders] = useState([]);
  const [testsMap, setTestsMap] = useState({});

  // Fetch all tests for commissions
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await axios.get("https://medi-plus-diagnostic-center-bdbv.vercel.app/tests?isActive=true");
        const map = {};
        res.data.forEach(t => {
          map[t.title.toLowerCase()] = t.doctorCommissionPercentage || 0;
        });
        setTestsMap(map);
      } catch (error) {
        console.error("Error fetching tests:", error);
        toast.error("Failed to fetch test commissions");
      }
    };
    fetchTests();
  }, []);

  // Function to calculate doctor revenue for an order
  const calculateDoctorRevenue = (order) => {
    let drRev = 0;
    (order.tests || []).forEach(test => {
      const perc = testsMap[test.testName.toLowerCase()] || 0;
      if (perc > 0) {
        drRev += (test.testPrice || 0) * (perc / 100);
      }
    });
    return drRev;
  };

  // Fetch all test orders
  useEffect(() => {
    const fetchAllTestOrders = async () => {
      try {
        const res = await axios.get("https://medi-plus-diagnostic-center-bdbv.vercel.app/testorders");
        setAllTestOrders(res.data);
      } catch (error) {
        console.error("Error fetching test orders:", error);
        toast.error("Failed to fetch test orders");
      }
    };
    fetchAllTestOrders();
  }, []);

  // Compute filtered test orders
  const filteredTestOrders = useMemo(
    () => filterRecordsByDateRange(allTestOrders, doctorDateFilter, doctorCustomDateRange),
    [allTestOrders, doctorDateFilter, doctorCustomDateRange, filterRecordsByDateRange]
  );

  // Compute doctors data
  const computedDoctors = useMemo(() => {
    const doctorMap = {};
    filteredTestOrders.forEach((order) => {
      const doctorName = order.doctorName;
      if (!doctorName) return;
      if (!doctorMap[doctorName]) {
        doctorMap[doctorName] = { _id: doctorName, totalRevenue: 0, appointments: 0 };
      }
      const drRev = calculateDoctorRevenue(order);
      doctorMap[doctorName].totalRevenue += drRev;
      doctorMap[doctorName].appointments += 1;
    });
    return Object.values(doctorMap);
  }, [filteredTestOrders, testsMap]);

  // Calculate total due revenue (total revenue minus payments)
  const totalDoctorRevenue = computedDoctors.reduce((sum, d) => {
    const payment = doctorPayments[d._id] || 0;
    const dueAmount = Math.max(d.totalRevenue - payment, 0);
    return sum + dueAmount;
  }, 0);

  const totalRecords = filteredTestOrders.length;
  const activeDoctors = computedDoctors.length;

  // Fetch payment data
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const promises = computedDoctors.map((doctor) =>
          axios.get(`https://medi-plus-diagnostic-center-bdbv.vercel.app/doctorPayments/${doctor._id}`, {
            params: { dateFilter: doctorDateFilter },
          })
        );
        const responses = await Promise.all(promises);
        const payments = responses.reduce((acc, res, index) => {
          const payment = res.data.find((p) => p.dateFilter === doctorDateFilter) || {};
          return { ...acc, [computedDoctors[index]._id]: payment.paymentAmount || 0 };
        }, {});
        setDoctorPayments(payments);
      } catch (error) {
        console.error("Error fetching payments:", error);
        toast.error("Failed to fetch payment data");
      }
    };
    if (computedDoctors.length > 0) {
      fetchPayments();
    }
  }, [computedDoctors, doctorDateFilter]);

  // Handle payment input change
  const handlePaymentChange = (doctorId, payment) => {
    const paymentAmount = Math.max(Number(payment) || 0, 0);
    setDoctorPayments((prev) => ({
      ...prev,
      [doctorId]: paymentAmount,
    }));
  };

  // Save payment to backend
  const handleSavePayment = async (doctorId) => {
    if (!doctorId || !doctorDateFilter) {
      toast.error("Doctor name or date filter is missing");
      return;
    }

    setSaveLoading((prev) => ({ ...prev, [doctorId]: true }));
    const paymentAmount = Number(doctorPayments[doctorId]) || 0;

    if (isNaN(paymentAmount) || paymentAmount < 0) {
      toast.error("Invalid payment amount");
      setSaveLoading((prev) => ({ ...prev, [doctorId]: false }));
      return;
    }

    // Prepare payload
    const payload = {
      doctorName: doctorId,
      paymentAmount,
      dateFilter: doctorDateFilter,
    };

    // Only include customDateRange if dateFilter is 'custom' and it has valid values
    if (doctorDateFilter === 'custom' && doctorCustomDateRange.start && doctorCustomDateRange.end) {
      payload.customDateRange = {
        start: doctorCustomDateRange.start,
        end: doctorCustomDateRange.end,
      };
    }

    try {
      console.log("Sending payment payload:", payload); // Debug log
      const response = await axios.post(`https://medi-plus-diagnostic-center-bdbv.vercel.app/doctorPayments`, payload);
      setDoctorPayments((prev) => ({
        ...prev,
        [doctorId]: response.data.paymentAmount || 0,
      }));
      toast.success("Payment saved successfully!");
    } catch (error) {
      console.error("Error saving payment:", error);
      const errorMessage = error.response?.data?.message || "Failed to save payment";
      toast.error(errorMessage);
      if (error.response?.status === 400) {
        console.log("Bad Request details:", error.response.data);
      }
    } finally {
      setSaveLoading((prev) => ({ ...prev, [doctorId]: false }));
    }
  };

  // Export doctor data
  const handleExportDoctor = async (doctorName) => {
    if (exportLoading) return;
    setExportLoading(true);
    try {
      const paymentResponse = await axios.get(`https://medi-plus-diagnostic-center-bdbv.vercel.app/doctorPayments/${doctorName}`, {
        params: { dateFilter: doctorDateFilter },
      });
      const paymentData = paymentResponse.data.find((p) => p.dateFilter === doctorDateFilter) || {};
      const payment = Number(paymentData.paymentAmount) || 0;

      const filteredRecords = filteredTestOrders.filter((order) => order.doctorName === doctorName);

      const totalRevenue = filteredRecords.reduce((sum, order) => sum + calculateDoctorRevenue(order), 0);
      const dueAmount = Math.max(totalRevenue - payment, 0);

      const data = filteredRecords.map((order) => {
        const recordRevenue = calculateDoctorRevenue(order);
        // Calculate proportional payment share based on record's contribution to total revenue
        const paymentShare = totalRevenue > 0 ? (recordRevenue / totalRevenue) * payment : 0;
        // Calculate due amount for this record (remaining revenue after payment)
        const recordDueAmount = Math.max(recordRevenue - paymentShare, 0);
        
        return {
          "Patient Name": order.patientName,
          Date: order.date,
          Type: "Test Order",
          "Test Details": order.tests?.map((test) => test.testName).join(", ") || "N/A",
          "Original Revenue": recordRevenue.toFixed(2),
          "Payment Share": paymentShare.toFixed(2),
          "Due Amount": recordDueAmount.toFixed(2),
        };
      });

      data.push({
        "Patient Name": "Total",
        "Original Revenue": totalRevenue.toFixed(2),
        "Payment Share": payment.toFixed(2),
        "Due Amount": dueAmount.toFixed(2),
      });

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, `Doctor_${doctorName}`);
      XLSX.writeFile(wb, `doctor_${doctorName}_monthly_revenue.xlsx`);
      toast.success("Report exported successfully!");
    } catch (error) {
      console.error("Error exporting doctor revenue:", error);
      toast.error("Failed to export doctor revenue");
    } finally {
      setExportLoading(false);
    }
  };

  // Chart data should show due amounts (revenue minus payments)
  const doctorChartData = computedDoctors.map((doctor) => {
    const payment = doctorPayments[doctor._id] || 0;
    const dueAmount = Math.max(doctor.totalRevenue - payment, 0);
    return {
      name: doctor._id,
      value: dueAmount,
    };
  });

  const displayRecords = selectedDoctor
    ? filteredTestOrders
        .filter((order) => order.doctorName === selectedDoctor)
        .map((order) => {
          const originalRevenue = calculateDoctorRevenue(order);
          const doctorData = computedDoctors.find(d => d._id === selectedDoctor);
          const totalDoctorRevenue = doctorData ? doctorData.totalRevenue : 0;
          const totalPayment = doctorPayments[selectedDoctor] || 0;
          
          // Calculate proportional payment share for this record
          const paymentShare = totalDoctorRevenue > 0 ? (originalRevenue / totalDoctorRevenue) * totalPayment : 0;
          // Calculate due amount (remaining revenue after payment)
          const dueRevenue = Math.max(originalRevenue - paymentShare, 0);
          
          return {
            patientName: order.patientName,
            date: order.date,
            recordType: "Test Order",
            tests: order.tests,
            totalAmount: order.totalAmount || 0,
            originalRevenue: originalRevenue,
            paymentShare: paymentShare,
            doctorRevenue: dueRevenue, // This now shows the due amount
          };
        })
    : [];

  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700">Total Doctor Due Revenue</h3>
          <p className="text-2xl font-bold text-purple-600">{totalDoctorRevenue.toFixed(0)} Taka</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700">Total Records</h3>
          <p className="text-2xl font-bold text-purple-600">{totalRecords}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700">Active Doctors</h3>
          <p className="text-2xl font-bold text-purple-600">{activeDoctors}</p>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Due Revenue Distribution by Doctor</h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={doctorChartData.filter((entry) => entry.name && entry.value > 0)}
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
      </div>

      {/* Doctor Details */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Doctor Details</h3>
        <div className="max-h-96 overflow-y-auto">
          {computedDoctors.map((doctor, index) => {
            if (!doctor._id) return null;
            
            const payment = doctorPayments[doctor._id] || 0;
            const dueAmount = Math.max(doctor.totalRevenue - payment, 0);
            const avgDueRevenue = doctor.appointments > 0 ? (dueAmount / doctor.appointments) : 0;
            
            return (
              <div key={index} className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="font-medium text-gray-900">Dr. {doctor._id}</div>
                  <div className="flex gap-4 items-center">
                    <div className="text-right">
                      <div className="font-bold text-purple-600">
                        {dueAmount.toFixed(0)} Taka (Due)
                      </div>
                      <div className="text-sm text-gray-600">
                        Original: {doctor.totalRevenue.toFixed(0)} Taka | Paid: {payment.toFixed(0)} Taka
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
                  Avg Due: {avgDueRevenue.toFixed(0)} Taka per record
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Records for Dr. {selectedDoctor || 'Select a Doctor'}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left text-sm font-semibold text-gray-700">Patient Name</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-700">Type</th>
                <th className="p-3 text-left text-sm font-semibold text-gray-700">Test Details</th>
                <th className="p-3 text-right text-sm font-semibold text-gray-700">Total Amount</th>
                <th className="p-3 text-right text-sm font-semibold text-gray-700">Original Revenue</th>
                <th className="p-3 text-right text-sm font-semibold text-gray-700">Payment Share</th>
                <th className="p-3 text-right text-sm font-semibold text-gray-700">Due Revenue</th>
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
                      {record.tests?.map((test) => test.testName).join(", ") || 'N/A'}
                    </td>
                    <td className="p-3 text-right border-b border-gray-200">{record.totalAmount.toFixed(0)} Taka</td>
                    <td className="p-3 text-right border-b border-gray-200">{record.originalRevenue.toFixed(0)} Taka</td>
                    <td className="p-3 text-right border-b border-gray-200 text-green-600">{record.paymentShare.toFixed(0)} Taka</td>
                    <td className="p-3 text-right border-b border-gray-200 font-bold text-purple-600">
                      {record.doctorRevenue.toFixed(0)} Taka
                    </td>
                  </tr>
                ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100">
                <td colSpan="7" className="p-3 text-right font-bold">
                  Total ({displayRecords.length > 10 ? `showing 10 of ${displayRecords.length}` : displayRecords.length}):
                </td>
                <td className="p-3 text-right font-bold text-purple-600">
                  {displayRecords
                    .slice(0, 10)
                    .reduce((sum, record) => sum + record.doctorRevenue, 0)
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
      </div>
    </>
  );
};

export default DoctorRevenue;