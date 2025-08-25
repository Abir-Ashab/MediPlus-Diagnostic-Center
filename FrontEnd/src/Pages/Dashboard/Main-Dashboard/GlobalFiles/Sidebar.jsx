import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { GiHamburgerMenu, GiMedicines } from "react-icons/gi";
import { CgProfile } from "react-icons/cg";
import { FaUserMd, FaHospitalUser, FaHandshake, FaNotesMedical, FaClipboardList, FaMoneyBillWave, FaDollarSign, FaDatabase } from "react-icons/fa";
import { MdDashboard, MdAdminPanelSettings, MdPayment } from "react-icons/md";
import { BsCalendarPlus, BsCalendarCheck } from "react-icons/bs";
import { BiLogOut } from "react-icons/bi";

const Sidebar = ({ onCollapse }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();

  const {
    data: { user },
  } = useSelector((state) => state.auth);

  function toggle() {
    setIsOpen(!isOpen);
    if (onCollapse) {
      onCollapse(!isOpen);
    }
  }

  return (
    <div className="relative">
      <div 
        className={`
          fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-800 to-slate-900 
          text-white transition-all duration-300 ease-in-out z-50 shadow-2xl
          ${isOpen ? 'w-64' : 'w-20'}
        `}
      >
      <div className="flex items-center p-5 border-b border-slate-700">
          <button
            onClick={toggle}
            className="p-2 rounded-full hover:bg-slate-700 transition-colors duration-200"
          >
            <GiHamburgerMenu className="text-xl" />
          </button>
          <img 
            src="mediplus.png" 
            alt="MediPlus" 
            className={`
              h-20 md:h-24 object-contain
              ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}
              transition-opacity duration-200
            `}
          />
        </div>

        <div className="flex flex-col h-full overflow-y-auto">
          <nav className="flex-1 py-4">
            
            {user?.userType === "manager" && (
              <Link
                className="flex items-center px-4 py-3 mx-2 rounded-lg hover:bg-slate-700 transition-colors duration-200 group"
                to="/manager-profile"
              >
                <div className="flex items-center justify-center w-8 h-8">
                  <CgProfile className="text-xl text-blue-400 group-hover:text-blue-300" />
                </div>
                <span 
                  className={`
                    ml-3 font-medium transition-all duration-300
                    ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                  `}
                >
                  Profile
                </span>
              </Link>
            )}

            {user?.userType === "manager" && (
              <Link 
                className="flex items-center px-4 py-3 mx-2 rounded-lg hover:bg-slate-700 transition-colors duration-200 group"
                to="/dashboard"
              >
                <div className="flex items-center justify-center w-8 h-8">
                  <MdDashboard className="text-xl text-green-400 group-hover:text-green-300" />
                </div>
                <span 
                  className={`
                    ml-3 font-medium transition-all duration-300
                    ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                  `}
                >
                  Dashboard
                </span>
              </Link>
            )}

            {user?.userType === "admin" && (
              <Link 
                className="flex items-center px-4 py-3 mx-2 rounded-lg hover:bg-slate-700 transition-colors duration-200 group"
                to="/admin-dashboard"
              >
                <div className="flex items-center justify-center w-8 h-8">
                  <MdDashboard className="text-xl text-purple-400 group-hover:text-purple-300" />
                </div>
                <span 
                  className={`
                    ml-3 font-medium transition-all duration-300
                    ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                  `}
                >
                  Admin Dashboard
                </span>
              </Link>
            )}

            {/* Appointments Section */}
            {user?.userType === "manager" && (
              <Link
                className="flex items-center px-4 py-3 mx-2 rounded-lg hover:bg-slate-700 transition-colors duration-200 group"
                to="/bookappointment"
              >
                <div className="flex items-center justify-center w-8 h-8">
                  <BsCalendarPlus className="text-xl text-indigo-400 group-hover:text-indigo-300" />
                </div>
                <span 
                  className={`
                    ml-3 font-medium transition-all duration-300
                    ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                  `}
                >
                  Book Appointments
                </span>
              </Link> 
            )}

            {/* {user?.userType === "manager" && (
              <Link
                className="flex items-center px-4 py-3 mx-2 rounded-lg hover:bg-slate-700 transition-colors duration-200 group"
                to="/appointments"
              >
                <div className="flex items-center justify-center w-8 h-8">
                  <BsCalendarCheck className="text-xl text-teal-400 group-hover:text-teal-300" />
                </div>
                <span 
                  className={`
                    ml-3 font-medium transition-all duration-300
                    ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                  `}
                >
                  Appointments
                </span>
              </Link>
            )} */}
            
            {user?.userType === "manager" && (
              <Link
                className="flex items-center px-4 py-3 mx-2 rounded-lg hover:bg-slate-700 transition-colors duration-200 group"
                to="/testorders"
              >
                <div className="flex items-center justify-center w-8 h-8">
                  <GiMedicines className="text-xl text-emerald-400 group-hover:text-emerald-300" />
                </div>
                <span 
                  className={`
                    ml-3 font-medium transition-all duration-300
                    ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                  `}
                >
                  Test Orders
                </span>
              </Link>
            )}

            {(user?.userType === "manager" || user?.userType === "admin") && (
              <Link
                className="flex items-center px-4 py-3 mx-2 rounded-lg hover:bg-slate-700 transition-colors duration-200 group"
                to="/adddoctor"
              >
                <div className="flex items-center justify-center w-8 h-8">
                  <FaUserMd className="text-xl text-cyan-400 group-hover:text-cyan-300" />
                </div>
                <span 
                  className={`
                    ml-3 font-medium transition-all duration-300
                    ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                  `}
                >
                  Add Doctor
                </span>
              </Link>
            )}

            {user?.userType === "admin" && (
              <Link 
                className="flex items-center px-4 py-3 mx-2 rounded-lg hover:bg-slate-700 transition-colors duration-200 group"
                to="/addManager"
              >
                <div className="flex items-center justify-center w-8 h-8">
                  <FaHospitalUser className="text-xl text-pink-400 group-hover:text-pink-300" />
                </div>
                <span 
                  className={`
                    ml-3 font-medium transition-all duration-300
                    ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                  `}
                >
                  Add Manager
                </span>
              </Link>
            )}

            {user?.userType === "admin" && (
              <Link 
                className="flex items-center px-4 py-3 mx-2 rounded-lg hover:bg-slate-700 transition-colors duration-200 group"
                to="/admin"
              >
                <div className="flex items-center justify-center w-8 h-8">
                  <MdAdminPanelSettings className="text-xl text-orange-400 group-hover:text-orange-300" />
                </div>
                <span 
                  className={`
                    ml-3 font-medium transition-all duration-300
                    ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                  `}
                >
                  Add Admin
                </span>
              </Link>
            )}

            {(user?.userType === "manager" || user?.userType === "admin") && (
              <Link 
                className="flex items-center px-4 py-3 mx-2 rounded-lg hover:bg-slate-700 transition-colors duration-200 group"
                to="/test-management"
              >
                <div className="flex items-center justify-center w-8 h-8">
                  <GiMedicines className="text-xl text-purple-400 group-hover:text-purple-300" />
                </div>
                <span 
                  className={`
                    ml-3 font-medium transition-all duration-300
                    ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                  `}
                >
                  Test Management
                </span>
              </Link>
            )}

            {/* {user?.userType === "admin" && (
              <Link 
                className="flex items-center px-4 py-3 mx-2 rounded-lg hover:bg-slate-700 transition-colors duration-200 group"
                to="/revenue-management"
              >
                <div className="flex items-center justify-center w-8 h-8">
                  <FaDollarSign className="text-xl text-green-400 group-hover:text-green-300" />
                </div>
                <span 
                  className={`
                    ml-3 font-medium transition-all duration-300
                    ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                  `}
                >
                  Revenue Management
                </span>
              </Link>
            )} */}

            {user?.userType === "manager" && (
              <Link
                className="flex items-center px-4 py-3 mx-2 rounded-lg hover:bg-slate-700 transition-colors duration-200 group"
                to="/addagent"
              >
                <div className="flex items-center justify-center w-8 h-8">
                  <FaHandshake className="text-xl text-yellow-400 group-hover:text-yellow-300" />
                </div>
                <span 
                  className={`
                    ml-3 font-medium transition-all duration-300
                    ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                  `}
                >
                  Add Agent
                </span>
              </Link>
            )}

            {(user?.userType === "admin") && (
              <Link
                className="flex items-center px-4 py-3 mx-2 rounded-lg hover:bg-slate-700 transition-colors duration-200 group"
                to="/revenue"
              >
                <div className="flex items-center justify-center w-8 h-8">
                  <FaMoneyBillWave className="text-xl text-green-500 group-hover:text-green-400" />
                </div>
                <span 
                  className={`
                    ml-3 font-medium transition-all duration-300
                    ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                  `}
                >
                  Revenue
                </span>
              </Link>
            )}

            
            {(user?.userType === "manager") && (
              <Link
                className="flex items-center px-4 py-3 mx-2 rounded-lg hover:bg-slate-700 transition-colors duration-200 group"
                to="/statistics"
              >
                <div className="flex items-center justify-center w-8 h-8">
                  <FaMoneyBillWave className="text-xl text-green-500 group-hover:text-green-400" />
                </div>
                <span 
                  className={`
                    ml-3 font-medium transition-all duration-300
                    ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                  `}
                >
                  Statistics
                </span>
              </Link>
            )}
          
          <div className="border-t border-slate-700 pt-4">
            <button
              className="flex items-center px-4 py-3 mx-2 rounded-lg hover:bg-red-600/20 transition-colors duration-200 group text-red-400 w-full text-left"
              onClick={() => {
                dispatch({ type: "AUTH_LOGOUT" });
                window.location.href = "/";
              }}
            >
              <div className="flex items-center justify-center w-8 h-8">
                <BiLogOut className="text-xl group-hover:text-red-300" />
              </div>
              <span 
                className={`
                  ml-3 font-medium transition-all duration-300
                  ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
                `}
              >
                Logout
              </span>
            </button>
          </div>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;