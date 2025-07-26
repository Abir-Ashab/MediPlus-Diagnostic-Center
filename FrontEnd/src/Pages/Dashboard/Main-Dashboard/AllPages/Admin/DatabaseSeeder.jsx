import React, { useState, useEffect } from "react";
import { Card, Button, Alert, Spin, Statistic, Row, Col } from "antd";
import { Database, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import Sidebar from "../../GlobalFiles/Sidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const DatabaseSeeder = () => {
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [seedStatus, setSeedStatus] = useState(null);
  const [checking, setChecking] = useState(true);

  // Check seeding status on component mount
  const checkSeedStatus = async () => {
    try {
      setChecking(true);
      const response = await axios.get("http://localhost:5000/seeder/status");
      setSeedStatus(response.data);
      setChecking(false);
    } catch (error) {
      console.error("Error checking seed status:", error);
      toast.error("Failed to check database status", {
        position: "top-right",
        autoClose: 4000,
      });
      setChecking(false);
    }
  };

  useEffect(() => {
    checkSeedStatus();
  }, []);

  // Handle seeding
  const handleSeed = async () => {
    try {
      setLoading(true);
      const response = await axios.post("http://localhost:5000/seeder/seed");
      
      toast.success(response.data.message, {
        position: "top-right",
        autoClose: 3000,
      });
      
      // Refresh status
      await checkSeedStatus();
      setLoading(false);
    } catch (error) {
      console.error("Error seeding database:", error);
      toast.error(error.response?.data?.message || "Failed to seed database", {
        position: "top-right",
        autoClose: 4000,
      });
      setLoading(false);
    }
  };

  // Handle reseeding
  const handleReseed = async () => {
    if (!window.confirm("This will delete all existing test data and reseed. Are you sure?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("http://localhost:5000/seeder/reseed");
      
      toast.success(response.data.message, {
        position: "top-right",
        autoClose: 3000,
      });
      
      // Refresh status
      await checkSeedStatus();
      setLoading(false);
    } catch (error) {
      console.error("Error reseeding database:", error);
      toast.error(error.response?.data?.message || "Failed to reseed database", {
        position: "top-right",
        autoClose: 4000,
      });
      setLoading(false);
    }
  };

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
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Database className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Database Seeder</h1>
                    <p className="text-gray-600">Initialize the database with test data and categories</p>
                  </div>
                </div>
                <Button
                  onClick={checkSeedStatus}
                  icon={<RefreshCw className="w-4 h-4" />}
                  loading={checking}
                >
                  Refresh Status
                </Button>
              </div>
            </Card>

            {/* Status Cards */}
            {seedStatus && (
              <Row gutter={[16, 16]} className="mb-6">
                <Col xs={24} sm={8}>
                  <Card className="text-center shadow-sm border border-gray-200">
                    <Statistic
                      title="Database Status"
                      value={seedStatus.isSeeded ? "Seeded" : "Not Seeded"}
                      valueStyle={{ 
                        color: seedStatus.isSeeded ? '#52c41a' : '#ff4d4f',
                        fontSize: '18px'
                      }}
                      prefix={seedStatus.isSeeded ? 
                        <CheckCircle className="w-5 h-5" /> : 
                        <AlertTriangle className="w-5 h-5" />
                      }
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card className="text-center shadow-sm border border-gray-200">
                    <Statistic
                      title="Tests Count"
                      value={seedStatus.testsCount}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card className="text-center shadow-sm border border-gray-200">
                    <Statistic
                      title="Categories Count"
                      value={seedStatus.categoriesCount}
                      valueStyle={{ color: '#722ed1' }}
                    />
                  </Card>
                </Col>
              </Row>
            )}

            {/* Action Cards */}
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card 
                  className="shadow-sm border border-gray-200 h-full"
                  title={
                    <div className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-green-600" />
                      <span>Seed Database</span>
                    </div>
                  }
                >
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      Initialize the database with test data and categories. This will only add data if the database is empty.
                    </p>
                    
                    {seedStatus && !seedStatus.isSeeded && (
                      <Alert
                        message="Database not seeded"
                        description="Your database doesn't have test data. Click the button below to seed it."
                        type="warning"
                        showIcon
                      />
                    )}

                    {seedStatus && seedStatus.isSeeded && (
                      <Alert
                        message="Database already seeded"
                        description={`Found ${seedStatus.testsCount} tests and ${seedStatus.categoriesCount} categories.`}
                        type="success"
                        showIcon
                      />
                    )}

                    <Button
                      type="primary"
                      size="large"
                      onClick={handleSeed}
                      loading={loading}
                      disabled={seedStatus?.isSeeded}
                      className="w-full bg-green-600 hover:bg-green-700 border-green-600"
                      icon={<Database className="w-4 h-4" />}
                    >
                      {seedStatus?.isSeeded ? 'Already Seeded' : 'Seed Database'}
                    </Button>
                  </div>
                </Card>
              </Col>

              <Col xs={24} md={12}>
                <Card 
                  className="shadow-sm border border-gray-200 h-full"
                  title={
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 text-orange-600" />
                      <span>Reseed Database</span>
                    </div>
                  }
                >
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      Clear existing test data and reseed the database. Use this if you need to update the test data structure.
                    </p>
                    
                    <Alert
                      message="Destructive Operation"
                      description="This will delete all existing test data before reseeding. Use with caution!"
                      type="error"
                      showIcon
                    />

                    <Button
                      danger
                      size="large"
                      onClick={handleReseed}
                      loading={loading}
                      className="w-full"
                      icon={<RefreshCw className="w-4 h-4" />}
                    >
                      Reseed Database
                    </Button>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Instructions */}
            <Card className="mt-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructions for Production Deployment</h3>
              <div className="space-y-2 text-gray-600">
                <p><strong>1. For Local Development:</strong> Use the "Seed Database" button above.</p>
                <p><strong>2. For Production/Hosted Site:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Deploy your backend with the seeder routes</li>
                  <li>Access this page from your hosted admin panel</li>
                  <li>Click "Seed Database" to initialize your production database</li>
                  <li>The seeder will automatically detect if data already exists</li>
                </ul>
                <p><strong>3. Alternative Methods:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Run <code className="bg-gray-100 px-2 py-1 rounded">npm run seed</code> on your server</li>
                  <li>Make a POST request to <code className="bg-gray-100 px-2 py-1 rounded">/seeder/seed</code></li>
                </ul>
              </div>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseSeeder;
