import { Route, Routes } from "react-router-dom";
import DLogin from "../Pages/Dashboard/Dashboard-Login/DLogin";
import Add_Admin from "../Pages/Dashboard/Main-Dashboard/AllPages/Admin/Add_Admin";
import AddDoctor from "../Pages/Dashboard/Main-Dashboard/AllPages/Admin/Add_Doctor";
import Add_Manager from "../Pages/Dashboard/Main-Dashboard/AllPages/Admin/Add_Manager";
import Check_Appointment from "../Pages/Dashboard/Main-Dashboard/AllPages/Doctor/Check_Appointment";
import Discharge_and_Create_Slip from "../Pages/Dashboard/Main-Dashboard/AllPages/Doctor/Discharge_and_Create_Slip";
import Doctor_Profile from "../Pages/Dashboard/Main-Dashboard/AllPages/Doctor/Doctor_Profile";
import Book_Appointment from "../Pages/Dashboard/Main-Dashboard/AllPages/Manager/Book_Appointment";
import Manager_Profile from "../Pages/Dashboard/Main-Dashboard/AllPages/Manager/Manager_Profile";
import FrontPage from "../Pages/Dashboard/Main-Dashboard/GlobalFiles/FrontPage";
import RevenueDashboard from "../Pages/Dashboard/Main-Dashboard/AllPages/Manager/Revenue_Dashboard";
import AddBroker from "../Pages/Dashboard/Main-Dashboard/AllPages/Manager/Add_Broker";
import TestOrdersList from "../Pages/Dashboard/Main-Dashboard/AllPages/Manager/TestOrdersList";
import AdminDashboard from "../Pages/Dashboard/Main-Dashboard/AllPages/Admin/Admin_Dashboard";

const AllRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<DLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard/>}/>
        <Route path="/testorders" element={<TestOrdersList />} />
        <Route path="/dashboard" element={<FrontPage />} />
        <Route path="/adddoctor" element={<AddDoctor />} />
        <Route path="/addbroker" element={<AddBroker/>}/>
        <Route path="/addManager" element={<Add_Manager />} />
        <Route path="/admin" element={<Add_Admin />} />
        <Route path="/doctorprofile" element={<Doctor_Profile />} />
        <Route path="/createslip" element={<Discharge_and_Create_Slip />} />
        <Route path="/bookappointment" element={<Book_Appointment />} />
        <Route path="/manager-profile" element={<Manager_Profile />} />
        <Route path="/revenue" element={<RevenueDashboard />} />
        <Route path="/appointments" element={<Check_Appointment />} />
      </Routes>
    </>
  );
};

export default AllRoutes;