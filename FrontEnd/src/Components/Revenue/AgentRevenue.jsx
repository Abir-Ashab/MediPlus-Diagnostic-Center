import React, { useState, useEffect, useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Calendar } from "lucide-react";
import * as XLSX from "xlsx";
import axios from "axios";
import { toast } from "react-toastify";

const AgentRevenue = ({
  agentDateFilter,
  agentCustomDateRange,
  selectedAgent,
  setAgentCustomDateRange,
  handleAgentDateFilterChange,
  applyAgentDateFilter,
  resetAgentFilters,
  filterRecordsByDateRange,
  handleAgentSelect,
}) => {
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
  const [agentPayments, setAgentPayments] = useState({});
  const [exportLoading, setExportLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState({});
  const [allTestOrders, setAllTestOrders] = useState([]);
  const [testsMap, setTestsMap] = useState({});
  const [commissionOverrides, setCommissionOverrides] = useState({});

  // Fetch all tests for commissions
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await axios.get("https://medi-plus-diagnostic-center-bdbv.vercel.app/tests?isActive=true");
        const map = {};
        res.data.forEach(t => {
          map[t.title.toLowerCase()] = t.agentCommissionPercentage || 0;
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


  // Compute filtered test orders (move this up before any use)
  const filteredTestOrders = useMemo(
    () => filterRecordsByDateRange(allTestOrders, agentDateFilter, agentCustomDateRange),
    [allTestOrders, agentDateFilter, agentCustomDateRange, filterRecordsByDateRange]
  );

  // Aggregate test-wise data for selected agent
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

  // For table and export: test-wise data for selected agent
  const testWiseData = useMemo(() => {
    if (!selectedAgent) return [];
    const agentOrders = filteredTestOrders.filter(order => order.agentName === selectedAgent);
    return getTestWiseData(agentOrders);
  }, [filteredTestOrders, selectedAgent, commissionOverrides, testsMap]);

  // Handle commission % change
  const handleCommissionChange = (key, value) => {
    setCommissionOverrides(prev => ({ ...prev, [key]: Number(value) }));
  };

  // Fetch all test orders
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
  }, []);


  // Compute agents data
  const computedAgents = useMemo(() => {
    const agentMap = {};
    filteredTestOrders.forEach((order) => {
      const agentName = order.agentName;
      if (!agentName) return;
      if (!agentMap[agentName]) {
        agentMap[agentName] = { _id: agentName, totalRevenue: 0, appointments: 0 };
      }
      const agentRev = order.agentRevenue;
      agentMap[agentName].totalRevenue += agentRev;
      agentMap[agentName].appointments += 1;
    });
    return Object.values(agentMap);
  }, [filteredTestOrders, testsMap]);

  const totalAgentRevenue = computedAgents.reduce((sum, b) => sum + b.totalRevenue, 0);
  const totalRecords = filteredTestOrders.length;
  const activeAgents = computedAgents.length;

  // Fetch payment data
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const promises = computedAgents.map((agent) =>
          axios.get(`https://medi-plus-diagnostic-center-bdbv.vercel.app/agentPayments/${agent._id}`, {
            params: { dateFilter: agentDateFilter },
          })
        );
        const responses = await Promise.all(promises);
        const payments = responses.reduce((acc, res, index) => {
          const payment = res.data.find((p) => p.dateFilter === agentDateFilter) || {};
          return { ...acc, [computedAgents[index]._id]: payment.paymentAmount || 0 };
        }, {});
        setAgentPayments(payments);
      } catch (error) {
        console.error("Error fetching payments:", error.message, error.response?.data, error.response?.status);
        toast.error(`Failed to fetch payment data: ${error.message}`, {
          position: "top-right",
          autoClose: 4000,
        });
      }
    };
    if (computedAgents.length > 0) {
      fetchPayments();
    }
  }, [computedAgents, agentDateFilter]);

  // Handle payment input change
  const handlePaymentChange = (agentId, payment) => {
    const paymentAmount = Math.max(Number(payment) || 0, 0);
    setAgentPayments((prev) => ({
      ...prev,
      [agentId]: paymentAmount,
    }));
  };

  // Save payment to backend
  const handleSavePayment = async (agentId) => {
    setSaveLoading((prev) => ({ ...prev, [agentId]: true }));
    const paymentAmount = agentPayments[agentId] || 0;

    try {
      const response = await axios.post(`https://medi-plus-diagnostic-center-bdbv.vercel.app/agentPayments`, {
        agentName: agentId,
        paymentAmount,
        dateFilter: agentDateFilter,
        customDateRange: agentDateFilter === 'custom' ? agentCustomDateRange : {},
      });
      if (response.data.message === 'Payment cannot exceed total revenue') {
        toast.error("Payment cannot exceed total revenue!", {
          position: "top-right",
          autoClose: 4000,
        });
        setSaveLoading((prev) => ({ ...prev, [agentId]: false }));
        return;
      }
      setAgentPayments((prev) => ({
        ...prev,
        [agentId]: response.data.paymentAmount || 0,
      }));
      toast.success("Payment saved successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Error saving payment:", error.message, error.response?.data, error.response?.status);
      toast.error(`Failed to save payment: ${error.message}`, {
        position: "top-right",
        autoClose: 4000,
      });
    } finally {
      setSaveLoading((prev) => ({ ...prev, [agentId]: false }));
    }
  };

  // Export agent data (test-wise commission)
  const handleExportAgent = async (agentName) => {
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
      XLSX.utils.book_append_sheet(wb, ws, `Agent_${agentName}`);
      XLSX.writeFile(wb, `agent_${agentName}_commission_report.xlsx`);
      toast.success("Report exported successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Error exporting agent commission:", error);
      toast.error("Failed to export agent commission");
    } finally {
      setExportLoading(false);
    }
  };

  const agentChartData = computedAgents.map((agent) => ({
    name: agent._id,
    value: agent.totalRevenue,
  }));

  const displayRecords = selectedAgent
    ? filteredTestOrders
        .filter((order) => order.agentName === selectedAgent)
        .map((order) => ({
          patientName: order.patientName,
          date: order.date,
          recordType: "Test Order",
          tests: order.tests,
          totalAmount: order.totalAmount || 0,
          agentRevenue: order.agentRevenue,
        }))
    : [];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700">Total Agent Revenue</h3>
          <p className="text-2xl font-bold text-orange-600">{totalAgentRevenue.toFixed(0)} Taka</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700">Total Records</h3>
          <p className="text-2xl font-bold text-orange-600">{totalRecords}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-700">Active Agents</h3>
          <p className="text-2xl font-bold text-orange-600">{activeAgents}</p>
        </div>
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Agent Revenue</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Agent</label>
            <select
              value={selectedAgent || ''}
              onChange={(e) => handleAgentSelect(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Select a Agent</option>
              {computedAgents.map((agent) => (
                <option key={agent._id} value={agent._id}>
                  {agent._id}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
            <select
              value={agentDateFilter}
              onChange={(e) => handleAgentDateFilterChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          {agentDateFilter === "custom" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={agentCustomDateRange.start}
                  onChange={(e) => setAgentCustomDateRange({ ...agentCustomDateRange, start: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={agentCustomDateRange.end}
                  onChange={(e) => setAgentCustomDateRange({ ...agentCustomDateRange, end: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </>
          )}
          <div className="flex gap-2">
            <button
              onClick={applyAgentDateFilter}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Apply Filter
            </button>
            <button
              onClick={resetAgentFilters}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
        {agentDateFilter !== "all" && (
          <div className="mt-4 p-3 bg-orange-50 rounded-md">
            <p className="text-sm text-orange-700">
              Showing records for: <strong>
                {agentDateFilter === "week" && "This Week"}
                {agentDateFilter === "month" && "This Month"}
                {agentDateFilter === "year" && "This Year"}
                {agentDateFilter === "custom" && agentCustomDateRange.start && agentCustomDateRange.end &&
                  `${agentCustomDateRange.start} to ${agentCustomDateRange.end}`}
              </strong>
            </p>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Distribution by Agent</h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={agentChartData.filter((entry) => entry.name && entry.value)}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => name && percent && `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={150}
                dataKey="value"
              >
                {agentChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value.toFixed(0)} Taka`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Agent Details */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Agent Details</h3>
        <div className="max-h-96 overflow-y-auto">
          {computedAgents.map((agent, index) => (
            agent._id && (
              <div key={index} className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="font-medium text-gray-900">{agent._id}</div>
                  <div className="flex gap-4 items-center">
                    <div className="text-right">
                      <div className="font-bold text-orange-600">
                        {(agent.totalRevenue - (agentPayments[agent._id] || 0)).toFixed(0)} Taka (Due)
                      </div>
                      <div className="text-sm text-gray-600">Records: {agent.appointments}</div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="block text-sm font-medium text-gray-700">Payment</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="0"
                          value={agentPayments[agent._id] || ""}
                          onChange={(e) => handlePaymentChange(agent._id, e.target.value)}
                          className="w-24 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="Enter payment"
                        />
                        <button
                          onClick={() => handleSavePayment(agent._id)}
                          className={`px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${saveLoading[agent._id] ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={saveLoading[agent._id]}
                        >
                          {saveLoading[agent._id] ? 'Saving...' : 'Save Payment'}
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAgentSelect(agent._id)}
                      className="px-3 py-1 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleExportAgent(agent._id)}
                      className={`px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors ${exportLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={exportLoading}
                    >
                      {exportLoading ? 'Exporting...' : 'Export'}
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Avg: {agent.appointments > 0 ? (agent.totalRevenue / agent.appointments).toFixed(0) : 0} Taka
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Test-wise Commission Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Test-wise Commission for {selectedAgent || 'Select an Agent'}
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
                  <td className="p-3 text-right border-b border-gray-200 font-bold text-orange-600">
                    {((row.price * row.count * row.commission) / 100).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100">
                <td className="p-3 text-right font-bold" colSpan="4">Total:</td>
                <td className="p-3 text-right font-bold text-orange-600">
                  {testWiseData.reduce((sum, row) => sum + (row.price * row.count * row.commission) / 100, 0).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AgentRevenue;