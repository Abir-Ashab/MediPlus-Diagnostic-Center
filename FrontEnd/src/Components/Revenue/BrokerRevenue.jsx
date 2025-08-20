import React, { useState, useEffect, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Calendar } from "lucide-react";
import * as XLSX from "xlsx";
import axios from "axios";
import { toast } from "react-toastify";

const BrokerRevenue = ({
  brokerDateFilter,
  brokerCustomDateRange,
  selectedBroker,
  setBrokerCustomDateRange,
  handleBrokerDateFilterChange,
  applyBrokerDateFilter,
  resetBrokerFilters,
  filterRecordsByDateRange,
  handleBrokerSelect,
}) => {
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  const [brokerPayments, setBrokerPayments] = useState({});
  const [exportLoading, setExportLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState({});
  const [allTestOrders, setAllTestOrders] = useState([]);
  const [testsMap, setTestsMap] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);

  const commissionPercentages = {
    VACCINATION: 20,
    HORMONE: 20,
    HISTOPATHOLOGY: 50,
    XRAY: 30,
    CARDIAC: 30, // Default for ECG; Echo tests override to 20%
    ULTRASOUND: 20,
    OTHERS: 50,
    HAEMATOLOGY: 50,
    IMMUNOLOGY: 0,
    CANCER_MARKER: 0,
    BIOCHEMICAL: 0,
    MICROBIOLOGY: 0,
    HEPATITIS: 0,
    URINE: 0,
    CARDIOLOGY: 0,
    STOOL: 0
  };

  const getTestCategory = (testName) => {
    if (!testName) return 'HISTOPATHOLOGY';
    const lowerName = testName.toLowerCase();
    if (lowerName.includes('vaccine')) return 'VACCINATION';
    if (lowerName.includes('echo')) return 'CARDIAC';
    if (lowerName.includes('ecg') || lowerName.includes('e.c.g') || lowerName.includes('e.t.t-stress')) return 'CARDIAC';
    if (lowerName.includes('x-ray') || lowerName.includes('p/a view') || lowerName.includes('b/v') || lowerName.includes('lat.') || lowerName.includes('p.n.s.') || lowerName.includes('opg') || lowerName.includes('ba-') || lowerName.includes('ivu') || lowerName.includes('retrograde')) return 'XRAY';
    if (lowerName.includes('usg') || lowerName.includes('kub') || lowerName.includes('abdomen') || lowerName.includes('pelvic') || lowerName.includes('hbs') || lowerName.includes('genito-urinary')) return 'ULTRASOUND';
    if (lowerName.includes('thyroid') || lowerName.includes('t3') || lowerName.includes('t4') || lowerName.includes('ft3') || lowerName.includes('ft4') || lowerName.includes('tsh') || lowerName.includes('prolactin') || lowerName.includes('estradiol') || lowerName.includes('lh') || lowerName.includes('progesterone') || lowerName.includes('fsh') || lowerName.includes('testosterone') || lowerName.includes('cortisol') || lowerName.includes('growth hormone') || lowerName.includes('hba1c') || lowerName.includes('vitamin d') || lowerName.includes('ca-')) return 'HORMONE';
    return 'HISTOPATHOLOGY';
  };

  // Fetch all tests for commissions
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await axios.get("https://medi-plus-diagnostic-center-bdbv.vercel.app/tests?isActive=true");
        const map = {};
        res.data.forEach(t => {
          map[t.title.toLowerCase()] = t.brokerCommissionPercentage || 0;
        });
        setTestsMap(map);
      } catch (error) {
        console.error("Error fetching tests:", error.message, error.response?.data);
        toast.error("Failed to fetch test commissions", {
          position: "top-right",
          autoClose: 4000,
        });
      }
    };
    fetchTests();
  }, []);

  // Function to calculate broker revenue for an order (now uses the stored brokerRevenue from DB)
  const calculateBrokerRevenue = (order) => {
    // Use the brokerRevenue from the database (which will be reduced after payments)
    return order.brokerRevenue || 0;
  };

  // Fetch all test orders (refresh when payment is made)
  useEffect(() => {
    const fetchAllTestOrders = async () => {
      try {
        const res = await axios.get("https://medi-plus-diagnostic-center-bdbv.vercel.app/testorders");
        setAllTestOrders(res.data);
      } catch (error) {
        console.error("Error fetching test orders:", error.message, error.response?.data);
        toast.error("Failed to fetch test orders", {
          position: "top-right",
          autoClose: 4000,
        });
      }
    };
    fetchAllTestOrders();
  }, [refreshKey]);

  // Compute filtered test orders
  const filteredTestOrders = useMemo(
    () => filterRecordsByDateRange(allTestOrders, brokerDateFilter, brokerCustomDateRange),
    [allTestOrders, brokerDateFilter, brokerCustomDateRange, filterRecordsByDateRange]
  );

  // Compute brokers data
  const computedBrokers = useMemo(() => {
    const brokerMap = {};
    filteredTestOrders.forEach((order) => {
      const brokerName = order.brokerName;
      if (!brokerName) return;
      if (!brokerMap[brokerName]) {
        brokerMap[brokerName] = { _id: brokerName, totalRevenue: 0, appointments: 0 };
      }
      const brokerRev = calculateBrokerRevenue(order);
      brokerMap[brokerName].totalRevenue += brokerRev;
      brokerMap[brokerName].appointments += 1;
    });
    return Object.values(brokerMap);
  }, [filteredTestOrders, testsMap, refreshKey]);

  const totalBrokerRevenue = computedBrokers.reduce((sum, b) => sum + b.totalRevenue, 0);
  const totalRecords = filteredTestOrders.length;
  const activeBrokers = computedBrokers.length;

  // Fetch payment data
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const promises = computedBrokers.map((broker) =>
          axios.get(`https://medi-plus-diagnostic-center-bdbv.vercel.app/brokerPayments/${broker._id}`, {
            params: { dateFilter: brokerDateFilter },
          })
        );
        const responses = await Promise.all(promises);
        const payments = responses.reduce((acc, res, index) => {
          const payment = res.data.find((p) => p.dateFilter === brokerDateFilter) || {};
          return { ...acc, [computedBrokers[index]._id]: payment.paymentAmount || 0 };
        }, {});
        setBrokerPayments(payments);
      } catch (error) {
        console.error("Error fetching payments:", error.message, error.response?.data, error.response?.status);
        toast.error(`Failed to fetch payment data: ${error.message}`, {
          position: "top-right",
          autoClose: 4000,
        });
      }
    };
    if (computedBrokers.length > 0) {
      fetchPayments();
    }
  }, [computedBrokers, brokerDateFilter, refreshKey]);

  // Handle payment input change
  const handlePaymentChange = (brokerId, payment) => {
    const paymentAmount = Math.max(Number(payment) || 0, 0);
    setBrokerPayments((prev) => ({
      ...prev,
      [brokerId]: paymentAmount,
    }));
  };

  // Save payment to backend and update test orders
  const handleSavePayment = async (brokerId) => {
    if (!brokerId || !brokerDateFilter) {
      toast.error("Broker name or date filter is missing", {
        position: "top-right",
        autoClose: 4000,
      });
      return;
    }

    setSaveLoading((prev) => ({ ...prev, [brokerId]: true }));
    const paymentAmount = Number(brokerPayments[brokerId]) || 0;

    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      toast.error("Payment amount must be greater than 0", {
        position: "top-right",
        autoClose: 4000,
      });
      setSaveLoading((prev) => ({ ...prev, [brokerId]: false }));
      return;
    }

    // Prepare payload
    const payload = {
      brokerName: brokerId,
      paymentAmount,
      dateFilter: brokerDateFilter,
    };

    // Only include customDateRange if dateFilter is 'custom' and it has valid values
    if (brokerDateFilter === 'custom' && brokerCustomDateRange.start && brokerCustomDateRange.end) {
      payload.customDateRange = {
        start: brokerCustomDateRange.start,
        end: brokerCustomDateRange.end,
      };
    }

    try {
      console.log("Sending broker payment payload:", payload);
      
      const response = await axios.post(`https://medi-plus-diagnostic-center-bdbv.vercel.app/brokerPayments`, payload);

      console.log("Broker payment response:", response.data);

      // Update local state
      setBrokerPayments((prev) => ({
        ...prev,
        [brokerId]: response.data.payment?.paymentAmount || 0,
      }));

      // Force refresh of test orders data
      setRefreshKey(prev => prev + 1);

      toast.success(`Payment saved successfully! Updated ${response.data.ordersUpdated} orders.`, {
        position: "top-right",
        autoClose: 3000,
      });
      
      // Show detailed info about the payment processing
      if (response.data.updatedOrders && response.data.updatedOrders.length > 0) {
        console.log("Orders updated:", response.data.updatedOrders);
      }

    } catch (error) {
      console.error("Error saving broker payment:", error);
      const errorMessage = error.response?.data?.message || "Failed to save payment";
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setSaveLoading((prev) => ({ ...prev, [brokerId]: false }));
    }
  };

  // Export broker data
  const handleExportBroker = async (brokerName) => {
    if (exportLoading) return;
    setExportLoading(true);
    try {
      const paymentResponse = await axios.get(`https://medi-plus-diagnostic-center-bdbv.vercel.app/brokerPayments/${brokerName}`, {
        params: { dateFilter: brokerDateFilter },
      });
      const paymentData = paymentResponse.data.find((p) => p.dateFilter === brokerDateFilter) || {};
      const payment = Number(paymentData.paymentAmount) || 0;

      const filteredRecords = filteredTestOrders.filter((order) => order.brokerName === brokerName);
      const totalRevenue = filteredRecords.reduce((sum, order) => sum + calculateBrokerRevenue(order), 0);

      const data = filteredRecords.map((order) => {
        const recordRevenue = calculateBrokerRevenue(order);
        return {
          "Patient Name": order.patientName,
          Date: order.date,
          Type: "Test Order",
          "Test Details": order.tests?.map((test) => test.testName).join(", ") || "N/A",
          "Due Revenue": recordRevenue.toFixed(2),
          "Last Payment": order.lastBrokerPaymentDate ? new Date(order.lastBrokerPaymentDate).toLocaleDateString() : "N/A",
          "Last Payment Amount": order.lastBrokerPaymentAmount ? order.lastBrokerPaymentAmount.toFixed(2) : "0.00",
        };
      });

      data.push({
        "Patient Name": "Total",
        "Due Revenue": totalRevenue.toFixed(2),
        "Last Payment Amount": payment.toFixed(2),
      });

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, `Broker_${brokerName}`);
      XLSX.writeFile(wb, `broker_${brokerName}_revenue_due.xlsx`);
      
      toast.success("Report exported successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Error exporting broker revenue:", error.message, error.response?.data, error.response?.status);
      toast.error(`Failed to export broker revenue: ${error.message}`, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setExportLoading(false);
    }
  };

  const brokerChartData = computedBrokers.map((broker) => ({
    name: broker._id,
    value: broker.totalRevenue,
  }));

  const displayRecords = selectedBroker
    ? filteredTestOrders
        .filter((order) => order.brokerName === selectedBroker)
        .map((order) => ({
          patientName: order.patientName,
          date: order.date,
          recordType: "Test Order",
          tests: order.tests,
          totalAmount: order.totalAmount || 0,
          brokerRevenue: calculateBrokerRevenue(order),
          lastBrokerPaymentDate: order.lastBrokerPaymentDate,
          lastBrokerPaymentAmount: order.lastBrokerPaymentAmount || 0,
        }))
    : [];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700">Total Due Revenue</h3>
          <p className="text-2xl font-bold text-orange-600">{totalBrokerRevenue.toFixed(0)} Taka</p>
          <p className="text-xs text-gray-500 mt-1">Remaining amount after payments</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700">Total Records</h3>
          <p className="text-2xl font-bold text-orange-600">{totalRecords}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700">Active Brokers</h3>
          <p className="text-2xl font-bold text-orange-600">{activeBrokers}</p>
        </div>
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Broker Revenue</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Broker</label>
            <select
              value={selectedBroker || ''}
              onChange={(e) => handleBrokerSelect(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Select a Broker</option>
              {computedBrokers.map((broker) => (
                <option key={broker._id} value={broker._id}>
                  {broker._id}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
            <select
              value={brokerDateFilter}
              onChange={(e) => handleBrokerDateFilterChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          {brokerDateFilter === "custom" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={brokerCustomDateRange.start}
                  onChange={(e) => setBrokerCustomDateRange({ ...brokerCustomDateRange, start: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={brokerCustomDateRange.end}
                  onChange={(e) => setBrokerCustomDateRange({ ...brokerCustomDateRange, end: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </>
          )}
          <div className="flex gap-2">
            <button
              onClick={applyBrokerDateFilter}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Apply Filter
            </button>
            <button
              onClick={resetBrokerFilters}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
        {brokerDateFilter !== "all" && (
          <div className="mt-4 p-3 bg-orange-50 rounded-md">
            <p className="text-sm text-orange-700">
              Showing records for: <strong>
                {brokerDateFilter === "week" && "This Week"}
                {brokerDateFilter === "month" && "This Month"}
                {brokerDateFilter === "year" && "This Year"}
                {brokerDateFilter === "custom" && brokerCustomDateRange.start && brokerCustomDateRange.end &&
                  `${brokerCustomDateRange.start} to ${brokerCustomDateRange.end}`}
              </strong>
            </p>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Due Revenue Distribution by Broker</h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={brokerChartData.filter((entry) => entry.name && entry.value)}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => name && percent && `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={150}
                dataKey="value"
              >
                {brokerChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value.toFixed(0)} Taka`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Broker Details */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Broker Details</h3>
        <div className="max-h-96 overflow-y-auto">
          {computedBrokers.map((broker, index) => {
            if (!broker._id) return null;
            
            return (
              <div key={index} className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="font-medium text-gray-900">{broker._id}</div>
                  <div className="flex gap-4 items-center">
                    <div className="text-right">
                      <div className="font-bold text-orange-600">
                        {broker.totalRevenue.toFixed(0)} Taka (Due)
                      </div>
                      <div className="text-sm text-gray-600">Records: {broker.appointments}</div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="block text-sm font-medium text-gray-700">Payment</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="0"
                          max={broker.totalRevenue}
                          value={brokerPayments[broker._id] || ""}
                          onChange={(e) => handlePaymentChange(broker._id, e.target.value)}
                          className="w-24 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Enter payment"
                        />
                        <button
                          onClick={() => handleSavePayment(broker._id)}
                          className={`px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${saveLoading[broker._id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={saveLoading[broker._id]}
                        >
                          {saveLoading[broker._id] ? 'Saving...' : 'Save Payment'}
                        </button>
                      </div>
                      <div className="text-xs text-gray-500">
                        Max: {broker.totalRevenue.toFixed(0)} Taka
                      </div>
                    </div>
                    <button
                      onClick={() => handleBrokerSelect(broker._id)}
                      className="px-3 py-1 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleExportBroker(broker._id)}
                      className={`px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors ${exportLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={exportLoading}
                    >
                      {exportLoading ? 'Exporting...' : 'Export'}
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Avg: {broker.appointments > 0 ? (broker.totalRevenue / broker.appointments).toFixed(0) : 0} Taka
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Records for {selectedBroker || 'Select a Broker'}
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
                <th className="p-3 text-right text-sm font-semibold text-gray-700">Due Revenue</th>
                <th className="p-3 text-right text-sm font-semibold text-gray-700">Last Payment</th>
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
                    <td className="p-3 text-right border-b border-gray-200 font-bold text-orange-600">
                      {record.brokerRevenue.toFixed(0)} Taka
                    </td>
                    <td className="p-3 text-right border-b border-gray-200 text-sm text-gray-600">
                      {record.lastBrokerPaymentAmount > 0 ? `${record.lastBrokerPaymentAmount.toFixed(0)} Taka` : 'N/A'}
                      {record.lastBrokerPaymentDate && (
                        <div className="text-xs">
                          {new Date(record.lastBrokerPaymentDate).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100">
                <td colSpan="5" className="p-3 text-right font-bold">
                  Total ({displayRecords.length > 10 ? `showing 10 of ${displayRecords.length}` : displayRecords.length}):
                </td>
                <td className="p-3 text-right font-bold text-orange-600">
                  {displayRecords
                    .slice(0, 10)
                    .reduce((sum, record) => sum + record.brokerRevenue, 0)
                    .toFixed(0)} Taka
                </td>
                <td className="p-3 text-right font-bold text-gray-600">
                  {displayRecords
                    .slice(0, 10)
                    .reduce((sum, record) => sum + record.lastBrokerPaymentAmount, 0)
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
    </div>
  );
};

export default BrokerRevenue;