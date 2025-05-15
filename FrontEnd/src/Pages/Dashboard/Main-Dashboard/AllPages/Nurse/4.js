// src/components/Book_Appointment.js
import React, { useState, useEffect } from "react";
import { CommonProblem } from "./MixedObjectData";
import "./CSS/Book_appointment.css";
import { useDispatch } from "react-redux";
import { AddPatients, CreateBooking } from "../../../../../Redux/Datas/action";
import Sidebar from "../../GlobalFiles/Sidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import PatientInfoForm from "./PatientInfoForm";
import RevenueDistribution from "./RevenueDistribution";

const notify = (text) => toast(text);

const Book_Appointment = () => {
  const dispatch = useDispatch();
  const [Loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingBrokers, setLoadingBrokers] = useState(true);

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
    doctorFee: 0 // Added doctor fee field
  };

  const [BookAppoint, setBookAppoint] = useState(InitValue);
  const [totalAmount, setTotalAmount] = useState(0);
  
  // States for revenue distribution
  const [hospitalRevenue, setHospitalRevenue] = useState(0);
  const [doctorRevenue, setDoctorRevenue] = useState(0);
  const [brokerRevenue, setBrokerRevenue] = useState(0);

  // Fetch doctors from the backend API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoadingDoctors(true);
        const response = await axios.get("http://localhost:5000/doctors");
        setDoctors(response.data);
        setLoadingDoctors(false);
      } catch (error) {
        console.error("Error fetching doctors:", error);
        notify("Failed to load doctors. Please try again later.");
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, []);

  // Fetch brokers from the backend API
  useEffect(() => {
    const fetchBrokers = async () => {
      try {
        setLoadingBrokers(true);
        const response = await axios.get("http://localhost:5000/brokers");
        setBrokers(response.data);
        setLoadingBrokers(false);
      } catch (error) {
        console.error("Error fetching brokers:", error);
        notify("Failed to load brokers. Please try again later.");
        setLoadingBrokers(false);
      }
    };

    fetchBrokers();
  }, []);

  // Update doctor fee when doctor changes
  useEffect(() => {
    if (BookAppoint.doctorName) {
      const selectedDoctor = doctors.find(
        d => d.name === BookAppoint.doctorName || d.docName === BookAppoint.doctorName
      );
      
      if (selectedDoctor) {
        setBookAppoint(prev => ({
          ...prev,
          doctorFee: selectedDoctor.consultationFee || 500 // Default fee if not specified
        }));
      }
    } else {
      setBookAppoint(prev => ({
        ...prev,
        doctorFee: 0
      }));
    }
  }, [BookAppoint.doctorName, doctors]);

  // Calculate total and revenue distribution when relevant fields change
  useEffect(() => {
    const total = BookAppoint.doctorFee;
    setTotalAmount(total);

    // Calculate revenue distribution
    calculateRevenueDistribution(total, BookAppoint.doctorName, BookAppoint.brokerName);
  }, [BookAppoint.doctorName, BookAppoint.brokerName, BookAppoint.doctorFee]);

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

  const HandleOnsubmitAppointment = (e) => {
    e.preventDefault();
  
    if (BookAppoint.gender === "") {
      return notify("Please fill all the required fields");
    }

    if (!BookAppoint.doctorName) {
      return notify("Please select a doctor");
    }

    setLoading(true);
    
    // Create payload for API with revenue distribution
    const appointmentData = {
      patientName: BookAppoint.patientName,
      age: BookAppoint.age,
      gender: BookAppoint.gender,
      mobile: BookAppoint.mobile,
      disease: BookAppoint.disease,
      address: BookAppoint.address,
      email: BookAppoint.email,
      totalAmount: totalAmount,
      doctorName: BookAppoint.doctorName,
      brokerName: BookAppoint.brokerName,
      date: BookAppoint.date,
      time: BookAppoint.time,
      doctorFee: BookAppoint.doctorFee,
      hospitalRevenue: hospitalRevenue,
      doctorRevenue: doctorRevenue,
      brokerRevenue: brokerRevenue,
      appointmentType: "consultation" // Mark this as a consultation appointment
    };

    dispatch(AddPatients({
      ...appointmentData,
      patientId: Date.now()
    }))
    .then((res) => {
      const bookingData = {
        ...appointmentData,
        patientID: res.id
      };
      
      dispatch(CreateBooking(bookingData))
        .then(() => {
          notify("Appointment Booked Successfully");
          setLoading(false);
          setBookAppoint(InitValue);
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
            <h1>Book Doctor Appointment</h1>
            <form onSubmit={HandleOnsubmitAppointment}>
              {/* Patient Information Form */}
              <PatientInfoForm 
                formData={BookAppoint} 
                handleChange={HandleAppointment} 
                CommonProblem={CommonProblem}
              />

              {/* DOCTOR FEE DISPLAY */}
              <div>
                <label>Doctor Fee</label>
                <div className="inputdiv">
                  <input
                    type="text"
                    value={`${BookAppoint.doctorFee} Taka`}
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
              <RevenueDistribution
                totalAmount={totalAmount}
                hospitalRevenue={hospitalRevenue}
                doctorRevenue={doctorRevenue}
                brokerRevenue={brokerRevenue}
                hospitalPercentage={BookAppoint.brokerName ? "90%" : "95%"}
                doctorPercentage="5%"
                brokerPercentage="5%"
                showBroker={true}
              />

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
                      disabled={loadingDoctors}
                      required
                    >
                      <option value="">
                        {loadingDoctors ? "Loading doctors..." : "Select Doctor"}
                      </option>
                      {doctors.map((doctor) => (
                        <option key={doctor._id} value={doctor.name || doctor.docName}>
                          {doctor.name || doctor.docName} - {doctor.specialization} 
                          ({doctor.consultationFee || 500} Taka)
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
                      disabled={loadingBrokers}
                    >
                      <option value="">
                        {loadingBrokers ? "Loading brokers..." : "Select Broker"}
                      </option>
                      {brokers.map((broker) => (
                        <option key={broker._id} value={broker.name || broker.docName}>
                          {broker.name || broker.docName}
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
