import React, { useState } from "react";
import "./CSS/Add_Broker.css";
import brokerAvatar from "../../../../../img/banner.png";
import Sidebar from "../../GlobalFiles/Sidebar";
import axios from "axios";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const notify = (text) => toast(text);

const AddBroker = () => {
  const [loading, setLoading] = useState(false);

  const initData = {
    name: "",
    age: "",
    mobile: "",
    email: "",
    gender: "",
    address: "",
    brokerID: Date.now(),
    password: "password123", // Default password
    commissionRate: 5,
    status: "active",
    notes: "",
  };
  const [BrokerValue, setBrokerValue] = useState(initData);

  const HandleBrokerChange = (e) => {
    setBrokerValue({ ...BrokerValue, [e.target.name]: e.target.value });
  };

  const HandleBrokerSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post("http://localhost:5000/brokers/register", BrokerValue);
      
      if (response.data.message === "Broker already exists") {
        notify("Broker Already Exists");
      } else {
        notify("Broker Added Successfully");
        console.log("BROKER REGISTERED:", response.data);
        // Reset form after successful submission
        setBrokerValue(initData);
      }
    } catch (error) {
      console.error("Error adding broker:", error);
      notify("Something went wrong, Please try Again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="container">
        <Sidebar />
        <div className="AfterSideBar">
          <div className="Main_Add_Broker_div">
            <h1>Add Broker</h1>
            <img src={brokerAvatar} alt="broker" className="avatarimg" />
            <form onSubmit={HandleBrokerSubmit}>
              <div>
                <label>Broker Name</label>
                <div className="inputdiv">
                  <input
                    type="text"
                    placeholder="Full Name"
                    name="name"
                    value={BrokerValue.name}
                    onChange={HandleBrokerChange}
                    required
                  />
                </div>
              </div>
              <div>
                <label>Age</label>
                <div className="inputdiv">
                  <input
                    type="number"
                    placeholder="Age"
                    name="age"
                    value={BrokerValue.age}
                    onChange={HandleBrokerChange}
                    required
                  />
                </div>
              </div>
              <div>
                <label>Contact Number</label>
                <div className="inputdiv">
                  <input
                    type="number"
                    placeholder="Mobile Number"
                    name="mobile"
                    value={BrokerValue.mobile}
                    onChange={HandleBrokerChange}
                    required
                  />
                </div>
              </div>
              <div>
                <label>Email</label>
                <div className="inputdiv">
                  <input
                    type="email"
                    placeholder="abc@abc.com"
                    name="email"
                    value={BrokerValue.email}
                    onChange={HandleBrokerChange}
                    required
                  />
                </div>
              </div>
              <div>
                <label>Gender</label>
                <div className="inputdiv">
                  <select
                    name="gender"
                    value={BrokerValue.gender}
                    onChange={HandleBrokerChange}
                    required
                  >
                    <option value="">Choose Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
              </div>
              <div>
                <label>Address</label>
                <div className="inputdiv adressdiv">
                  <input
                    type="text"
                    placeholder="Address"
                    name="address"
                    value={BrokerValue.address}
                    onChange={HandleBrokerChange}
                    required
                  />
                </div>
              </div>
              <div>
                <label>Commission Rate (%)</label>
                <div className="inputdiv">
                  <input
                    type="number"
                    placeholder="Commission Rate"
                    name="commissionRate"
                    value={BrokerValue.commissionRate}
                    onChange={HandleBrokerChange}
                    required
                  />
                </div>
              </div>
              <div>
                <label>Status</label>
                <div className="inputdiv">
                  <select
                    name="status"
                    value={BrokerValue.status}
                    onChange={HandleBrokerChange}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label>Password</label>
                <div className="inputdiv">
                  <input
                    type="text"
                    placeholder="Password"
                    name="password"
                    value={BrokerValue.password}
                    onChange={HandleBrokerChange}
                    required
                  />
                </div>
              </div>
              <div>
                <label>Notes</label>
                <div className="inputdiv">
                  <textarea
                    type="text"
                    placeholder="Additional Notes"
                    rows="4"
                    cols="50"
                    name="notes"
                    value={BrokerValue.notes}
                    onChange={HandleBrokerChange}
                  />
                </div>
              </div>
              <button type="submit" className="formsubmitbutton">
                {loading ? "Loading..." : "Submit"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddBroker;