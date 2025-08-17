import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Calendar } from "lucide-react";
import * as XLSX from "xlsx";
import axios from "axios";
import { toast } from "react-toastify";

const BrokerRevenue = ({ 
  brokerData, 
  brokerDateFilter, 
  brokerCustomDateRange, 
  selectedBroker, 
  setBrokerCustomDateRange,
  handleBrokerDateFilterChange,
  applyBrokerDateFilter,
  resetBrokerFilters,
  handleBrokerSelect,
  loading,
  filterRecordsByDateRange 
}) => {
  const handleExportBroker = async (brokerName) => {
    try {
      const response = await axios.get(`https://medi-plus-diagnostic-center-bdbv.vercel.app/testorders?brokerName=${brokerName}`);
      const appointments = response.data;
      const filteredAppointments = filterRecordsByDateRange(appointments, brokerDateFilter, brokerCustomDateRange);

      const data = filteredAppointments.map((record) => ({
        PatientName: record.patientName,
        Date: record.date,
        Doctor: record.doctorName || "N/A",
        Details: record.tests?.map((test) => test.testName).join(", ") || record.disease || "N/A",
        TotalAmount: Number(record.totalAmount) || 0,
        Revenue: Number(record.brokerRevenue || (record.totalAmount * 0.05)) || 0,
      }));
      const totalAmount = data.reduce((sum, row) => sum + (row.TotalAmount || 0), 0);
      const totalRevenue = data.reduce((sum, row) => sum + (row.Revenue || 0), 0);
      data.push({ PatientName: 'Total', TotalAmount: totalAmount, Revenue: totalRevenue });
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, `Broker_${brokerName}`);
      XLSX.writeFile(wb, `broker_${brokerName}_revenue.xlsx`);
    } catch (error) {
      console.error("Error exporting broker revenue:", error);
      toast.error("Failed to export broker revenue");
    }
  };

  const brokerChartData = brokerData.brokers.map((broker) => ({
    name: broker._id,
    revenue: broker.totalRevenue,
    appointments: broker.appointments,
  }));

  const displayRecords = (brokerData.filteredBrokerAppointments && brokerData.filteredBrokerAppointments.length > 0) 
    ? brokerData.filteredBrokerAppointments 
    : (brokerData.brokerAppointments || []);

  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Broker Revenue</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Broker</h3>
        {loading ? (
          <p className="text-gray-600">Loading chart data...</p>
        ) : (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={brokerChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `${value.toFixed(0)} Taka`} />
                <Legend />
                <Bar dataKey="revenue" name="Revenue (Taka)" fill="#f59e0b" />
                <Bar dataKey="appointments" name="Appointments" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Broker Details */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Broker Details</h3>
        <div className="max-h-96 overflow-y-auto">
          {brokerData.brokers.map((broker, index) => (
            broker._id && (
              <div key={index} className="p-4 border-b border-gray-200">
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
                    <button
                      onClick={() => handleExportBroker(broker._id)}
                      className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Export
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

      {/* Records Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Appointments by {selectedBroker || 'Select a Broker'}
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
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Doctor</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Tests</th>
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
                      <td className="p-3 border-b border-gray-200">{record.doctorName || 'N/A'}</td>
                      <td className="p-3 border-b border-gray-200">
                        {record.tests?.map((test) => test.testName).join(", ") || 'N/A'}
                      </td>
                      <td className="p-3 text-right border-b border-gray-200">{record.totalAmount?.toFixed(0) || 0} Taka</td>
                      <td className="p-3 text-right border-b border-gray-200 font-bold text-orange-600">
                        {(record.brokerRevenue || (record.totalAmount * 0.05))?.toFixed(0) || 0} Taka
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
                      .reduce((sum, record) => sum + (record.brokerRevenue || (record.totalAmount * 0.05) || 0), 0)
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

export default BrokerRevenue;