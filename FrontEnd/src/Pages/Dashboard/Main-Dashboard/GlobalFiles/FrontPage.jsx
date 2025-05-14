import { Table, Modal, Button, Spin } from "antd";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { MdPersonAdd } from "react-icons/md";
import { FaUserNurse } from "react-icons/fa";
import { RiEmpathizeLine } from "react-icons/ri";
import { FaBed } from "react-icons/fa";
import { MdOutlineBedroomParent } from "react-icons/md";
import { FaAmbulance } from "react-icons/fa";
import { BsFillBookmarkCheckFill } from "react-icons/bs";
import { MdPayment } from "react-icons/md";
import { RiAdminLine } from "react-icons/ri";
import Sidebar from "./Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { GetAllData, GetPatients } from "../../../../Redux/Datas/action";

const FrontPage = () => {
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]); // State to store doctors from API
  const [brokers, setBrokers] = useState([]); // State to store brokers from API
  const [managers, setManagers] = useState([]); // State to store managers from API
  const [admins, setAdmins] = useState([]); // State to store admins from API
  const [appointments, setAppointments] = useState([]); // State to store appointments from API
  
  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalData, setModalData] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalColumns, setModalColumns] = useState([]);
  
  const columns = [
    { title: "Name", dataIndex: "patientName", key: "patientName" },
    { title: "Age", dataIndex: "age", key: "age" },
    { title: "Disease", dataIndex: "disease", key: "disease" },
    { title: "Blood Group", dataIndex: "bloodGroup", key: "bloodGroup" },
    { title: "Department", dataIndex: "department", key: "department" },
    { title: "Email", dataIndex: "email", key: "email" },
  ];

  const { patients } = useSelector((store) => store.data.patients);
  const {
    dashboard: { data },
  } = useSelector((store) => store.data);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(GetPatients());
    dispatch(GetAllData());
    fetchBrokers();
  }, []);

  // Fetch brokers data
  const fetchBrokers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/brokers");
      setBrokers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching brokers:", error);
      setLoading(false);
    }
  };

  // Fetch doctors data
  const fetchDoctors = async () => {
    try {
      setModalLoading(true);
      const response = await axios.get("http://localhost:5000/doctors");
      setDoctors(response.data);
      setModalLoading(false);
      return response.data;
    } catch (error) {
      console.error("Error fetching doctors:", error);
      setModalLoading(false);
      return [];
    }
  };

  // Fetch managers data
  const fetchManagers = async () => {
    try {
      setModalLoading(true);
      const response = await axios.get("http://localhost:5000/managers");
      setManagers(response.data);
      setModalLoading(false);
      return response.data;
    } catch (error) {
      console.error("Error fetching managers:", error);
      setModalLoading(false);
      return [];
    }
  };

  // Fetch admins data
  const fetchAdmins = async () => {
    try {
      setModalLoading(true);
      const response = await axios.get("http://localhost:5000/admins");
      setAdmins(response.data);
      setModalLoading(false);
      return response.data;
    } catch (error) {
      console.error("Error fetching admins:", error);
      setModalLoading(false);
      return [];
    }
  };

  // Fetch appointments data
  const fetchAppointments = async () => {
    try {
      setModalLoading(true);
      const response = await axios.get("http://localhost:5000/appointments");
      setAppointments(response.data);
      setModalLoading(false);
      return response.data;
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setModalLoading(false);
      return [];
    }
  };

  const showModal = async (title, type) => {
    setIsModalVisible(true);
    setModalTitle(title);
    setModalLoading(true);
    
    let columns = [];
    let data = [];
    
    switch (type) {
      case "doctor":
        columns = [
          { title: "Name", dataIndex: "name", key: "name" },
          { title: "Specialization", dataIndex: "specialization", key: "specialization" },
          { title: "Experience", dataIndex: "experience", key: "experience" },
          { title: "Email", dataIndex: "email", key: "email" },
          { title: "Phone", dataIndex: "phone", key: "phone" },
        ];
        data = await fetchDoctors();
        break;
      case "manager":
        columns = [
          { title: "Name", dataIndex: "name", key: "name" },
          { title: "Department", dataIndex: "department", key: "department" },
          { title: "Email", dataIndex: "email", key: "email" },
          { title: "Phone", dataIndex: "phone", key: "phone" },
        ];
        data = await fetchManagers();
        break;
      case "broker":
        columns = [
          { title: "Name", dataIndex: "name", key: "name" },
          { title: "Company", dataIndex: "company", key: "company" },
          { title: "Contact", dataIndex: "contact", key: "contact" },
          { title: "Email", dataIndex: "email", key: "email" },
        ];
        data = brokers; // Already fetched in useEffect
        break;
      case "admin":
        columns = [
          { title: "Name", dataIndex: "name", key: "name" },
          { title: "Role", dataIndex: "role", key: "role" },
          { title: "Access Level", dataIndex: "accessLevel", key: "accessLevel" },
          { title: "Email", dataIndex: "email", key: "email" },
        ];
        data = await fetchAdmins();
        break;
      case "appointment":
        columns = [
          { title: "Patient Name", dataIndex: "patientName", key: "patientName" },
          { title: "Doctor", dataIndex: "doctor", key: "doctor" },
          { title: "Date", dataIndex: "date", key: "date" },
          { title: "Time", dataIndex: "time", key: "time" },
          { title: "Status", dataIndex: "status", key: "status" },
        ];
        data = await fetchAppointments();
        break;
      default:
        columns = [];
        data = [];
    }
    
    setModalColumns(columns);
    setModalData(data);
    setModalLoading(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <div className="container">
      <Sidebar />
      <div className="AfterSideBar">
        <h1 style={{ color: "rgb(184 191 234)" }}>Overview</h1>
        <div className="maindiv">
          <div 
            className="one commondiv" 
            onClick={() => showModal("Doctor Details", "doctor")}
            style={{ cursor: "pointer" }}
          >
            <div>
              <h1>{data?.doctor}</h1>
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
              <h1>{data?.nurse}</h1>
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
              <h1>{brokers.length}</h1>
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
              <h1>{data?.admin}</h1>
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
              <h1>{data?.appointment}</h1>
              <p>Appointment</p>
            </div>
            <BsFillBookmarkCheckFill className="overviewIcon" />
          </div>
        </div>

        {/* Modal for displaying detailed information */}
        <Modal
          title={modalTitle}
          open={isModalVisible}
          onCancel={handleCancel}
          footer={[
            <Button key="back" onClick={handleCancel}>
              Close
            </Button>
          ]}
          width={800}
        >
          {modalLoading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Spin size="large" />
              <p>Loading data...</p>
            </div>
          ) : (
            <Table 
              columns={modalColumns} 
              dataSource={modalData.map((item, index) => ({ ...item, key: index }))} 
              pagination={{ pageSize: 5 }}
            />
          )}
        </Modal>
      </div>
    </div>
  );
};

export default FrontPage;