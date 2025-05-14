import React from "react";
import { Route, Routes } from "react-router-dom";
import DLogin from "../Pages/Dashboard/Dashboard-Login/DLogin";
import AddBeds from "../Pages/Dashboard/Main-Dashboard/AllPages/Admin/AddBeds";
import Add_Admin from "../Pages/Dashboard/Main-Dashboard/AllPages/Admin/Add_Admin";
import Add_Ambulance from "../Pages/Dashboard/Main-Dashboard/AllPages/Admin/Add_Ambulance";
import AddDoctor from "../Pages/Dashboard/Main-Dashboard/AllPages/Admin/Add_Doctor";
import Add_Nurse from "../Pages/Dashboard/Main-Dashboard/AllPages/Admin/Add_Nurse";
import Beds_Rooms from "../Pages/Dashboard/Main-Dashboard/AllPages/Admin/Beds_Rooms";
import Check_Payment from "../Pages/Dashboard/Main-Dashboard/AllPages/Admin/Check_Payment";
import AllReport from "../Pages/Dashboard/Main-Dashboard/AllPages/Doctor/AllReport";
import Check_Appointment from "../Pages/Dashboard/Main-Dashboard/AllPages/Doctor/Check_Appointment";
import Discharge_and_Create_Slip from "../Pages/Dashboard/Main-Dashboard/AllPages/Doctor/Discharge_and_Create_Slip";
import Doctor_Profile from "../Pages/Dashboard/Main-Dashboard/AllPages/Doctor/Doctor_Profile";
import Patient_Details from "../Pages/Dashboard/Main-Dashboard/AllPages/Doctor/Patient_Details";
import Add_Patient from "../Pages/Dashboard/Main-Dashboard/AllPages/Nurse/Add_Patient";
import Book_Appointment from "../Pages/Dashboard/Main-Dashboard/AllPages/Nurse/Book_Appointment";
import Nurse_Profile from "../Pages/Dashboard/Main-Dashboard/AllPages/Nurse/Nurse_Profile";
import FrontPage from "../Pages/Dashboard/Main-Dashboard/GlobalFiles/FrontPage";
import Hospital_Revenue from "../Pages/Dashboard/Main-Dashboard/AllPages/Nurse/Hospital_Revenue";
import Doctor_Revenue from "../Pages/Dashboard/Main-Dashboard/AllPages/Nurse/Doctor_Revenue";
import Broker_Revenue from "../Pages/Dashboard/Main-Dashboard/AllPages/Nurse/Broker_Revenue";
import AddBroker from "../Pages/Dashboard/Main-Dashboard/AllPages/Nurse/Add_Broker";

const AllRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<DLogin />} />
        <Route path="/dashboard" element={<FrontPage />} />
        <Route path="/adddoctor" element={<AddDoctor />} />
        {/* <Route path="/addpatient" element={<Add_Patient/>}/> */}
        <Route path="/addbroker" element={<AddBroker/>}/>
        <Route path="/addManager" element={<Add_Nurse />} />
        <Route path="/admin" element={<Add_Admin />} />
        <Route path="/doctorprofile" element={<Doctor_Profile />} />
        <Route path="/createslip" element={<Discharge_and_Create_Slip />} />
        <Route path="/bookappointment" element={<Book_Appointment />} />
        <Route path="/nurseprofile" element={<Nurse_Profile />} />
        <Route path="/hospital-revenue" element={<Hospital_Revenue />} />
        <Route path="/appointments" element={<Check_Appointment />} />
        <Route path="/doctor-revenue" element={<Doctor_Revenue />} />
        <Route path="/broker-revenue" element={<Broker_Revenue />} />
      </Routes>
    </>
  );
};

export default AllRoutes;