import { Table, Modal, Button, Spin, Avatar, Tag, Descriptions } from "antd";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { MdPersonAdd, MdPayment, MdOutlineBedroomParent } from "react-icons/md";
import { FaHospitalUser, FaBed, FaAmbulance } from "react-icons/fa";
import { RiEmpathizeLine, RiAdminLine } from "react-icons/ri";
import { BsFillBookmarkCheckFill } from "react-icons/bs";
import Sidebar from "./Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { GetAllData, GetPatients } from "../../../../Redux/Datas/action";

const FrontPage = () => {
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [agents, setAgents] = useState([]);
  const [managers, setmanagers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatientsList] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalData, setModalData] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalColumns, setModalColumns] = useState([]);
  const [currentView, setCurrentView] = useState("table");
  const [selectedRecord, setSelectedRecord] = useState(null);

  const { patients: patientsFromRedux } = useSelector((store) => store.data.patients);
  const { dashboard: { data } } = useSelector((store) => store.data);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(GetPatients());
    dispatch(GetAllData());
    fetchAllData();
  }, [dispatch]);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchDoctors(),
      fetchAgents(),
      fetchmanagers(),
      fetchAdmins(),
      fetchAppointments(),
    ]);
    setLoading(false);
  };

  const fetchAgents = async () => {
    try {
      const response = await axios.get("https://medi-plus-diagnostic-center-bdbv.vercel.app/agents");
      setAgents(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching agents:", error);
      return [];
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await axios.get("https://medi-plus-diagnostic-center-bdbv.vercel.app/doctors");
      setDoctors(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching doctors:", error);
      return [];
    }
  };

  const fetchAdmins = async () => {
    try {
      const response = await axios.get("https://medi-plus-diagnostic-center-bdbv.vercel.app/admin");
      setAdmins(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching admins:", error);
      return [];
    }
  };

  const fetchmanagers = async () => {
    try {
      const response = await axios.get("https://medi-plus-diagnostic-center-bdbv.vercel.app/managers");
      setmanagers(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching managers:", error);
      return [];
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await axios.get("https://medi-plus-diagnostic-center-bdbv.vercel.app/appointments");
      setAppointments(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching appointments:", error);
      return [];
    }
  };

  const showModal = async (title, type) => {
    setIsModalVisible(true);
    setModalTitle(title);
    setModalLoading(true);
    setCurrentView("table");
    setSelectedRecord(null);
    
    let columns = [];
    let data = [];
    
    switch (type) {
      case "doctor":
        columns = [
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
            render: (_, record) => (
              <Button type="primary" onClick={() => viewDetails(record, "doctor")}>
                View Details
              </Button>
            )
          },
        ];
        data = doctors;
        break;
      case "manager":
        columns = [
          {
            title: "Image",
            dataIndex: "image",
            key: "image",
            render: (text) => <Avatar src={text || "https://res.cloudinary.com/diverse/image/upload/v1674562453/diverse/oipm1ecb1yudf9eln7az.jpg"} />
          },
          { title: "ID", dataIndex: "managerID", key: "managerID" },
          { title: "Name", dataIndex: "managerName", key: "managerName" },
          { title: "Email", dataIndex: "email", key: "email" },
          { title: "Mobile", dataIndex: "mobile", key: "mobile" },
          { title: "Education", dataIndex: "education", key: "education" },
          { 
            title: "Actions", 
            key: "actions", 
            render: (_, record) => (
              <Button type="primary" onClick={() => viewDetails(record, "manager")}>
                View Details
              </Button>
            )
          },
        ];
        data = managers;
        break;
      case "agent":
        columns = [
          {
            title: "Image",
            dataIndex: "image",
            key: "image",
            render: (text) => <Avatar src={text || "https://res.cloudinary.com/diverse/image/upload/v1674562453/diverse/oipm1ecb1yudf9eln7az.jpg"} />
          },
          { title: "ID", dataIndex: "agentID", key: "agentID" },
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
            render: (_, record) => (
              <Button type="primary" onClick={() => viewDetails(record, "agent")}>
                View Details
              </Button>
            )
          },
        ];
        data = agents;
        break;
      case "admin":
        columns = [
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
            render: (_, record) => (
              <Button type="primary" onClick={() => viewDetails(record, "admin")}>
                View Details
              </Button>
            )
          },
        ];
        data = admins;
        break;
      case "appointment":
        columns = [
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
            render: (_, record) => (
              <Button type="primary" onClick={() => viewDetails(record, "appointment")}>
                View Details
              </Button>
            )
          },
        ];
        data = appointments; 
        break;
      case "patient":
        columns = [
          {
            title: "Image",
            dataIndex: "image",
            key: "image",
            render: (text) => <Avatar src={text || "https://res.cloudinary.com/diverse/image/upload/v1674562453/diverse/oipm1ecb1yudf9eln7az.jpg"} />
          },
          { title: "ID", dataIndex: "patientID", key: "patientID" },
          { title: "Name", dataIndex: "patientName", key: "patientName" },
          { title: "Age", dataIndex: "age", key: "age" },
          { title: "Disease", dataIndex: "disease", key: "disease" },
          { title: "Blood Group", dataIndex: "bloodGroup", key: "bloodGroup" },
          { title: "Department", dataIndex: "department", key: "department" },
          { 
            title: "Actions", 
            key: "actions", 
            render: (_, record) => (
              <Button type="primary" onClick={() => viewDetails(record, "patient")}>
                View Details
              </Button>
            )
          },
        ];
        data = patients;
        break;
      default:
        columns = [];
        data = [];
    }
    
    setModalColumns(columns);
    setModalData(data);
    setModalLoading(false);
  };

  const viewDetails = (record, type) => {
    setSelectedRecord(record);
    setCurrentView("details");
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setCurrentView("table");
    setSelectedRecord(null);
  };

  const backToTable = () => {
    setCurrentView("table");
    setSelectedRecord(null);
  };

  const renderDetailsView = (record, type) => {
    if (!record) return null;
    
    switch (type) {
      case "doctor":
        return (
          <div>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <Avatar
                src={record.image || "https://res.cloudinary.com/diverse/image/upload/v1674562453/diverse/oipm1ecb1yudf9eln7az.jpg"}
                size={100}
              />
              <h2>{record.docName}</h2>
              <p>{record.department}</p>
            </div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Doctor ID">{record.docID}</Descriptions.Item>
              <Descriptions.Item label="Email">{record.email}</Descriptions.Item>
              <Descriptions.Item label="Mobile">{record.mobile}</Descriptions.Item>
              <Descriptions.Item label="Age">{record.age}</Descriptions.Item>
              <Descriptions.Item label="Gender">{record.gender}</Descriptions.Item>
              <Descriptions.Item label="Blood Group">{record.bloodGroup}</Descriptions.Item>
              <Descriptions.Item label="Date of Birth">{record.DOB}</Descriptions.Item>
              <Descriptions.Item label="Address">{record.address}</Descriptions.Item>
              <Descriptions.Item label="Education">{record.education}</Descriptions.Item>
              <Descriptions.Item label="Details" span={2}>{record.details}</Descriptions.Item>
            </Descriptions>
          </div>
        );
      case "manager":
        return (
          <div>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <Avatar
                src={record.image || "https://res.cloudinary.com/diverse/image/upload/v1674562453/diverse/oipm1ecb1yudf9eln7az.jpg"}
                size={100}
              />
              <h2>{record.managerName}</h2>
            </div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="manager ID">{record.managerID}</Descriptions.Item>
              <Descriptions.Item label="Email">{record.email}</Descriptions.Item>
              <Descriptions.Item label="Mobile">{record.mobile}</Descriptions.Item>
              <Descriptions.Item label="Age">{record.age}</Descriptions.Item>
              <Descriptions.Item label="Gender">{record.gender}</Descriptions.Item>
              <Descriptions.Item label="Blood Group">{record.bloodGroup}</Descriptions.Item>
              <Descriptions.Item label="Date of Birth">{record.DOB}</Descriptions.Item>
              <Descriptions.Item label="Address">{record.address}</Descriptions.Item>
              <Descriptions.Item label="Education">{record.education}</Descriptions.Item>
              <Descriptions.Item label="Details" span={2}>{record.details}</Descriptions.Item>
            </Descriptions>
          </div>
        );
      case "agent":
        return (
          <div>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <Avatar
                src={record.image || "https://res.cloudinary.com/diverse/image/upload/v1674562453/diverse/oipm1ecb1yudf9eln7az.jpg"}
                size={100}
              />
              <h2>{record.name}</h2>
              <Tag color={record.status === 'active' ? 'green' : 'red'}>
                {record.status?.toUpperCase() || "ACTIVE"}
              </Tag>
            </div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Agent ID">{record.agentID}</Descriptions.Item>
              <Descriptions.Item label="Email">{record.email}</Descriptions.Item>
              <Descriptions.Item label="Mobile">{record.mobile}</Descriptions.Item>
              <Descriptions.Item label="Age">{record.age}</Descriptions.Item>
              <Descriptions.Item label="Gender">{record.gender}</Descriptions.Item>
              <Descriptions.Item label="Address">{record.address}</Descriptions.Item>
              <Descriptions.Item label="Commission Rate">{record.commissionRate}%</Descriptions.Item>
              <Descriptions.Item label="Status">{record.status}</Descriptions.Item>
              <Descriptions.Item label="Referrals">{record.referrals}</Descriptions.Item>
              <Descriptions.Item label="Total Commission">₹{record.totalCommission}</Descriptions.Item>
              <Descriptions.Item label="Date Joined">{new Date(record.dateJoined).toLocaleDateString()}</Descriptions.Item>
              <Descriptions.Item label="Notes" span={2}>{record.notes}</Descriptions.Item>
            </Descriptions>
          </div>
        );
      case "admin":
        return (
          <div>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <Avatar
                src={record.image || "https://res.cloudinary.com/diverse/image/upload/v1674562453/diverse/oipm1ecb1yudf9eln7az.jpg"}
                size={100}
              />
              <h2>{record.adminName || "Admin"}</h2>
            </div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Admin ID">{record.adminID || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Email">{record.email || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Mobile">{record.mobile || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Age">{record.age || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Gender">{record.gender || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Date of Birth">{record.DOB || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Address">{record.address || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Education">{record.education || "N/A"}</Descriptions.Item>
            </Descriptions>
          </div>
        );
      case "appointment":
        return (
          <div>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <h2>Appointment Details for {record.patientName}</h2>
              <p>Date: {record.date} | Time: {record.time}</p>
            </div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Patient ID">{record.patientID}</Descriptions.Item>
              <Descriptions.Item label="Patient Name">{record.patientName}</Descriptions.Item>
              <Descriptions.Item label="Age">{record.age}</Descriptions.Item>
              <Descriptions.Item label="Gender">{record.gender}</Descriptions.Item>
              <Descriptions.Item label="Email">{record.email}</Descriptions.Item>
              <Descriptions.Item label="Mobile">{record.mobile}</Descriptions.Item>
              <Descriptions.Item label="Disease">{record.disease}</Descriptions.Item>
              <Descriptions.Item label="Doctor">{record.doctorName}</Descriptions.Item>
              <Descriptions.Item label="Agent">{record.agentName}</Descriptions.Item>
              <Descriptions.Item label="Address">{record.address}</Descriptions.Item>
            </Descriptions>
            
            <h3 style={{ marginTop: 20 }}>Tests</h3>
            <Table 
              dataSource={record.tests?.map((test, index) => ({ ...test, key: index })) || []}
              columns={[
                { title: "Test Name", dataIndex: "testName", key: "testName" },
                { title: "Price", dataIndex: "testPrice", key: "testPrice", render: (price) => `₹${price}` }
              ]}
              pagination={false}
            />
            
            <h3 style={{ marginTop: 20 }}>Revenue Distribution</h3>
            <Descriptions bordered column={3}>
              <Descriptions.Item label="Total Amount">₹{record.totalAmount}</Descriptions.Item>
              <Descriptions.Item label="Hospital Revenue">₹{record.hospitalRevenue}</Descriptions.Item>
              <Descriptions.Item label="Doctor Revenue">₹{record.doctorRevenue}</Descriptions.Item>
              <Descriptions.Item label="Agent Revenue">₹{record.agentRevenue}</Descriptions.Item>
            </Descriptions>
          </div>
        );
      case "patient":
        return (
          <div>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <Avatar
                src={record.image || "https://res.cloudinary.com/diverse/image/upload/v1674562453/diverse/oipm1ecb1yudf9eln7az.jpg"}
                size={100}
              />
              <h2>{record.patientName}</h2>
              <p>{record.disease}</p>
            </div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Patient ID">{record.patientID}</Descriptions.Item>
              <Descriptions.Item label="Email">{record.email}</Descriptions.Item>
              <Descriptions.Item label="Mobile">{record.mobile}</Descriptions.Item>
              <Descriptions.Item label="Age">{record.age}</Descriptions.Item>
              <Descriptions.Item label="Gender">{record.gender}</Descriptions.Item>
              <Descriptions.Item label="Blood Group">{record.bloodGroup}</Descriptions.Item>
              <Descriptions.Item label="Disease">{record.disease}</Descriptions.Item>
              <Descriptions.Item label="Department">{record.department}</Descriptions.Item>
              <Descriptions.Item label="Address">{record.address}</Descriptions.Item>
              <Descriptions.Item label="Details" span={2}>{record.details}</Descriptions.Item>
            </Descriptions>
          </div>
        );
      default:
        return <div>No details available</div>;
    }
  };

  const dashboardCards = [
    {
      title: "Doctor",
      count: doctors.length || data?.doctor || 0,
      icon: <MdPersonAdd className="text-4xl" />,
      bgColor: "bg-gradient-to-br from-blue-500 to-blue-600",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      onClick: () => showModal("Doctor Details", "doctor")
    },
    {
      title: "Manager",
      count: managers.length || data?.manager || 0,
      icon: <FaHospitalUser className="text-4xl" />,
      bgColor: "bg-gradient-to-br from-green-500 to-green-600",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      onClick: () => showModal("Manager Details", "manager")
    },
    {
      title: "Agent",
      count: agents.length || 0,
      icon: <RiEmpathizeLine className="text-4xl" />,
      bgColor: "bg-gradient-to-br from-purple-500 to-purple-600",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      onClick: () => showModal("Agent Details", "agent")
    },
    {
      title: "Admin",
      count: admins.length || data?.admin || 0,
      icon: <RiAdminLine className="text-4xl" />,
      bgColor: "bg-gradient-to-br from-orange-500 to-orange-600",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      onClick: () => showModal("Admin Details", "admin")
    },
    {
      title: "Appointment",
      count: appointments.length || data?.appointment || 0,
      icon: <BsFillBookmarkCheckFill className="text-4xl" />,
      bgColor: "bg-gradient-to-br from-teal-500 to-teal-600",
      iconBg: "bg-teal-100",
      iconColor: "text-teal-600",
      onClick: () => showModal("Appointment Details", "appointment")
    }
  ];
  
  return (
    <div className="flex min-h-screen bg-gray-50">
          <Sidebar onCollapse={setSidebarCollapsed} />
    <div className={` flex-1 p-6 transition-all duration-300 ${
      sidebarCollapsed ? 'ml-20' : 'ml-0'
    }`}>
      <div className="flex-1 p-6 ml-40">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Overview</h1>
          <p className="text-gray-600">Monitor your healthcare management system</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Spin size="large" />
              <p className="mt-4 text-gray-600">Loading dashboard data...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {dashboardCards.map((card, index) => (
              <div
                key={index}
                onClick={card.onClick}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer transform hover:-translate-y-1"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-1">
                        {card.count}
                      </h3>
                      <p className="text-gray-600 text-sm font-medium">
                        {card.title}
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${card.iconBg}`}>
                      <div className={card.iconColor}>
                        {card.icon}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className={`h-1 rounded-full ${card.bgColor}`}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal
          title={
            <div className="text-lg font-semibold text-gray-800">
              {modalTitle}
            </div>
          }
          open={isModalVisible}
          onCancel={handleCancel}
          footer={
            currentView === "table" 
              ? [
                  <Button key="back" onClick={handleCancel} className="bg-gray-500 hover:bg-gray-600">
                    Close
                  </Button>
                ]
              : [
                  <Button key="back" onClick={backToTable} className="bg-blue-500 hover:bg-blue-600">
                    Back to List
                  </Button>,
                  <Button key="close" onClick={handleCancel} className="bg-gray-500 hover:bg-gray-600">
                    Close
                  </Button>
                ]
          }
          width={currentView === "details" ? 800 : 1000}
          className="custom-modal"
        >
          {modalLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Spin size="large" />
                <p className="mt-4 text-gray-600">Loading data...</p>
              </div>
            </div>
          ) : currentView === "table" ? (
            <Table 
              columns={modalColumns} 
              dataSource={modalData.map((item, index) => ({ ...item, key: index }))} 
              pagination={{ pageSize: 5 }}
              className="custom-table"
            />
          ) : (
            <div className="bg-white rounded-lg">
              {renderDetailsView(selectedRecord, modalTitle.split(" ")[0].toLowerCase())}
            </div>
          )}
        </Modal>
      </div>
      </div>
    </div>
  );
};

export default FrontPage;