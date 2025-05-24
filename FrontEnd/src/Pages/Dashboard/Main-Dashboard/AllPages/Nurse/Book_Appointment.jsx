import React, { useState, useEffect } from "react";
import { CommonProblem, TestsList } from "./MixedObjectData";
import "./CSS/Book_appointment.css";
import { useDispatch } from "react-redux";
import { AddPatients, CreateBooking } from "../../../../../Redux/Datas/action";
import Sidebar from "../../GlobalFiles/Sidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const notify = (text) => toast(text);

const Book_Appointment = () => {
  const dispatch = useDispatch();
  const [Loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingBrokers, setLoadingBrokers] = useState(true);
  const [bookedAppointments, setBookedAppointments] = useState([]); // Store existing appointments
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

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
    doctorFee: 0
  };

  const [BookAppoint, setBookAppoint] = useState(InitValue);
  const [selectedTests, setSelectedTests] = useState([{ id: Date.now(), testId: "" }]);
  const [totalAmount, setTotalAmount] = useState(0);
  
  // States for revenue distribution
  const [hospitalRevenue, setHospitalRevenue] = useState(0);
  const [doctorRevenue, setDoctorRevenue] = useState(0);
  const [brokerRevenue, setBrokerRevenue] = useState(0);

  // Generate time slots from 9 AM to 6 PM with 15-minute intervals
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        if (hour === 18 && minute > 0) break; // Stop at 6:00 PM
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  // Fetch existing appointments for selected doctor and date
  const fetchBookedAppointments = async (doctorName, date) => {
    if (!doctorName || !date) return;
    
    try {
      const response = await axios.get(`http://localhost:5000/appointments?doctor=${doctorName}&date=${date}`);
      setBookedAppointments(response.data);
    } catch (error) {
      console.error("Error fetching booked appointments:", error);
      setBookedAppointments([]);
    }
  };

  // Filter available time slots based on booked appointments
  useEffect(() => {
    const allSlots = generateTimeSlots();
    const bookedTimes = bookedAppointments.map(appointment => appointment.time);
    
    // Filter out booked times and times within 15 minutes of booked appointments
    const available = allSlots.filter(slot => {
      const slotTime = new Date(`2000-01-01T${slot}:00`);
      
      return !bookedTimes.some(bookedTime => {
        const bookedDateTime = new Date(`2000-01-01T${bookedTime}:00`);
        const timeDifference = Math.abs(slotTime - bookedDateTime) / (1000 * 60); // Difference in minutes
        return timeDifference < 15; // Block if within 15 minutes
      });
    });
    
    setAvailableTimeSlots(available);
  }, [bookedAppointments]);

  // Fetch appointments when doctor or date changes
  useEffect(() => {
    if (BookAppoint.doctorName && BookAppoint.date) {
      fetchBookedAppointments(BookAppoint.doctorName, BookAppoint.date);
    }
  }, [BookAppoint.doctorName, BookAppoint.date]);

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

  useEffect(() => {
    if (BookAppoint.doctorName) {
      const selectedDoctor = doctors.find(
        d => d.name === BookAppoint.doctorName || d.docName === BookAppoint.doctorName
      );
      
      if (selectedDoctor) {
        const fee = selectedDoctor.consultationFee || 500;
        
        setBookAppoint(prev => ({
          ...prev,
          doctorFee: fee
        }));
        
        const doctorFeeTest = {
          id: Date.now(),
          testId: "doctor-fee",
          customName: "Doctor Fee",
          customPrice: fee
        };
        
        setSelectedTests([doctorFeeTest]);
      }
    }
  }, [BookAppoint.doctorName, doctors]);

  // Calculate total amount whenever selected tests change
  useEffect(() => {
    let total = 0;
    
    if (selectedTests.some(test => test.testId === "doctor-fee")) {
      total += BookAppoint.doctorFee;
    }
    setTotalAmount(total);

    calculateRevenueDistribution(total, BookAppoint.doctorName, BookAppoint.brokerName);
  }, [selectedTests, BookAppoint.doctorName, BookAppoint.brokerName, BookAppoint.doctorFee]);

  // Function to calculate revenue distribution
  const calculateRevenueDistribution = (amount, doctor, broker) => {
    if (broker) {
      setHospitalRevenue(amount * 0.05);
      setDoctorRevenue(doctor ? amount * 0.9 : 0);
      setBrokerRevenue(amount * 0.05);
    } else {
      setHospitalRevenue(amount * 0.05);
      setDoctorRevenue(doctor ? amount * 0.95 : 0);
      setBrokerRevenue(0);
    }
  };

  const HandleAppointment = (e) => {
    const { name, value } = e.target;
    setBookAppoint({ ...BookAppoint, [name]: value });
    
    // Reset time when doctor or date changes
    if (name === 'doctorName' || name === 'date') {
      setBookAppoint(prev => ({ ...prev, time: "" }));
    }
  };

  const HandleOnsubmitAppointment = (e) => {
    e.preventDefault();
  
    if (BookAppoint.gender === "") {
      return notify("Please fill all the required fields");
    }

    if (!BookAppoint.time) {
      return notify("Please select an appointment time");
    }

    const hasSelectedTest = selectedTests.some(test => test.testId !== "");
    if (!hasSelectedTest) {
      return notify("Please select at least one test");
    }

    const testsWithPrices = selectedTests
      .filter(test => test.testId !== "")
      .map(test => {
        if (test.testId === "doctor-fee") {
          return {
            testName: "Doctor Fee",
            testPrice: BookAppoint.doctorFee
          };
        }
      });

    setLoading(true);
    
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
      patientId: Date.now()
    }))
    .then((res) => {
      const bookingData = {
        ...patientData,
        patientID: res.id,
      };
      
      dispatch(CreateBooking(bookingData))
        .then(() => {
          notify("Appointment Booked Successfully");
          setLoading(false);
          setBookAppoint(InitValue);
          setSelectedTests([{ id: Date.now(), testId: "" }]);
          // Refresh available time slots
          fetchBookedAppointments(BookAppoint.doctorName, BookAppoint.date);
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
          {/* <div className="Main_Add_Doctor_div enhanced-form"> */}
            <div className="form-header">
              <h1>Book Appointment</h1>
              <p>Schedule a new patient appointment</p>
            </div>
            
            <form onSubmit={HandleOnsubmitAppointment} className="appointment-form">
              {/* Patient Information Section */}
              <div className="form-section">
                <h3 className="section-title">Patient Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Patient Name *</label>
                    <input
                      type="text"
                      placeholder="Enter patient's full name"
                      name="patientName"
                      value={BookAppoint.patientName}
                      onChange={HandleAppointment}
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Age *</label>
                    <input
                      type="number"
                      placeholder="Enter age"
                      name="age"
                      value={BookAppoint.age}
                      onChange={HandleAppointment}
                      required
                      className="form-input"
                      min="0"
                      max="150"
                    />
                  </div>

                  <div className="form-group">
                    <label>Gender *</label>
                    <select
                      name="gender"
                      value={BookAppoint.gender}
                      onChange={HandleAppointment}
                      required
                      className="form-select"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Contact Number *</label>
                    <input
                      type="tel"
                      placeholder="Enter phone number"
                      name="mobile"
                      value={BookAppoint.mobile}
                      onChange={HandleAppointment}
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Email *</label>
                    <input
                      type="email"
                      placeholder="Enter email address"
                      name="email"
                      value={BookAppoint.email}
                      onChange={HandleAppointment}
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Address *</label>
                    <input
                      type="text"
                      placeholder="Enter complete address"
                      name="address"
                      value={BookAppoint.address}
                      onChange={HandleAppointment}
                      required
                      className="form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Medical Information Section */}
              <div className="form-section">
                <h3 className="section-title">Medical Information</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Type of Disease *</label>
                    <select
                      name="disease"
                      value={BookAppoint.disease}
                      onChange={HandleAppointment}
                      required
                      className="form-select"
                    >
                      <option value="">Select Disease</option>
                      {CommonProblem.map((ele, i) => (
                        <option key={i} value={ele.title}>
                          {ele.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Doctor and Broker Section */}
              <div className="form-section">
                <h3 className="section-title">Assignment</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Doctor Name *</label>
                    <select
                      name="doctorName"
                      value={BookAppoint.doctorName}
                      onChange={HandleAppointment}
                      className="form-select"
                      disabled={loadingDoctors}
                      required
                    >
                      <option value="">
                        {loadingDoctors ? "Loading doctors..." : "Select Doctor"}
                      </option>
                      {doctors.map((doctor) => (
                        <option key={doctor._id} value={doctor.name || doctor.docName}>
                          {doctor.name || doctor.docName} - {doctor.specialization}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Broker Name (Optional)</label>
                    <select
                      name="brokerName"
                      value={BookAppoint.brokerName}
                      onChange={HandleAppointment}
                      className="form-select"
                      disabled={loadingBrokers}
                    >
                      <option value="">
                        {loadingBrokers ? "Loading brokers..." : "Select Broker (Optional)"}
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

              {/* Appointment Schedule Section */}
              <div className="form-section">
                <h3 className="section-title">Appointment Schedule</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Date *</label>
                    <input
                      type="date"
                      name="date"
                      value={BookAppoint.date}
                      onChange={HandleAppointment}
                      required
                      className="form-input"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div className="form-group">
                    <label>Time *</label>
                    <select
                      name="time"
                      value={BookAppoint.time}
                      onChange={HandleAppointment}
                      required
                      className="form-select"
                      disabled={!BookAppoint.doctorName || !BookAppoint.date}
                    >
                      <option value="">
                        {!BookAppoint.doctorName || !BookAppoint.date 
                          ? "Select doctor and date first" 
                          : "Select available time"
                        }
                      </option>
                      {availableTimeSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                    {BookAppoint.doctorName && BookAppoint.date && availableTimeSlots.length === 0 && (
                      <small className="help-text error">No available time slots for this date</small>
                    )}
                  </div>
                </div>
              </div>

              {/* Fee Information Section */}
              <div className="form-section">
                <h3 className="section-title">Fee Information</h3>
                
                {/* Doctor Fee Display */}
                {BookAppoint.doctorFee > 0 && (
                  <div className="fee-display">
                    <div className="fee-item">
                      <span>Doctor Consultation Fee:</span>
                      <span className="fee-amount">{BookAppoint.doctorFee} Taka</span>
                    </div>
                  </div>
                )}

                {/* Total Amount */}
                <div className="total-amount">
                  <span>Total Amount:</span>
                  <span className="total-value">{totalAmount} Taka</span>
                </div>
              </div>
                {/* Revenue Distribution */}
                {(
                  <div className="form-section">
                    <h3 className="section-title">Revenue Distribution</h3>
                    {/* <h4>Revenue Distribution</h4> */}
                    <div className="revenue-cards">
                      <div className="revenue-card hospital">
                        <div className="revenue-label">Hospital</div>
                        <div className="revenue-amount">{hospitalRevenue.toFixed(0)} Taka</div>
                        <div className="revenue-percentage">
                          {BookAppoint.brokerName ? "90%" : "95%"}
                        </div>
                      </div>
                      
                      <div className="revenue-card doctor">
                        <div className="revenue-label">Doctor</div>
                        <div className="revenue-amount">{doctorRevenue.toFixed(0)} Taka</div>
                        <div className="revenue-percentage">
                          {BookAppoint.doctorName ? "5%" : "0%"}
                        </div>
                      </div>
                      
                      <div className="revenue-card broker">
                        <div className="revenue-label">Broker</div>
                        <div className="revenue-amount">{brokerRevenue.toFixed(0)} Taka</div>
                        <div className="revenue-percentage">
                          {BookAppoint.brokerName ? "5%" : "0%"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={Loading}
                >
                  {Loading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Booking...
                    </>
                  ) : (
                    "Book Appointment"
                  )}
                </button>
              </div>
            </form>
          {/* </div> */}
        </div>
      </div>
    </>
  );
};

export default Book_Appointment;