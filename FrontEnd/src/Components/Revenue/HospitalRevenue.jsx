import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Calendar } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";

const HospitalRevenue = ({ 
  hospitalData, 
  hospitalDateFilter, 
  hospitalCustomDateRange, 
  setHospitalDateFilter, 
  setHospitalCustomDateRange,
  handleHospitalDateFilterChange,
  applyHospitalDateFilter,
  resetHospitalFilters,
  loading 
}) => {
  const exportHospitalData = () => {
    const data = hospitalData.filteredRecords.map((record) => {
      let groupKey = "";
      if (hospitalDateFilter === "week" && record.date) {
        const d = new Date(record.date);
        const ws = new Date(d);
        ws.setDate(d.getDate() - d.getDay());
        groupKey = ws.toISOString().split('T')[0];
      } else if (hospitalDateFilter === "month" && record.date) {
        const dateParts = record.date.includes('-') ? record.date.split('-') : record.date.split('/');
        const month = dateParts[0].length === 4 ? dateParts[1] : dateParts[0];
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        groupKey = monthNames[parseInt(month, 10) - 1];
      } else if (hospitalDateFilter === "year" && record.date) {
        groupKey = new Date(record.date).getFullYear().toString();
      }

      return {
        ...(hospitalDateFilter === "all" ? {} : hospitalDateFilter === "week" ? { WeekStart: groupKey } : hospitalDateFilter === "month" ? { Month: groupKey } : { Year: groupKey }),
        PatientName: record.patientName,
        Date: record.date,
        Type: record.recordType,
        Details: record.tests?.map((test) => test.testName).join(", ") || record.disease || "N/A",
        TotalAmount: Number(record.totalAmount) || 0,
        Revenue: Number(record.hospitalRevenue) || 0,
      };
    });

    const totalAmount = data.reduce((sum, row) => sum + (row.TotalAmount || 0), 0);
    const totalRevenue = data.reduce((sum, row) => sum + (row.Revenue || 0), 0);
    data.push({
      ...(hospitalDateFilter === "all" ? { PatientName: 'Total' } : hospitalDateFilter === "week" ? { WeekStart: 'Total' } : hospitalDateFilter === "month" ? { Month: 'Total' } : { Year: 'Total' }),
      TotalAmount: totalAmount,
      Revenue: totalRevenue,
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Hospital_${hospitalDateFilter === "all" ? "Timeline" : hospitalDateFilter.charAt(0).toUpperCase() + hospitalDateFilter.slice(1)}`);
    XLSX.writeFile(wb, `hospital_${hospitalDateFilter === "all" ? "timeline" : hospitalDateFilter}_revenue.xlsx`);
  };

  const hospitalChartData = hospitalData.monthlyData.map((item) => ({
    month: item._id,
    revenue: item.revenue,
    appointments: item.count,
  }));

  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Hospital Revenue</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
            <select
              value={hospitalDateFilter}
              onChange={(e) => handleHospitalDateFilterChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          {hospitalDateFilter === "custom" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={hospitalCustomDateRange.start}
                  onChange={(e) => setHospitalCustomDateRange({ ...hospitalCustomDateRange, start: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={hospitalCustomDateRange.end}
                  onChange={(e) => setHospitalCustomDateRange({ ...hospitalCustomDateRange, end: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </>
          )}
          <div className="flex gap-2">
            <button
              onClick={applyHospitalDateFilter}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Apply Filter
            </button>
            <button
              onClick={resetHospitalFilters}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={exportHospitalData}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Export
            </button>
          </div>
        </div>
        {hospitalDateFilter !== "all" && (
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-700">
              Showing records for: <strong>
                {hospitalDateFilter === "week" && "This Week"}
                {hospitalDateFilter === "month" && "This Month"}
                {hospitalDateFilter === "year" && "This Year"}
                {hospitalDateFilter === "custom" && hospitalCustomDateRange.start && hospitalCustomDateRange.end &&
                  `${hospitalCustomDateRange.start} to ${hospitalCustomDateRange.end}`}
              </strong>
            </p>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue Trend</h3>
        {loading ? (
          <p className="text-gray-600">Loading chart data...</p>
        ) : (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hospitalChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `${value.toFixed(0)} Taka`} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Revenue (Taka)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Records</h3>
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
                {hospitalData.filteredRecords
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
                      <td className="p-3 text-right border-b border-gray-200 font-bold text-blue-600">
                        {record.hospitalRevenue?.toFixed(0) || 0} Taka
                      </td>
                    </tr>
                  ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100">
                  <td colSpan="5" className="p-3 text-right font-bold">
                    Total ({hospitalData.filteredRecords.length > 10 ? `showing 10 of ${hospitalData.filteredRecords.length}` : hospitalData.filteredRecords.length}):
                  </td>
                  <td className="p-3 text-right font-bold text-blue-600">
                    {hospitalData.filteredRecords
                      .slice(0, 10)
                      .reduce((sum, record) => sum + (record.hospitalRevenue || 0), 0)
                      .toFixed(0)} Taka
                  </td>
                </tr>
              </tfoot>
            </table>
            {hospitalData.filteredRecords.length > 10 && (
              <p className="text-center text-gray-600 mt-4">
                Showing 10 of {hospitalData.filteredRecords.length} records
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default HospitalRevenue;