import { Table, Modal, Button, Spin, Avatar, Tag, Descriptions } from "antd";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { MdPersonAdd } from "react-icons/md";
import { FaUserNurse } from "react-icons/fa";
import { RiEmpathizeLine, RiAdminLine } from "react-icons/ri";
import { FaBed } from "react-icons/fa";
import { MdOutlineBedroomParent } from "react-icons/md";
import { FaAmbulance } from "react-icons/fa";
import { BsFillBookmarkCheckFill } from "react-icons/bs";
import { MdPayment } from "react-icons/md";
import Sidebar from "./Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { GetAllData, GetPatients } from "../../../../Redux/Datas/action";

const FrontPage = () => {
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]); // State to store doctors from API
  const [brokers, setBrokers] = useState([]); // State to store brokers from API
  const [nurses, setNurses] = useState([]); // State to store nurses (managers) from API
  const [admins, setAdmins] = useState([]); // State to store admins from API
  const [appointments, setAppointments] = useState([]); // State to store appointments from API
  const [patients, setPatientsList] = useState([]); // State to store patients from API

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalData, setModalData] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalColumns, setModalColumns] = useState([]);
  const [currentView, setCurrentView] = useState("table"); // "table" or "details"
  const [selectedRecord, setSelectedRecord] = useState(null);

  const columns = [
    { title: "Name", dataIndex: "patientName", key: "patientName" },
    { title: "Age", dataIndex: "age", key: "age" },
    { title: "Disease", dataIndex: "disease", key: "disease" },
    { title: "Blood Group", dataIndex: "bloodGroup", key: "bloodGroup" },
    { title: "Department", dataIndex: "department", key: "department" },
    { title: "Email", dataIndex: "email", key: "email" },
  ];

  const { patients: patientsFromRedux } = useSelector((store) => store.data.patients);
  const {
    dashboard: { data },
  } = useSelector((store) => store.data);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(GetPatients());
    dispatch(GetAllData());
    fetchAllData();
  }, [dispatch]);

  // Fetch all data at once
  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchDoctors(),
      fetchBrokers(),
      fetchNurses(),
      fetchAdmins(),
      fetchAppointments(),
      // fetchPatients()
    ]);
    setLoading(false);
  };

  // Fetch patients data
  // const fetchPatients = async () => {
  //   try {
  //     const response = await axios.get("http://localhost:5000/patients");
  //     setPatientsList(response.data);
  //     return response.data;
  //   } catch (error) {
  //     console.error("Error fetching patients:", error);
  //     return [];
  //   }
  // };

  // Fetch brokers data
  const fetchBrokers = async () => {
    try {
      const response = await axios.get("http://localhost:5000/brokers");
      setBrokers(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching brokers:", error);
      return [];
    }
  };

  // Fetch doctors data
  const fetchDoctors = async () => {
    try {
      const response = await axios.get("http://localhost:5000/doctors");
      setDoctors(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching doctors:", error);
      return [];
    }
  };

  // Fetch admins data
  const fetchAdmins = async () => {
    try {
      const response = await axios.get("http://localhost:5000/admin");
      setAdmins(response.data);
      console.log("admin data:", admins);
      return response.data;
    } catch (error) {
      console.error("Error fetching admins:", error);
      return [];
    }
  };

  // Fetch nurses data (managers)
  const fetchNurses = async () => {
    try {
      const response = await axios.get("http://localhost:5000/nurses");
      setNurses(response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching nurses:", error);
      return [];
    }
  };

  // Fetch appointments data
  const fetchAppointments = async () => {
    try {
      const response = await axios.get("http://localhost:5000/appointments");
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
        data = doctors; // Use already fetched data
        break;
      case "manager":
        columns = [
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
            render: (_, record) => (
              <Button type="primary" onClick={() => viewDetails(record, "manager")}>
                View Details
              </Button>
            )
          },
        ];
        data = nurses; // Use already fetched data
        break;
      case "broker":
        columns = [
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
            render: (_, record) => (
              <Button type="primary" onClick={() => viewDetails(record, "broker")}>
                View Details
              </Button>
            )
          },
        ];
        data = brokers; // Already fetched in useEffect
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
        data = admins; // Use already fetched data
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
        data = appointments; // Use already fetched data
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
        data = patients; // Use already fetched data
        break;
      default:
        columns = [];
        data = [];
    }
    
    setModalColumns(columns);
    setModalData(data);
    setModalLoading(false);
  };

  // Function to view details of a specific record
  const viewDetails = (record, type) => {
    console.log(`Viewing details for ${type}:`, record);
    setSelectedRecord(record);
    setCurrentView("details");
  };

  // Function to cancel modal
  const handleCancel = () => {
    setIsModalVisible(false);
    setCurrentView("table");
    setSelectedRecord(null);
  };

  // Function to go back to table view from details view
  const backToTable = () => {
    setCurrentView("table");
    setSelectedRecord(null);
  };

  // Render the details view based on record type
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
              <h2>{record.nurseName}</h2>
            </div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Nurse ID">{record.nurseID}</Descriptions.Item>
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
      case "broker":
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
              <Descriptions.Item label="Broker ID">{record.brokerID}</Descriptions.Item>
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
              <Descriptions.Item label="Broker">{record.brokerName}</Descriptions.Item>
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
              <Descriptions.Item label="Broker Revenue">₹{record.brokerRevenue}</Descriptions.Item>
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
  
  return (
    <div className="container">
      <Sidebar />
      <div className="AfterSideBar">
        <h1 style={{ color: "rgb(184 191 234)" }}>Overview</h1>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <p>Loading dashboard data...</p>
          </div>
        ) : (
          <div className="maindiv">
            <div 
              className="one commondiv" 
              onClick={() => showModal("Doctor Details", "doctor")}
              style={{ cursor: "pointer" }}
            >
              <div>
                <h1>{doctors.length || data?.doctor || 0}</h1>
                <p>Doctor</p>
              </div>
              <MdPersonAdd className="overviewIcon" />
            </div>
            <div 
              className="two commondiv" 
              onClick={() => showModal("Manager Details", "manager")}
              style={{ cursor: "pointer" }}
            >
              <div>
                <h1>{nurses.length || data?.nurse || 0}</h1>
                <p>Manager</p>
              </div>
              <FaUserNurse className="overviewIcon" />
            </div>
            <div 
              className="three commondiv" 
              onClick={() => showModal("Broker Details", "broker")}
              style={{ cursor: "pointer" }}
            >
              <div>
                <h1>{brokers.length || 0}</h1>
                <p>Broker</p>
              </div>
              <RiEmpathizeLine className="overviewIcon" />
            </div>
            <div 
              className="six commondiv" 
              onClick={() => showModal("Admin Details", "admin")}
              style={{ cursor: "pointer" }}
            >
              <div>
                <h1>{admins.length || data?.admin || 0}</h1>
                <p>Admin</p>
              </div>
              <RiAdminLine className="overviewIcon" />
            </div>
            <div 
              className="six commondiv" 
              onClick={() => showModal("Appointment Details", "appointment")}
              style={{ cursor: "pointer" }}
            >
              <div>
                <h1>{appointments.length || data?.appointment || 0}</h1>
                <p>Appointment</p>
              </div>
              <BsFillBookmarkCheckFill className="overviewIcon" />
            </div>
            {/* <div 
              className="four commondiv" 
              onClick={() => showModal("Patient Details", "patient")}
              style={{ cursor: "pointer" }}
            >
              <div>
                <h1>{patients.length || patientsFromRedux?.length || 0}</h1>
                <p>Patient</p>
              </div>
              <FaBed className="overviewIcon" />
            </div> */}
          </div>
        )}

        {/* Modal for displaying detailed information */}
        <Modal
          title={modalTitle}
          open={isModalVisible}
          onCancel={handleCancel}
          footer={
            currentView === "table" 
              ? [
                  <Button key="back" onClick={handleCancel}>
                    Close
                  </Button>
                ]
              : [
                  <Button key="back" onClick={backToTable}>
                    Back to List
                  </Button>,
                  <Button key="close" onClick={handleCancel}>
                    Close
                  </Button>
                ]
          }
          width={currentView === "details" ? 800 : 1000}
        >
          {modalLoading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Spin size="large" />
              <p>Loading data...</p>
            </div>
          ) : currentView === "table" ? (
            <Table 
              columns={modalColumns} 
              dataSource={modalData.map((item, index) => ({ ...item, key: index }))} 
              pagination={{ pageSize: 5 }}
            />
          ) : (
            renderDetailsView(selectedRecord, modalTitle.split(" ")[0].toLowerCase())
          )}
        </Modal>
      </div>
    </div>
  );
};

export default FrontPage;