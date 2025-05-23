import React, { useState, useEffect } from "react";
import {
  Table,
  Modal,
  Button,
  Spin,
  Avatar,
  Tag,
  Descriptions,
  Tabs,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Popconfirm,
  Space,
  Card
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  TeamOutlined,
  UserSwitchOutlined,
  CalendarOutlined,
  UserDeleteOutlined
} from "@ant-design/icons";
import axios from "axios";
import moment from "moment";
import { useSelector } from "react-redux";
import Sidebar from "../../GlobalFiles/Sidebar";
import "./CSS/Style.css";

const { TabPane } = Tabs;
const { Option } = Select;

const ControlUsers = () => {
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState("view"); // view, edit, delete
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedUserType, setSelectedUserType] = useState(null);
  const [form] = Form.useForm();

  const {
    data: { user },
  } = useSelector((state) => state.auth);

  // Check if user is admin
  const isAdmin = user?.userType === "admin";

  useEffect(() => {
    if (isAdmin) {
      fetchAllData();
    }
  }, [isAdmin]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchDoctors(),
        fetchBrokers(),
        fetchNurses(),
        fetchAdmins(),
        fetchAppointments(),
      ]);
    } catch (error) {
      message.error("Error fetching data");
    }
    setLoading(false);
  };

  const fetchDoctors = async () => {
    try {
      const response = await axios.get("http://localhost:5000/doctors");
      setDoctors(response.data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const fetchBrokers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/brokers");
      setBrokers(response.data);
    } catch (error) {
      console.error("Error fetching brokers:", error);
    }
  };

  const fetchNurses = async () => {
    try {
      const response = await axios.get("http://localhost:5000/nurses");
      setNurses(response.data);
    } catch (error) {
      console.error("Error fetching nurses:", error);
    }
  };

  const fetchAdmins = async () => {
    try {
      const response = await axios.get("http://localhost:5000/admin");
      setAdmins(response.data);
    } catch (error) {
      console.error("Error fetching admins:", error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await axios.get("http://localhost:5000/appointments");
      setAppointments(response.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  // Handle delete operations
  const handleDelete = async (record, userType) => {
    try {
      let endpoint = "";
      let idField = "";
      
      switch (userType) {
        case "doctor":
          endpoint = "doctors";
          idField = record._id;
          break;
        case "nurse":
          endpoint = "nurses";
          idField = record._id;
          break;
        case "broker":
          endpoint = "brokers";
          idField = record._id;
          break;
        case "admin":
          endpoint = "admin";
          idField = record._id;
          break;
        case "appointment":
          endpoint = "appointments";
          idField = record._id;
          break;
        default:
          return;
      }

      await axios.delete(`http://localhost:5000/${endpoint}/${idField}`);
      message.success(`${userType} deleted successfully`);
      fetchAllData(); // Refresh data
    } catch (error) {
      message.error(`Error deleting ${userType}`);
      console.error("Delete error:", error);
    }
  };

  // Handle edit operations
  const handleEdit = async (values) => {
    try {
      let endpoint = "";
      let idField = "";
      
      switch (selectedUserType) {
        case "doctor":
          endpoint = "doctors";
          idField = selectedRecord._id;
          break;
        case "nurse":
          endpoint = "nurses";
          idField = selectedRecord._id;
          break;
        case "broker":
          endpoint = "brokers";
          idField = selectedRecord._id;
          break;
        case "admin":
          endpoint = "admin";
          idField = selectedRecord._id;
          break;
        default:
          return;
      }

      // Format date if it exists
      if (values.DOB && moment.isMoment(values.DOB)) {
        values.DOB = values.DOB.format('YYYY-MM-DD');
      }

      await axios.put(`http://localhost:5000/${endpoint}/${idField}`, values);
      message.success(`${selectedUserType} updated successfully`);
      setIsModalVisible(false);
      fetchAllData(); // Refresh data
    } catch (error) {
      message.error(`Error updating ${selectedUserType}`);
      console.error("Update error:", error);
    }
  };

  const openModal = (type, record, userType) => {
    setModalType(type);
    setSelectedRecord(record);
    setSelectedUserType(userType);
    setIsModalVisible(true);

    if (type === "edit" && record) {
      // Populate form with existing data
      const formData = { ...record };
      if (formData.DOB) {
        formData.DOB = moment(formData.DOB);
      }
      form.setFieldsValue(formData);
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedRecord(null);
    setSelectedUserType(null);
    form.resetFields();
  };

  // Common action buttons for tables
  const getActionButtons = (record, userType) => (
    <Space>
      <Button
        icon={<EyeOutlined />}
        onClick={() => openModal("view", record, userType)}
        size="small"
      >
        View
      </Button>
      <Button
        icon={<EditOutlined />}
        type="primary"
        onClick={() => openModal("edit", record, userType)}
        size="small"
      >
        Edit
      </Button>
      <Popconfirm
        title={`Are you sure you want to delete this ${userType}?`}
        onConfirm={() => handleDelete(record, userType)}
        okText="Yes"
        cancelText="No"
      >
        <Button
          icon={<DeleteOutlined />}
          danger
          size="small"
        >
          Delete
        </Button>
      </Popconfirm>
    </Space>
  );

  // Table columns for different user types
  const doctorColumns = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (text) => <Avatar src={text || "https://res.cloudinary.com/diverse/image/upload/v1674562453/diverse/oipm1ecb1yudf9eln7az.jpg"} />
    },
    { title: "ID", dataIndex: "docID", key: "docID" },
    { title: "Name", dataIndex: "docName", key: "docName" },
    { title: "Department", dataIndex: "department", key: "department" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Mobile", dataIndex: "mobile", key: "mobile" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => getActionButtons(record, "doctor"),
    },
  ];

  const nurseColumns = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (text) => <Avatar src={text || "https://res.cloudinary.com/diverse/image/upload/v1674562453/diverse/oipm1ecb1yudf9eln7az.jpg"} />
    },
    { title: "ID", dataIndex: "nurseID", key: "nurseID" },
    { title: "Name", dataIndex: "nurseName", key: "nurseName" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Mobile", dataIndex: "mobile", key: "mobile" },
    { title: "Education", dataIndex: "education", key: "education" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => getActionButtons(record, "nurse"),
    },
  ];

  const brokerColumns = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (text) => <Avatar src={text || "https://res.cloudinary.com/diverse/image/upload/v1674562453/diverse/oipm1ecb1yudf9eln7az.jpg"} />
    },
    { title: "ID", dataIndex: "brokerID", key: "brokerID" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Mobile", dataIndex: "mobile", key: "mobile" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status?.toUpperCase() || "ACTIVE"}
        </Tag>
      )
    },
    { title: "Commission Rate", dataIndex: "commissionRate", key: "commissionRate", render: (rate) => `${rate || 0}%` },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => getActionButtons(record, "broker"),
    },
  ];

  const adminColumns = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (text) => <Avatar src={text || "https://res.cloudinary.com/diverse/image/upload/v1674562453/diverse/oipm1ecb1yudf9eln7az.jpg"} />
    },
    { title: "ID", dataIndex: "adminID", key: "adminID" },
    { title: "Name", dataIndex: "adminName", key: "adminName" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Mobile", dataIndex: "mobile", key: "mobile" },
    { title: "Education", dataIndex: "education", key: "education" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => getActionButtons(record, "admin"),
    },
  ];

  const appointmentColumns = [
    { title: "Patient Name", dataIndex: "patientName", key: "patientName" },
    { title: "Age", dataIndex: "age", key: "age" },
    { title: "Gender", dataIndex: "gender", key: "gender" },
    { title: "Disease", dataIndex: "disease", key: "disease" },
    { title: "Doctor", dataIndex: "doctorName", key: "doctorName" },
    { title: "Date", dataIndex: "date", key: "date" },
    { title: "Time", dataIndex: "time", key: "time" },
    { title: "Total Amount", dataIndex: "totalAmount", key: "totalAmount", render: (amount) => `₹${amount}` },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => getActionButtons(record, "appointment"),
    },
  ];

  // Render edit form based on user type
  const renderEditForm = () => {
    if (!selectedRecord || !selectedUserType) return null;

    const commonFields = (
      <>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="mobile" label="Mobile" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="age" label="Age">
          <Input type="number" />
        </Form.Item>
        <Form.Item name="gender" label="Gender">
          <Select>
            <Option value="male">Male</Option>
            <Option value="female">Female</Option>
            <Option value="other">Other</Option>
          </Select>
        </Form.Item>
        <Form.Item name="address" label="Address">
          <Input.TextArea />
        </Form.Item>
        <Form.Item name="DOB" label="Date of Birth">
          <DatePicker format="YYYY-MM-DD" />
        </Form.Item>
      </>
    );

    switch (selectedUserType) {
      case "doctor":
        return (
          <>
            <Form.Item name="docName" label="Doctor Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="department" label="Department" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="education" label="Education">
              <Input />
            </Form.Item>
            <Form.Item name="bloodGroup" label="Blood Group">
              <Select>
                <Option value="A+">A+</Option>
                <Option value="A-">A-</Option>
                <Option value="B+">B+</Option>
                <Option value="B-">B-</Option>
                <Option value="AB+">AB+</Option>
                <Option value="AB-">AB-</Option>
                <Option value="O+">O+</Option>
                <Option value="O-">O-</Option>
              </Select>
            </Form.Item>
            {commonFields}
            <Form.Item name="details" label="Details">
              <Input.TextArea />
            </Form.Item>
          </>
        );
      case "nurse":
        return (
          <>
            <Form.Item name="nurseName" label="Nurse Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="education" label="Education">
              <Input />
            </Form.Item>
            <Form.Item name="bloodGroup" label="Blood Group">
              <Select>
                <Option value="A+">A+</Option>
                <Option value="A-">A-</Option>
                <Option value="B+">B+</Option>
                <Option value="B-">B-</Option>
                <Option value="AB+">AB+</Option>
                <Option value="AB-">AB-</Option>
                <Option value="O+">O+</Option>
                <Option value="O-">O-</Option>
              </Select>
            </Form.Item>
            {commonFields}
            <Form.Item name="details" label="Details">
              <Input.TextArea />
            </Form.Item>
          </>
        );
      case "broker":
        return (
          <>
            <Form.Item name="name" label="Broker Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="status" label="Status">
              <Select>
                <Option value="active">Active</Option>
                <Option value="inactive">Inactive</Option>
              </Select>
            </Form.Item>
            <Form.Item name="commissionRate" label="Commission Rate (%)">
              <Input type="number" />
            </Form.Item>
            {commonFields}
            <Form.Item name="notes" label="Notes">
              <Input.TextArea />
            </Form.Item>
          </>
        );
      case "admin":
        return (
          <>
            <Form.Item name="adminName" label="Admin Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="education" label="Education">
              <Input />
            </Form.Item>
            {commonFields}
          </>
        );
      default:
        return null;
    }
  };

  // Render view details
  const renderViewDetails = () => {
    if (!selectedRecord || !selectedUserType) return null;

    const getDescription = () => {
      switch (selectedUserType) {
        case "doctor":
          return (
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Doctor ID">{selectedRecord.docID}</Descriptions.Item>
              <Descriptions.Item label="Name">{selectedRecord.docName}</Descriptions.Item>
              <Descriptions.Item label="Department">{selectedRecord.department}</Descriptions.Item>
              <Descriptions.Item label="Email">{selectedRecord.email}</Descriptions.Item>
              <Descriptions.Item label="Mobile">{selectedRecord.mobile}</Descriptions.Item>
              <Descriptions.Item label="Age">{selectedRecord.age}</Descriptions.Item>
              <Descriptions.Item label="Gender">{selectedRecord.gender}</Descriptions.Item>
              <Descriptions.Item label="Blood Group">{selectedRecord.bloodGroup}</Descriptions.Item>
              <Descriptions.Item label="Date of Birth">{selectedRecord.DOB}</Descriptions.Item>
              <Descriptions.Item label="Address">{selectedRecord.address}</Descriptions.Item>
              <Descriptions.Item label="Education">{selectedRecord.education}</Descriptions.Item>
              <Descriptions.Item label="Details" span={2}>{selectedRecord.details}</Descriptions.Item>
            </Descriptions>
          );
        case "nurse":
          return (
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Nurse ID">{selectedRecord.nurseID}</Descriptions.Item>
              <Descriptions.Item label="Name">{selectedRecord.nurseName}</Descriptions.Item>
              <Descriptions.Item label="Email">{selectedRecord.email}</Descriptions.Item>
              <Descriptions.Item label="Mobile">{selectedRecord.mobile}</Descriptions.Item>
              <Descriptions.Item label="Age">{selectedRecord.age}</Descriptions.Item>
              <Descriptions.Item label="Gender">{selectedRecord.gender}</Descriptions.Item>
              <Descriptions.Item label="Blood Group">{selectedRecord.bloodGroup}</Descriptions.Item>
              <Descriptions.Item label="Date of Birth">{selectedRecord.DOB}</Descriptions.Item>
              <Descriptions.Item label="Address">{selectedRecord.address}</Descriptions.Item>
              <Descriptions.Item label="Education">{selectedRecord.education}</Descriptions.Item>
              <Descriptions.Item label="Details" span={2}>{selectedRecord.details}</Descriptions.Item>
            </Descriptions>
          );
        case "broker":
          return (
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Broker ID">{selectedRecord.brokerID}</Descriptions.Item>
              <Descriptions.Item label="Name">{selectedRecord.name}</Descriptions.Item>
              <Descriptions.Item label="Email">{selectedRecord.email}</Descriptions.Item>
              <Descriptions.Item label="Mobile">{selectedRecord.mobile}</Descriptions.Item>
              <Descriptions.Item label="Age">{selectedRecord.age}</Descriptions.Item>
              <Descriptions.Item label="Gender">{selectedRecord.gender}</Descriptions.Item>
              <Descriptions.Item label="Address">{selectedRecord.address}</Descriptions.Item>
              <Descriptions.Item label="Commission Rate">{selectedRecord.commissionRate}%</Descriptions.Item>
              <Descriptions.Item label="Status">{selectedRecord.status}</Descriptions.Item>
              <Descriptions.Item label="Referrals">{selectedRecord.referrals}</Descriptions.Item>
              <Descriptions.Item label="Total Commission">₹{selectedRecord.totalCommission}</Descriptions.Item>
              <Descriptions.Item label="Date Joined">{selectedRecord.dateJoined ? new Date(selectedRecord.dateJoined).toLocaleDateString() : 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Notes" span={2}>{selectedRecord.notes}</Descriptions.Item>
            </Descriptions>
          );
        case "admin":
          return (
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Admin ID">{selectedRecord.adminID}</Descriptions.Item>
              <Descriptions.Item label="Name">{selectedRecord.adminName}</Descriptions.Item>
              <Descriptions.Item label="Email">{selectedRecord.email}</Descriptions.Item>
              <Descriptions.Item label="Mobile">{selectedRecord.mobile}</Descriptions.Item>
              <Descriptions.Item label="Age">{selectedRecord.age}</Descriptions.Item>
              <Descriptions.Item label="Gender">{selectedRecord.gender}</Descriptions.Item>
              <Descriptions.Item label="Date of Birth">{selectedRecord.DOB}</Descriptions.Item>
              <Descriptions.Item label="Address">{selectedRecord.address}</Descriptions.Item>
              <Descriptions.Item label="Education">{selectedRecord.education}</Descriptions.Item>
            </Descriptions>
          );
        case "appointment":
          return (
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Patient ID">{selectedRecord.patientID}</Descriptions.Item>
              <Descriptions.Item label="Patient Name">{selectedRecord.patientName}</Descriptions.Item>
              <Descriptions.Item label="Age">{selectedRecord.age}</Descriptions.Item>
              <Descriptions.Item label="Gender">{selectedRecord.gender}</Descriptions.Item>
              <Descriptions.Item label="Email">{selectedRecord.email}</Descriptions.Item>
              <Descriptions.Item label="Mobile">{selectedRecord.mobile}</Descriptions.Item>
              <Descriptions.Item label="Disease">{selectedRecord.disease}</Descriptions.Item>
              <Descriptions.Item label="Doctor">{selectedRecord.doctorName}</Descriptions.Item>
              <Descriptions.Item label="Broker">{selectedRecord.brokerName}</Descriptions.Item>
              <Descriptions.Item label="Address">{selectedRecord.address}</Descriptions.Item>
              <Descriptions.Item label="Date">{selectedRecord.date}</Descriptions.Item>
              <Descriptions.Item label="Time">{selectedRecord.time}</Descriptions.Item>
              <Descriptions.Item label="Total Amount">₹{selectedRecord.totalAmount}</Descriptions.Item>
              <Descriptions.Item label="Hospital Revenue">₹{selectedRecord.hospitalRevenue}</Descriptions.Item>
              <Descriptions.Item label="Doctor Revenue">₹{selectedRecord.doctorRevenue}</Descriptions.Item>
              <Descriptions.Item label="Broker Revenue">₹{selectedRecord.brokerRevenue}</Descriptions.Item>
            </Descriptions>
          );
        default:
          return null;
      }
    };

    return (
      <div>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <Avatar
            src={selectedRecord.image || "https://res.cloudinary.com/diverse/image/upload/v1674562453/diverse/oipm1ecb1yudf9eln7az.jpg"}
            size={100}
          />
          <h2>{selectedRecord.docName || selectedRecord.nurseName || selectedRecord.name || selectedRecord.adminName || selectedRecord.patientName || "User"}</h2>
        </div>
        {getDescription()}
      </div>
    );
  };

  if (!isAdmin) {
    return (
      <div className="app-layout">
        <Sidebar />
        <div className="main-content" style={{ padding: "20px", textAlign: "center" }}>
          <h2>Access Denied</h2>
          <p>Only administrators can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content" style={{ padding: "20px" }}>
        <Card>
          <h1 style={{ color: "rgb(184 191 234)", marginBottom: "20px" }}>
            <UserDeleteOutlined /> Control Users - Admin Panel
          </h1>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              <Spin size="large" />
              <p>Loading user data...</p>
            </div>
          ) : (
            <Tabs defaultActiveKey="doctors" size="large">
              <TabPane
                tab={
                  <span>
                    <MedicineBoxOutlined />
                    Doctors ({doctors.length})
                  </span>
                }
                key="doctors"
              >
                <Table
                  columns={doctorColumns}
                  dataSource={doctors.map((item, index) => ({ ...item, key: index }))}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 1000 }}
                />
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <TeamOutlined />
                    Managers ({nurses.length})
                  </span>
                }
                key="nurses"
              >
                <Table
                  columns={nurseColumns}
                  dataSource={nurses.map((item, index) => ({ ...item, key: index }))}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 1000 }}
                />
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <UserSwitchOutlined />
                    Brokers ({brokers.length})
                  </span>
                }
                key="brokers"
              >
                <Table
                  columns={brokerColumns}
                  dataSource={brokers.map((item, index) => ({ ...item, key: index }))}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 1000 }}
                />
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <UserOutlined />
                    Admins ({admins.length})
                  </span>
                }
                key="admins"
              >
                <Table
                  columns={adminColumns}
                  dataSource={admins.map((item, index) => ({ ...item, key: index }))}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 1000 }}
                />
              </TabPane>
              <TabPane
                tab={
                  <span>
                    <CalendarOutlined />
                    Appointments ({appointments.length})
                  </span>
                }
                key="appointments"
              >
                <Table
                  columns={appointmentColumns}
                  dataSource={appointments.map((item, index) => ({ ...item, key: index }))}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 1000 }}
                />
              </TabPane>
            </Tabs>
          )}

          {/* Modal for View/Edit Operations */}
          <Modal
            title={
              modalType === "view" 
                ? `View ${selectedUserType?.charAt(0).toUpperCase() + selectedUserType?.slice(1)} Details`
                : `Edit ${selectedUserType?.charAt(0).toUpperCase() + selectedUserType?.slice(1)}`
            }
            open={isModalVisible}
            onCancel={closeModal}
            footer={
              modalType === "view" 
                ? [
                    <Button key="close" onClick={closeModal}>
                      Close
                    </Button>
                  ]
                : [
                    <Button key="cancel" onClick={closeModal}>
                      Cancel
                    </Button>,
                    <Button key="submit" type="primary" onClick={() => form.submit()}>
                      Update
                    </Button>
                  ]
            }
            width={modalType === "view" ? 800 : 600}
          >
            {modalType === "view" ? (
              renderViewDetails()
            ) : (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleEdit}
              >
                {renderEditForm()}
              </Form>
            )}
          </Modal>
        </Card>
      </div>
    </div>
  );
};

export default ControlUsers;