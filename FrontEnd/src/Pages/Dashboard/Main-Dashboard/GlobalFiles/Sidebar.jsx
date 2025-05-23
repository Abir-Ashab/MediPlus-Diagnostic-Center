import React, { useState } from "react";
// Updated imports with more meaningful icons
import { RiUserAddLine } from "react-icons/ri"; // For adding users
import { FaAmbulance } from "react-icons/fa"; // Kept for emergency
import { FaUserMd } from "react-icons/fa"; // Kept for doctor
import { FaNotesMedical } from "react-icons/fa"; // For reports/medical notes
import { MdPayment } from "react-icons/md"; // For payment
import { MdOutlinePersonPin } from "react-icons/md"; // For user profile/follow
import { BsCalendarPlus } from "react-icons/bs"; // For booking appointments
import { BsCalendarCheck } from "react-icons/bs"; // For appointment confirmations
import { FaFileMedical } from "react-icons/fa"; // For medical details/files
import { CgProfile } from "react-icons/cg"; // Kept for profile
import { FaHospitalUser } from "react-icons/fa"; // Kept for hospital user
import { FaClipboardList } from "react-icons/fa"; // For medical reports
import { MdChildCare } from "react-icons/md"; // Kept for children
import { Link } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi"; // Better hamburger menu icon
import { BiLogOut } from "react-icons/bi"; // For logout
import { MdAdminPanelSettings } from "react-icons/md"; // For admin panel
import { GiMedicines } from "react-icons/gi"; // For medical tests
import { MdDashboard } from "react-icons/md"; // For dashboard
import { FaMoneyBillWave } from "react-icons/fa"; // Kept for revenue
import { FaUserNurse } from "react-icons/fa"; // Better nurse icon
import { FaHandshake } from "react-icons/fa"; // For broker
import { useDispatch, useSelector } from "react-redux";
import ControlUsers from "../AllPages/Admin/ControlUsers";
import { UserDeleteOutlined } from '@ant-design/icons';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();

  const {
    data: { user },
  } = useSelector((state) => state.auth);

  function toggle() {
    setIsOpen(!isOpen);
  }

  return (
    <>
      <div>
        <div style={{ width: isOpen ? "230px" : "80px" }} className={`sidebar`}>
          <div className="top_section">
            <h1 style={{ display: isOpen ? "block" : "none" }} className="logo">
              Mediplus 
            </h1>
            <div
              style={{ marginLeft: isOpen ? "50px" : "0px" }}
              className="bars"
            >
              <GiHamburgerMenu onClick={toggle} style={{ cursor: "pointer" }} />
            </div>
          </div>
          <div className="bottomSection">
          
            {
            user?.userType === "nurse" ? (
            <Link className="link" activeclassname="active" to={"/dashboard"}>
              <div className="icon">
                <MdDashboard className="mainIcon" />
              </div>
              <div
                style={{ display: isOpen ? "block" : "none" }}
                className="link_text"
              >
                DashBoard
              </div>
            </Link>) : null }
            {
            user?.userType === "admin" ?(
            <Link className="link" activeclassname="active" to={"/controlUser"}>
              <div className="icon">
                <MdDashboard className="mainIcon" />
              </div>
              <div
                style={{ display: isOpen ? "block" : "none" }}
                className="link_text"
              >
                Admin DashBoard
              </div>
            </Link>) : null
            }
            {user?.userType === "nurse" ? (
              <Link
                className="link"
                activeclassname="active"
                to={"/nurseprofile"}
              >
                <div className="icon">
                  <CgProfile className="mainIcon" />
                </div>
                <div
                  style={{ display: isOpen ? "block" : "none" }}
                  className="link_text"
                >
                  Profile
                </div>
              </Link>
            ) : null}
            {user?.userType === "nurse" ? (
              <Link
                className="link"
                activeclassname="active"
                to={"/addbroker"}
              >
                <div className="icon">
                  <FaHandshake className="mainIcon" />
                </div>
                <div
                  style={{ display: isOpen ? "block" : "none" }}
                  className="link_text"
                >
                  Add Broker
                </div>
              </Link>
            ) : null}

            {user?.userType === "nurse" ? (
              <Link
                className="link"
                activeclassname="active"
                to={"/bookappointment"}
              >
                <div className="icon">
                  <BsCalendarPlus className="mainIcon" />
                </div>
                <div
                  style={{ display: isOpen ? "block" : "none" }}
                  className="link_text"
                >
                   Book Appointments
                </div>
              </Link>
            ) : null}

             {user?.userType === "nurse" ? (
              <Link
                className="link"
                activeclassname="active"
                to={"/booktest"}
              >
                <div className="icon">
                  <FaFileMedical className="mainIcon" />
                </div>
                <div
                  style={{ display: isOpen ? "block" : "none" }}
                  className="link_text"
                >
                   Book Test
                </div>
              </Link>
            ) : null}

            {user?.userType === "admin" ? (
              <Link className="link" activeclassname="active" to={"/addManager"}>
                <div className="icon">
                  <FaUserNurse className="mainIcon" />
                </div>
                <div
                  style={{ display: isOpen ? "block" : "none" }}
                  className="link_text"
                >
                  Add Manager
                </div>
              </Link>
            ) : null}
            {user?.userType === "admin" ? (
              <Link className="link" activeclassname="active" to={"/admin"}>
                <div className="icon">
                  <MdAdminPanelSettings
                    className="mainIcon"
                    style={{ color: "white" }}
                  />
                </div>
                <div
                  style={{ display: isOpen ? "block" : "none" }}
                  className="link_text"
                >
                  Add Admin
                </div>
              </Link>
            ) : null}
            {user?.userType === "doctor" ? (
              <Link
                className="link"
                activeclassname="active"
                to={"/doctorprofile"}
              >
                <div className="icon">
                  <MdOutlinePersonPin className="mainIcon" />
                </div>
                <div
                  style={{ display: isOpen ? "block" : "none" }}
                  className="link_text"
                >
                  Profile
                </div>
              </Link>
            ) : null}
          
            {user?.userType === "doctor" ? (
              <Link className="link" activeclassname="active" to={"/reports"}>
                <div className="icon">
                  <FaClipboardList className="mainIcon" />
                </div>
                <div
                  style={{ display: isOpen ? "block" : "none" }}
                  className="link_text"
                >
                  Reports
                </div>
              </Link>
            ) : null}

            {user?.userType === "nurse" ? (
              <Link
                className="link"
                activeclassname="active"
                to={"/appointments"}
              >
                <div className="icon">
                  <BsCalendarCheck className="mainIcon" />
                </div>
                <div
                  style={{ display: isOpen ? "block" : "none" }}
                  className="link_text"
                >
                  Appointments
                </div>
              </Link>
            ) : null}

             {user?.userType === "nurse" ? (
              <Link
                className="link"
                activeclassname="active"
                to={"/testorders"}
              >
                <div className="icon">
                  <GiMedicines className="mainIcon" />
                </div>
                <div
                  style={{ display: isOpen ? "block" : "none" }}
                  className="link_text"
                >
                  Test Orders
                </div>
              </Link>
            ) : null}

            {user?.userType === "doctor" ? (
              <Link
                className="link"
                activeclassname="active"
                to={"/createslip"}
              >
                <div className="icon">
                  <FaNotesMedical className="mainIcon" />
                </div>
                <div
                  style={{ display: isOpen ? "block" : "none" }}
                  className="link_text"
                >
                  Create Report
                </div>
              </Link>
            ) : null}

            {/* Revenue links - added for nurse and admin users */}
            {(user?.userType === "nurse" || user?.userType === "admin") ? (
              <Link
                className="link"
                activeclassname="active"
                to={"/hospital-revenue"}
              >
                <div className="icon">
                  <FaMoneyBillWave className="mainIcon" />
                </div>
                <div
                  style={{ display: isOpen ? "block" : "none" }}
                  className="link_text"
                >
                  Hospital Revenue
                </div>
              </Link>
            ) : null}

            {(user?.userType === "nurse" || user?.userType === "admin") ? (
              <Link
                className="link"
                activeclassname="active"
                to={"/adddoctor"}
              >
                <div className="icon">
                  <FaUserMd className="mainIcon" />
                </div>
                <div
                  style={{ display: isOpen ? "block" : "none" }}
                  className="link_text"
                >
                  Add Doctor
                </div>
              </Link>
            ) : null}

            {(user?.userType === "nurse" || user?.userType === "admin") ? (
              <Link
                className="link"
                activeclassname="active"
                to={"/doctor-revenue"}
              >
                <div className="icon">
                  <MdPayment className="mainIcon" />
                </div>
                <div
                  style={{ display: isOpen ? "block" : "none" }}
                  className="link_text"
                >
                  Doctor Revenue
                </div>
              </Link>
            ) : null}

            {(user?.userType === "nurse" || user?.userType === "admin") ? (
              <Link
                className="link"
                activeclassname="active"
                to={"/broker-revenue"}
              >
                <div className="icon">
                  <FaMoneyBillWave className="mainIcon" />
                </div>
                <div
                  style={{ display: isOpen ? "block" : "none" }}
                  className="link_text"
                >
                  Broker Revenue
                </div>
              </Link>
            ) : null}

            <Link
              className="LogOutPath link"
              onClick={() => {
                dispatch({ type: "AUTH_LOGOUT" });
              }}
              to={"/"}
            >
              <div className="icon">
                <BiLogOut />
              </div>
              <div
                style={{ display: isOpen ? "block" : "none" }}
                className="link_text"
              >
                Logout
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;