import React, { useState, useEffect } from "react";
import { Input, Select, Button, Card, Modal, Form, Table, message, Popconfirm, Tag, Spin } from "antd";
import { Search, Plus, Edit, Trash2, DollarSign, TestTube, Save, X } from 'lucide-react';
import Sidebar from "../../GlobalFiles/Sidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const { Option } = Select;

const TestManagement = () => {
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tests, setTests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [form] = Form.useForm();
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [selectedTests, setSelectedTests] = useState([]);

  // Fetch tests from API
  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/tests");
      setTests(response.data);
      setFilteredTests(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tests:", error);
      toast.error("Failed to fetch tests. Please try again.", {
        position: "top-right",
        autoClose: 4000,
      });
      setLoading(false);
    }
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://localhost:5000/tests/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories. Please try again.", {
        position: "top-right",
        autoClose: 4000,
      });
    }
  };

  useEffect(() => {
    fetchTests();
    fetchCategories();
  }, []);

  // Filter tests based on search term and category
  useEffect(() => {
    let filtered = tests;
    
    if (searchTerm) {
      filtered = filtered.filter(test =>
        test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.testId.toString().includes(searchTerm)
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(test => test.category === selectedCategory);
    }
    
    setFilteredTests(filtered);
  }, [tests, searchTerm, selectedCategory]);

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      // Convert price to number
      const payload = {
        ...values,
        price: Number(values.price)
      };
      
      if (editingTest) {
        // Update existing test
        await axios.put(`http://localhost:5000/tests/${editingTest._id}`, payload);
        toast.success("Test updated successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        // Create new test
        const newTestId = Math.max(...tests.map(t => t.testId), 0) + 1;
        await axios.post("http://localhost:5000/tests", {
          ...payload,
          testId: newTestId,
        });
        toast.success("Test created successfully!", {
          position: "top-right",
          autoClose: 3000,
        });
      }
      
      setIsModalVisible(false);
      setEditingTest(null);
      form.resetFields();
      fetchTests();
      setLoading(false);
    } catch (error) {
      console.error("Error saving test:", error);
      toast.error(error.response?.data?.message || "Failed to save test. Please try again.", {
        position: "top-right",
        autoClose: 4000,
      });
      setLoading(false);
    }
  };

  // Handle delete test
  const handleDelete = async (testId) => {
    try {
      await axios.delete(`http://localhost:5000/tests/${testId}`);
      toast.success("Test deleted successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
      fetchTests();
    } catch (error) {
      console.error("Error deleting test:", error);
      toast.error("Failed to delete test. Please try again.", {
        position: "top-right",
        autoClose: 4000,
      });
    }
  };

  // Handle edit test
  const handleEdit = (test) => {
    setEditingTest(test);
    form.setFieldsValue({
      title: test.title,
      price: test.price,
      category: test.category,
      description: test.description,
      isActive: test.isActive,
    });
    setIsModalVisible(true);
  };

  // Handle bulk price update
  const handleBulkPriceUpdate = async () => {
    if (selectedTests.length === 0) {
      toast.warning("Please select tests to update prices.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      setLoading(true);
      const updates = selectedTests.map(testId => {
        const test = tests.find(t => t._id === testId);
        return { testId: test.testId, price: test.price };
      });

      await axios.put("http://localhost:5000/tests/bulk/update-prices", { updates });
      toast.success("Bulk price update completed!", {
        position: "top-right",
        autoClose: 3000,
      });
      
      setBulkEditMode(false);
      setSelectedTests([]);
      fetchTests();
      setLoading(false);
    } catch (error) {
      console.error("Error bulk updating prices:", error);
      toast.error("Failed to update prices. Please try again.", {
        position: "top-right",
        autoClose: 4000,
      });
      setLoading(false);
    }
  };

  // Handle inline price edit
  const handleInlinePriceEdit = (testId, newPrice) => {
    const updatedTests = tests.map(test =>
      test._id === testId ? { ...test, price: newPrice } : test
    );
    setTests(updatedTests);
  };

  // Table columns
  const columns = [
    {
      title: 'Test ID',
      dataIndex: 'testId',
      key: 'testId',
      width: 80,
      sorter: (a, b) => a.testId - b.testId,
    },
    {
      title: 'Test Name',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 150,
      render: (category) => {
        const categoryObj = categories.find(cat => cat.categoryId === category);
        return (
          <Tag color="blue" className="text-xs">
            {categoryObj?.categoryName || category}
          </Tag>
        );
      },
      filters: categories.map(cat => ({ text: cat.categoryName, value: cat.categoryId })),
      onFilter: (value, record) => record.category === value,
    },
    {
      title: 'Price (৳)',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      sorter: (a, b) => a.price - b.price,
      render: (price, record) => (
        bulkEditMode && selectedTests.includes(record._id) ? (
          <Input
            type="number"
            value={price}
            onChange={(e) => handleInlinePriceEdit(record._id, parseInt(e.target.value) || 0)}
            className="w-20"
            size="small"
          />
        ) : (
          <span className="font-medium text-green-600">৳{price}</span>
        )
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 80,
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            type="link"
            icon={<Edit className="w-4 h-4" />}
            onClick={() => handleEdit(record)}
            className="text-blue-600 hover:text-blue-800"
            size="small"
          />
          <Popconfirm
            title="Are you sure you want to delete this test?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="link"
              icon={<Trash2 className="w-4 h-4" />}
              className="text-red-600 hover:text-red-800"
              size="small"
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  // Row selection for bulk operations
  const rowSelection = {
    selectedRowKeys: selectedTests,
    onChange: (selectedRowKeys) => {
      setSelectedTests(selectedRowKeys);
    },
    getCheckboxProps: () => ({
      disabled: !bulkEditMode,
    }),
  };

  return (
    <div>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar onCollapse={setSidebarCollapsed} />
        <div className={`flex-1 p-6 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-0'}`}>
          <div className="flex-1 p-6 ml-40">
            <Card className="mb-6 shadow-sm border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TestTube className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Test Management</h1>
                    <p className="text-gray-600">Manage diagnostic tests, prices, and categories</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setBulkEditMode(!bulkEditMode);
                      setSelectedTests([]);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 font-semibold rounded-lg shadow-md transition-all duration-200 ${
                      bulkEditMode
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600'
                        : 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white hover:from-orange-600 hover:to-yellow-600'
                    }`}
                  >
                    {bulkEditMode ? <X className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                    {bulkEditMode ? 'Cancel Bulk Edit' : 'Bulk Price Edit'}
                  </Button>
                  {bulkEditMode && (
                    <Button
                      onClick={handleBulkPriceUpdate}
                      disabled={selectedTests.length === 0}
                      className="flex items-center gap-2 px-4 py-2 font-semibold rounded-lg shadow-md transition-all duration-200 bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </Button>
                  )}
                  <Button
                    onClick={() => {
                      setEditingTest(null);
                      form.resetFields();
                      setIsModalVisible(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 font-semibold rounded-lg shadow-md transition-all duration-200 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Test
                  </Button>
                </div>
              </div>
            </Card>

            {/* Filters */}
            <Card className="mb-6 shadow-sm border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Search Tests</label>
                  <Input
                    prefix={<Search className="w-4 h-4 text-gray-400" />}
                    placeholder="Search by test name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-gray-200 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
                  <Select
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                    className="w-full"
                    placeholder="All Categories"
                    allowClear
                  >
                    {categories.map((category) => (
                      <Option key={category.categoryId} value={category.categoryId}>
                        {category.categoryName}
                      </Option>
                    ))}
                  </Select>
                </div>
                <div className="flex items-end">
                  <div className="bg-blue-50 rounded-lg p-4 w-full">
                    <div className="text-sm text-gray-600">Total Tests</div>
                    <div className="text-2xl font-bold text-blue-600">{filteredTests.length}</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Tests Table */}
            <Card className="shadow-sm border border-gray-200">
              <Spin spinning={loading}>
                <Table
                  rowSelection={bulkEditMode ? rowSelection : null}
                  columns={columns}
                  dataSource={filteredTests}
                  rowKey="_id"
                  pagination={{
                    pageSize: 20,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} tests`,
                  }}
                  scroll={{ x: 800 }}
                  className="ant-table-striped"
                />
              </Spin>
            </Card>
          </div>
        </div>
      </div>

      {/* Add/Edit Test Modal */}
      <Modal
        title={editingTest ? "Edit Test" : "Add New Test"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingTest(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label="Test Name"
              name="title"
              rules={[{ required: true, message: "Please enter test name" }]}
            >
              <Input placeholder="Enter test name" />
            </Form.Item>
            <Form.Item
              label="Price (৳)"
              name="price"
              rules={[
                { required: true, message: "Please enter price" },
                { 
                  validator: (_, value) => {
                    const numValue = Number(value);
                    if (isNaN(numValue) || numValue <= 0) {
                      return Promise.reject(new Error('Price must be a positive number'));
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <Input type="number" placeholder="Enter price" />
            </Form.Item>
          </div>
          <Form.Item
            label="Category"
            name="category"
            rules={[{ required: true, message: "Please select category" }]}
          >
            <Select placeholder="Select category">
              {categories.map((category) => (
                <Option key={category.categoryId} value={category.categoryId}>
                  {category.categoryName}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
          >
            <Input.TextArea rows={3} placeholder="Enter test description (optional)" />
          </Form.Item>
          <Form.Item
            label="Status"
            name="isActive"
            valuePropName="checked"
            initialValue={true}
          >
            <Select>
              <Option value={true}>Active</Option>
              <Option value={false}>Inactive</Option>
            </Select>
          </Form.Item>
          <div className="flex justify-end gap-2 mt-6">
            <Button
              onClick={() => {
                setIsModalVisible(false);
                setEditingTest(null);
                form.resetFields();
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {editingTest ? "Update Test" : "Create Test"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default TestManagement;
