import React, { useState, useEffect } from "react";
import { CommonProblem, TestsList, DoctorsList, BrokersList } from "./MixedObjectData";
import "./CSS/Book_appointment.css";
import { useDispatch } from "react-redux";
import { AddPatients, CreateBooking } from "../../../../../Redux/Datas/action";
import Sidebar from "../../GlobalFiles/Sidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const notify = (text) => toast(text);

const Book_Appointment = () => {
  const dispatch = useDispatch();
  const [Loading, setLoading] = useState(false);

  const InitValue = {
    patientName: "",
    age: "",
    gender: "",
    mobile: "",
    disease: "",
    address: "",
    email: "",
    doctorName: "",
    brokerName: "",
    date: "",
    time: "",
  };

  const [BookAppoint, setBookAppoint] = useState(InitValue);
  const [selectedTests, setSelectedTests] = useState([{ id: Date.now(), testId: "" }]);
  const [totalAmount, setTotalAmount] = useState(0);
  
  // New states for revenue distribution
  const [hospitalRevenue, setHospitalRevenue] = useState(0);
  const [doctorRevenue, setDoctorRevenue] = useState(0);
  const [brokerRevenue, setBrokerRevenue] = useState(0);

  // Calculate total amount whenever selected tests change
  useEffect(() => {
    const calculateTotal = () => {
      return selectedTests.reduce((sum, test) => {
        const selectedTest = TestsList.find(t => t.id === parseInt(test.testId));
        return sum + (selectedTest && test.testId ? selectedTest.price : 0);
      }, 0);
    };
    
    const total = calculateTotal();
    setTotalAmount(total);

    // Calculate revenue distribution
    calculateRevenueDistribution(total, BookAppoint.doctorName, BookAppoint.brokerName);
  }, [selectedTests, BookAppoint.doctorName, BookAppoint.brokerName]);

  // Function to calculate revenue distribution
  const calculateRevenueDistribution = (amount, doctor, broker) => {
    if (broker) {
      // If broker exists: 90% hospital, 5% doctor, 5% broker
      setHospitalRevenue(amount * 0.9);
      setDoctorRevenue(doctor ? amount * 0.05 : 0);
      setBrokerRevenue(amount * 0.05);
    } else {
      // If no broker: 95% hospital, 5% doctor
      setHospitalRevenue(amount * 0.95);
      setDoctorRevenue(doctor ? amount * 0.05 : 0);
      setBrokerRevenue(0);
    }
  };

  const HandleAppointment = (e) => {
    const { name, value } = e.target;
    setBookAppoint({ ...BookAppoint, [name]: value });
  };

  // Handle test selection
  const handleTestSelect = (id, value) => {
    const updatedTests = selectedTests.map(test => 
      test.id === id ? { ...test, testId: value } : test
    );
    setSelectedTests(updatedTests);
  };

  // Add more test field
  const addMoreTest = () => {
    setSelectedTests([...selectedTests, { id: Date.now(), testId: "" }]);
  };

  // Remove test field
  const removeTest = (id) => {
    if (selectedTests.length > 1) {
      const updatedTests = selectedTests.filter(test => test.id !== id);
      setSelectedTests(updatedTests);
    } else {
      notify("At least one test is required");
    }
  };

  const HandleOnsubmitAppointment = (e) => {
    e.preventDefault();
  
    if (BookAppoint.gender === "") {
      return notify("Please fill all the required fields");
    }

    // Check if at least one test is selected
    const hasSelectedTest = selectedTests.some(test => test.testId !== "");
    if (!hasSelectedTest) {
      return notify("Please select at least one test");
    }

    // Create tests array with name and price for each selected test
    const testsWithPrices = selectedTests
      .filter(test => test.testId !== "") // Filter out empty selections
      .map(test => {
        const selectedTest = TestsList.find(t => t.id === parseInt(test.testId));
        return {
          testName: selectedTest.title,
          testPrice: selectedTest.price
        };
      });

    setLoading(true);
    
    // Create payload for API with revenue distribution
    const patientData = {
      patientName: BookAppoint.patientName,
      age: BookAppoint.age,
      gender: BookAppoint.gender,
      mobile: BookAppoint.mobile,
      disease: BookAppoint.disease,
      address: BookAppoint.address,
      email: BookAppoint.email,
      tests: testsWithPrices,
      totalAmount: totalAmount,
      doctorName: BookAppoint.doctorName,
      brokerName: BookAppoint.brokerName,
      date: BookAppoint.date,
      time: BookAppoint.time,
      hospitalRevenue: hospitalRevenue,
      doctorRevenue: doctorRevenue,
      brokerRevenue: brokerRevenue
    };

    dispatch(AddPatients({
      ...patientData,
      patientId: Date.now()  // This will be used by the backend
    }))
    .then((res) => {
      // Make sure to use the same field name "patientID" as required by the backend
      const bookingData = {
        ...patientData,
        patientID: res.id,  // Using patientID instead of patientId to match backend schema
      };
      
      dispatch(CreateBooking(bookingData))
        .then(() => {
          notify("Appointment Booked Successfully");
          setLoading(false);
          setBookAppoint(InitValue);
          setSelectedTests([{ id: Date.now(), testId: "" }]); // Reset selected tests
        })
        .catch((err) => {
          notify("Error creating booking: " + (err.message || "Unknown error"));
          setLoading(false);
        });
    })
    .catch((err) => {
      notify("Error adding patient: " + (err.message || "Unknown error"));
      setLoading(false);
    });
  };  

  return (
    <>
      <ToastContainer />
      <div className="container">
        <Sidebar />
        <div className="AfterSideBar">
          <div className="Main_Add_Doctor_div">
            <h1>Book Appointment</h1>
            <form onSubmit={HandleOnsubmitAppointment}>
              {/* Name PlaceHolder */}
              <div>
                <label>Patient Name</label>
                <div className="inputdiv">
                  <input
                    type="text"
                    placeholder="First Name"
                    name="patientName"
                    value={BookAppoint.patientName}
                    onChange={HandleAppointment}
                    required
                  />
                </div>
              </div>
              {/* AGE PLACEHOLDER  */}
              <div>
                <label>Age</label>
                <div className="inputdiv">
                  <input
                    type="number"
                    placeholder="Age"
                    name="age"
                    value={BookAppoint.age}
                    onChange={HandleAppointment}
                    required
                  />
                </div>
              </div>
              {/* GENDER PLACEHOLDER  */}
              <div>
                <label>Gender</label>
                <div className="inputdiv">
                  <select
                    name="gender"
                    value={BookAppoint.gender}
                    onChange={HandleAppointment}
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              {/* MOBILE PLACEHOLDER */}
              <div>
                <label>Contact Number</label>
                <div className="inputdiv">
                  <input
                    type="number"
                    placeholder="Number"
                    name="mobile"
                    value={BookAppoint.mobile}
                    onChange={HandleAppointment}
                    required
                  />
                </div>
              </div>
              <div>
                <label>Email</label>
                <div className="inputdiv">
                  <input
                    type="email"
                    placeholder="example@email.com"
                    name="email"
                    value={BookAppoint.email}
                    onChange={HandleAppointment}
                    required
                  />
                </div>
              </div>
              {/* PROBLEM PLACEHOLDER */}
              <div>
                <label>Type of Disease</label>
                <div className="inputdiv">
                  <select
                    name="disease"
                    value={BookAppoint.disease}
                    onChange={(e) => {
                      HandleAppointment(e);
                    }}
                    required
                  >
                    <option value="">Select Disease</option>
                    {CommonProblem.map((ele, i) => {
                      return (
                        <option key={i} value={ele.title}>
                          {ele.title}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* ADDRESS SECTION  */}
              <div>
                <label>Address</label>
                <div className="inputdiv">
                  <input
                    type="text"
                    placeholder="Address line 1"
                    name="address"
                    value={BookAppoint.address}
                    onChange={HandleAppointment}
                    required
                  />
                </div>
              </div>

              {/* TESTS SECTION - DROPDOWN WITH ADD MORE BUTTON */}
              <div>
                <label>Select Tests</label>
                <div style={{ marginBottom: "15px" }}>
                  {selectedTests.map((test, index) => (
                    <div key={test.id} style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      marginBottom: "10px" 
                    }}>
                      <div className="inputdiv" style={{ flex: 1, marginRight: "10px" }}>
                        <select
                          value={test.testId}
                          onChange={(e) => handleTestSelect(test.id, e.target.value)}
                          required
                          style={{ width: "100%" }}
                        >
                          <option value="">Select Test</option>
                          {TestsList.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.title} - {t.price} Taka
                            </option>
                          ))}
                        </select>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeTest(test.id)}
                        style={{
                          padding: "5px 10px",
                          backgroundColor: "#ff6b6b",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer"
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button 
                    type="button" 
                    onClick={addMoreTest}
                    style={{
                      padding: "8px 15px",
                      backgroundColor: "#4CAF50",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      marginTop: "5px"
                    }}
                  >
                    + Add More Test
                  </button>
                </div>
              </div>

              {/* DISPLAY TOTAL AMOUNT */}
              <div>
                <label>Total Amount</label>
                <div className="inputdiv">
                  <input
                    type="text"
                    value={`${totalAmount} Taka`}
                    readOnly
                    style={{ 
                      backgroundColor: "#f9f9f9", 
                      fontWeight: "bold",
                      fontSize: "16px",
                      color: "#2c3e50",
                      textAlign: "right",
                      padding: "10px"
                    }}
                  />
                </div>
              </div>

              {/* REVENUE DISTRIBUTION PREVIEW */}
              <div>
                <label>Revenue Distribution</label>
                <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                  <div style={{ flex: 1, backgroundColor: "#f0f9ff", padding: "10px", borderRadius: "4px", textAlign: "center" }}>
                    <div style={{ fontWeight: "bold", fontSize: "14px", color: "#3498db" }}>Hospital</div>
                    <div style={{ fontSize: "16px" }}>{hospitalRevenue.toFixed(0)} Taka</div>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      {BookAppoint.brokerName ? "90%" : "95%"}
                    </div>
                  </div>
                  
                  <div style={{ flex: 1, backgroundColor: "#f0fff9", padding: "10px", borderRadius: "4px", textAlign: "center" }}>
                    <div style={{ fontWeight: "bold", fontSize: "14px", color: "#2ecc71" }}>Doctor</div>
                    <div style={{ fontSize: "16px" }}>{doctorRevenue.toFixed(0)} Taka</div>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      {BookAppoint.doctorName ? "5%" : "0%"}
                    </div>
                  </div>
                  
                  <div style={{ flex: 1, backgroundColor: "#fff9f0", padding: "10px", borderRadius: "4px", textAlign: "center" }}>
                    <div style={{ fontWeight: "bold", fontSize: "14px", color: "#e67e22" }}>Broker</div>
                    <div style={{ fontSize: "16px" }}>{brokerRevenue.toFixed(0)} Taka</div>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      {BookAppoint.brokerName ? "5%" : "0%"}
                    </div>
                  </div>
                </div>
              </div>

              {/* DOCTOR AND BROKER SECTION */}
              <div style={{ display: "flex", gap: "20px" }}>
                {/* DOCTOR NAME SECTION */}
                <div style={{ flex: 1 }}>
                  <label>Doctor Name</label>
                  <div className="inputdiv">
                    <select
                      name="doctorName"
                      value={BookAppoint.doctorName}
                      onChange={HandleAppointment}
                      style={{ width: "100%", padding: "10px" }}
                    >
                      <option value="">Select Doctor</option>
                      {DoctorsList.map((doctor) => (
                        <option key={doctor.id} value={doctor.name}>
                          {doctor.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* BROKER NAME SECTION */}
                <div style={{ flex: 1 }}>
                  <label>Broker Name (Optional)</label>
                  <div className="inputdiv">
                    <select
                      name="brokerName"
                      value={BookAppoint.brokerName}
                      onChange={HandleAppointment}
                      style={{ width: "100%", padding: "10px" }}
                    >
                      <option value="">Select Broker</option>
                      {BrokersList.map((broker) => (
                        <option key={broker.id} value={broker.name}>
                          {broker.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* APPOINTMENT DATE  */}
              <div className="dateofAppointment">
                <p>Date and Time </p>
                <div className="inputdiv">
                  <input
                    type={"date"}
                    placeholder="Choose Date"
                    name="date"
                    value={BookAppoint.date}
                    onChange={HandleAppointment}
                    required
                  />
                  <input
                    type={"time"}
                    placeholder="Choose Time"
                    name="time"
                    value={BookAppoint.time}
                    onChange={HandleAppointment}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="book_formsubmitbutton">
                {Loading ? "Loading..." : "Book Appointment"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Book_Appointment;