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
  const [refreshKey, setRefreshKey] = useState(0); // Add this to force refresh after payment
  const [commissionOverrides, setCommissionOverrides] = useState({});

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


  // Compute filtered test orders (move this up before any use)
  const filteredTestOrders = useMemo(
    () => filterRecordsByDateRange(allTestOrders, doctorDateFilter, doctorCustomDateRange),
    [allTestOrders, doctorDateFilter, doctorCustomDateRange, filterRecordsByDateRange]
  );

  // Aggregate test-wise data for selected doctor
  const getTestWiseData = (orders) => {
    const testMap = {};
    orders.forEach(order => {
      (order.tests || []).forEach(test => {
        const key = test.testName.toLowerCase();
        if (!testMap[key]) {
          testMap[key] = {
            testName: test.testName,
            price: test.testPrice || 0,
            count: 0,
            commission: commissionOverrides[key] !== undefined ? commissionOverrides[key] : (testsMap[key] || 0),
          };
        }
        testMap[key].count += 1;
      });
    });
    return Object.values(testMap);
  };

  // For table and export: test-wise data for selected doctor
  const testWiseData = useMemo(() => {
    if (!selectedDoctor) return [];
    const doctorOrders = filteredTestOrders.filter(order => order.doctorName === selectedDoctor);
    return getTestWiseData(doctorOrders);
  }, [filteredTestOrders, selectedDoctor, commissionOverrides, testsMap]);

  // Handle commission % change
  const handleCommissionChange = (key, value) => {
    setCommissionOverrides(prev => ({ ...prev, [key]: Number(value) }));
  };

  // Fetch all test orders (refresh when payment is made)
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
  }, [refreshKey]); // Add refreshKey as dependency


  // Compute doctors data
  const computedDoctors = useMemo(() => {
    const doctorMap = {};
    filteredTestOrders.forEach((order) => {
      const doctorName = order.doctorName;
      if (!doctorName) return;
      if (!doctorMap[doctorName]) {
        doctorMap[doctorName] = { _id: doctorName, totalRevenue: 0, appointments: 0 };
      }
      const drRev = order.doctorRevenue;
      doctorMap[doctorName].totalRevenue += drRev;
      doctorMap[doctorName].appointments += 1;
    });
    return Object.values(doctorMap);
  }, [filteredTestOrders, testsMap, refreshKey]); // Add refreshKey dependency

  const totalDoctorRevenue = computedDoctors.reduce((sum, d) => sum + d.totalRevenue, 0);
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
  }, [computedDoctors, doctorDateFilter, refreshKey]); // Add refreshKey dependency

  // Handle payment input change
  const handlePaymentChange = (doctorId, payment) => {
    const paymentAmount = Math.max(Number(payment) || 0, 0);
    setDoctorPayments((prev) => ({
      ...prev,
      [doctorId]: paymentAmount,
    }));
  };

  // Save payment to backend and update test orders
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

    if (paymentAmount === 0) {
      toast.error("Payment amount must be greater than 0");
      setSaveLoading((prev) => ({ ...prev, [doctorId]: false }));
      return;
    }

    // Prepare payload for doctor payment
    const paymentPayload = {
      doctorName: doctorId,
      paymentAmount,
      dateFilter: doctorDateFilter,
    };

    // Only include customDateRange if dateFilter is 'custom' and it has valid values
    if (doctorDateFilter === 'custom' && doctorCustomDateRange.start && doctorCustomDateRange.end) {
      paymentPayload.customDateRange = {
        start: doctorCustomDateRange.start,
        end: doctorCustomDateRange.end,
      };
    }

    // Prepare payload for reducing doctor revenue from test orders
    const revenueUpdatePayload = {
      paymentAmount,
      dateFilter: doctorDateFilter,
    };

    if (doctorDateFilter === 'custom' && doctorCustomDateRange.start && doctorCustomDateRange.end) {
      revenueUpdatePayload.customDateRange = {
        start: doctorCustomDateRange.start,
        end: doctorCustomDateRange.end,
      };
    }

    try {
      console.log("Sending payment payload:", paymentPayload); // Debug log
      
      // First, save the payment record
      const paymentResponse = await axios.post(`https://medi-plus-diagnostic-center-bdbv.vercel.app/doctorPayments`, paymentPayload);
      
      // Then, update the test orders to reduce doctor revenue
      const revenueResponse = await axios.patch(
        `https://medi-plus-diagnostic-center-bdbv.vercel.app/testorders/doctors/${doctorId}/reduce-revenue`,
        revenueUpdatePayload
      );

      console.log("Revenue update response:", revenueResponse.data); // Debug log

      // Update local state
      setDoctorPayments((prev) => ({
        ...prev,
        [doctorId]: paymentResponse.data.paymentAmount || 0,
      }));

      // Force refresh of test orders data
      setRefreshKey(prev => prev + 1);

      toast.success(`Payment saved successfully! Updated ${revenueResponse.data.ordersUpdated} orders.`);
      
      // Show detailed info about the payment processing
      if (revenueResponse.data.updatedOrders && revenueResponse.data.updatedOrders.length > 0) {
        console.log("Orders updated:", revenueResponse.data.updatedOrders);
      }

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

  // Export doctor data (test-wise commission)
  const handleExportDoctor = async (doctorName) => {
    if (exportLoading) return;
    setExportLoading(true);
    try {
      const data = testWiseData.map(row => ({
        "Test Name": row.testName,
        "Count": row.count,
        "Price": row.price,
        "Commission %": row.commission,
        "Total Commission": ((row.price * row.count * row.commission) / 100).toFixed(2),
      }));
      // Add total row
      const totalCommission = data.reduce((sum, row) => sum + Number(row["Total Commission"]), 0);
      data.push({
        "Test Name": "Total",
        "Count": '',
        "Price": '',
        "Commission %": '',
        "Total Commission": totalCommission.toFixed(2),
      });
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, `Doctor_${doctorName}`);
      XLSX.writeFile(wb, `doctor_${doctorName}_commission_report.xlsx`);
    } catch (error) {
      console.error("Error exporting doctor commission:", error);
      toast.error("Failed to export doctor commission");
    } finally {
      setExportLoading(false);
    }
  };

  const doctorChartData = computedDoctors.map((doctor) => ({
    name: doctor._id,
    value: doctor.totalRevenue,
  }));

  const displayRecords = selectedDoctor
    ? filteredTestOrders
        .filter((order) => order.doctorName === selectedDoctor)
        .map((order) => ({
          patientName: order.patientName,
          date: order.date,
          recordType: "Test Order",
          tests: order.tests,
          totalAmount: order.totalAmount || 0,
          doctorRevenue: order.doctorRevenue,
          lastPaymentDate: order.lastPaymentDate,
          lastPaymentAmount: order.lastPaymentAmount || 0,
        }))
    : [];

  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700">Total Due Revenue</h3>
          <p className="text-2xl font-bold text-purple-600">{totalDoctorRevenue.toFixed(0)} Taka</p>
          <p className="text-xs text-gray-500 mt-1">Remaining amount after payments</p>
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
      </div>

      {/* Doctor Details */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Doctor Details</h3>
        <div className="max-h-96 overflow-y-auto">
          {computedDoctors.map((doctor, index) => {
            if (!doctor._id) return null;
            
            return (
              <div key={index} className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="font-medium text-gray-900">Dr. {doctor._id}</div>
                  <div className="flex gap-4 items-center">
                    <div className="text-right">
                      <div className="font-bold text-purple-600">
                        {doctor.totalRevenue.toFixed(0)} Taka (Due)
                      </div>
                      <div className="text-sm text-gray-600">Records: {doctor.appointments}</div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="block text-sm font-medium text-gray-700">Payment</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="0"
                          max={doctor.totalRevenue}
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
                      <div className="text-xs text-gray-500">
                        Max: {doctor.totalRevenue.toFixed(0)} Taka
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
            );
          })}
        </div>
      </div>

      {/* Test-wise Commission Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Test-wise Commission for Dr. {selectedDoctor || 'Select a Doctor'}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left text-sm font-semibold text-gray-700">Test Name</th>
                <th className="p-3 text-right text-sm font-semibold text-gray-700">Count</th>
                <th className="p-3 text-right text-sm font-semibold text-gray-700">Price</th>
                <th className="p-3 text-right text-sm font-semibold text-gray-700">Commission %</th>
                <th className="p-3 text-right text-sm font-semibold text-gray-700">Total Commission</th>
              </tr>
            </thead>
            <tbody>
              {testWiseData.map((row, idx) => (
                <tr key={row.testName} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-3 border-b border-gray-200">{row.testName}</td>
                  <td className="p-3 text-right border-b border-gray-200">{row.count}</td>
                  <td className="p-3 text-right border-b border-gray-200">{row.price}</td>
                  <td className="p-3 text-right border-b border-gray-200">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={row.commission}
                      onChange={e => handleCommissionChange(row.testName.toLowerCase(), e.target.value)}
                      className="w-16 p-1 border border-gray-300 rounded-md text-right"
                    />
                  </td>
                  <td className="p-3 text-right border-b border-gray-200 font-bold text-purple-600">
                    {((row.price * row.count * row.commission) / 100).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100">
                <td className="p-3 text-right font-bold" colSpan="4">Total:</td>
                <td className="p-3 text-right font-bold text-purple-600">
                  {testWiseData.reduce((sum, row) => sum + (row.price * row.count * row.commission) / 100, 0).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  );
};

export default DoctorRevenue;