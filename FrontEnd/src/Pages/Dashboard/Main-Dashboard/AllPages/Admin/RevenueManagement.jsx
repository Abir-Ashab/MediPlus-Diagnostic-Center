import React, { useState, useEffect } from "react";
import { Card, Table, DatePicker, Select, Button, Statistic, Row, Col, Spin, message } from "antd";
import { DollarSign, TrendingUp, Users, FileText, Download } from 'lucide-react';
import Sidebar from "../../GlobalFiles/Sidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import moment from "moment";

const { RangePicker } = DatePicker;
const { Option } = Select;

const RevenueManagement = () => {
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [revenueData, setRevenueData] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [dateRange, setDateRange] = useState([]);

  // Fetch doctors
  const fetchDoctors = async () => {
    try {
      const response = await axios.get("http://localhost:5000/testorders/doctors/commission");
      setDoctors(response.data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      toast.error("Failed to fetch doctors", {
        position: "top-right",
        autoClose: 4000,
      });
    }
  };

  // Fetch revenue data
  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (dateRange.length === 2) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }
      
      if (selectedDoctor) {
        params.doctorName = selectedDoctor;
      }
      
      const response = await axios.get("http://localhost:5000/testorders/reports/revenue", { params });
      setRevenueData(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching revenue data:", error);
      toast.error("Failed to fetch revenue data", {
        position: "top-right",
        autoClose: 4000,
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchRevenueData();
  }, []);

  // Doctor breakdown table columns
  const doctorColumns = [
    {
      title: 'Doctor Name',
      dataIndex: 'doctorName',
      key: 'doctorName',
    },
    {
      title: 'Total Orders',
      dataIndex: 'orders',
      key: 'orders',
      sorter: (a, b) => a.orders - b.orders,
    },
    {
      title: 'Total Revenue Generated (৳)',
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      render: (amount) => <span className="font-medium text-blue-600">৳{amount.toLocaleString()}</span>,
      sorter: (a, b) => a.totalRevenue - b.totalRevenue,
    },
    {
      title: 'Commission Earned (৳)',
      dataIndex: 'commission',
      key: 'commission',
      render: (amount) => <span className="font-medium text-green-600">৳{amount.toLocaleString()}</span>,
      sorter: (a, b) => a.commission - b.commission,
    },
    {
      title: 'Commission %',
      key: 'commissionPercent',
      render: (_, record) => {
        const percent = ((record.commission / record.totalRevenue) * 100).toFixed(2);
        return <span className="text-orange-600">{percent}%</span>;
      },
    },
  ];

  // Commission settings table columns
  const commissionColumns = [
    {
      title: 'Doctor Name',
      dataIndex: 'docName',
      key: 'docName',
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Doctor Fee per Consultation (৳)',
      dataIndex: 'remuneration',
      key: 'remuneration',
      render: (amount) => <span className="font-medium text-blue-600">৳{amount || 0}</span>,
    },
    {
      title: 'Test Referral Commission (%)',
      dataIndex: 'testReferralCommission',
      key: 'testReferralCommission',
      render: (percent) => <span className="font-medium text-green-600">{percent || 0}%</span>,
    },
  ];

  const doctorBreakdownData = revenueData ? 
    Object.entries(revenueData.doctorBreakdown).map(([doctorName, data]) => ({
      key: doctorName,
      doctorName,
      ...data
    })) : [];

  return (
    <div>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar onCollapse={setSidebarCollapsed} />
        <div className={`flex-1 p-6 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-0'}`}>
          <div className="flex-1 p-6 ml-40">
            
            {/* Header */}
            <Card className="mb-6 shadow-sm border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Revenue Management</h1>
                    <p className="text-gray-600">Track revenue distribution and doctor commissions</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Filters */}
            <Card className="mb-6 shadow-sm border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                  <RangePicker
                    value={dateRange}
                    onChange={setDateRange}
                    className="w-full"
                    format="YYYY-MM-DD"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Doctor</label>
                  <Select
                    value={selectedDoctor}
                    onChange={setSelectedDoctor}
                    className="w-full"
                    placeholder="All Doctors"
                    allowClear
                  >
                    {doctors.map((doctor) => (
                      <Option key={doctor._id} value={doctor.docName}>
                        {doctor.docName}
                      </Option>
                    ))}
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={fetchRevenueData}
                    type="primary"
                    className="bg-blue-600 hover:bg-blue-700"
                    loading={loading}
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </Card>

            {/* Revenue Summary */}
            {revenueData && (
              <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={12} md={6}>
                  <Card className="text-center shadow-sm border border-gray-200">
                    <Statistic
                      title="Total Revenue"
                      value={revenueData.summary.totalRevenue}
                      prefix="৳"
                      valueStyle={{ color: '#1890ff' }}
                      suffix={<TrendingUp className="w-4 h-4 inline ml-2" />}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card className="text-center shadow-sm border border-gray-200">
                    <Statistic
                      title="Hospital Revenue"
                      value={revenueData.summary.hospitalRevenue}
                      prefix="৳"
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card className="text-center shadow-sm border border-gray-200">
                    <Statistic
                      title="Doctor Commissions"
                      value={revenueData.summary.doctorRevenue}
                      prefix="৳"
                      valueStyle={{ color: '#fa8c16' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card className="text-center shadow-sm border border-gray-200">
                    <Statistic
                      title="Total Orders"
                      value={revenueData.summary.totalOrders}
                      valueStyle={{ color: '#722ed1' }}
                      suffix={<FileText className="w-4 h-4 inline ml-2" />}
                    />
                  </Card>
                </Col>
              </Row>
            )}

            {/* Doctor Revenue Breakdown */}
            <Card className="mb-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Doctor Revenue Breakdown</h3>
                <Button
                  icon={<Download className="w-4 h-4" />}
                  onClick={() => {
                    // Export functionality can be added here
                    message.info("Export feature coming soon!");
                  }}
                >
                  Export
                </Button>
              </div>
              <Spin spinning={loading}>
                <Table
                  columns={doctorColumns}
                  dataSource={doctorBreakdownData}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} doctors`,
                  }}
                  scroll={{ x: 800 }}
                />
              </Spin>
            </Card>

            {/* Doctor Commission Settings */}
            <Card className="shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Doctor Commission Settings</h3>
              </div>
              <Table
                columns={commissionColumns}
                dataSource={doctors}
                rowKey="_id"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} doctors`,
                }}
                scroll={{ x: 800 }}
              />
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueManagement;
