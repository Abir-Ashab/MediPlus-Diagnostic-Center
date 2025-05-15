import React, { useState, useEffect } from "react";
import { CommonProblem, TestsList } from "./MixedObjectData";
import "./CSS/Book_appointment.css";
import { useDispatch } from "react-redux";
import { AddPatients } from "../../../../../Redux/Datas/action";
import Sidebar from "../../GlobalFiles/Sidebar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import PatientInfoForm from "./PatientInfoForm";
import TestSelection from "./TestSelection";
import RevenueDistribution from "./RevenueDistribution";

const notify = (text) => toast(text);

const Test_Order = () => {
  const dispatch = useDispatch();
  const [Loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  const InitValue = {
    patientName: "",
    age: "",
    gender: "",
    mobile: "",
    disease: "",
    address: "",
    email: "",
    doctorName: "",
    date: "",
    time: "",
  };

  const [TestOrder, setTestOrder] = useState(InitValue);
  const [selectedTests, setSelectedTests] = useState([{ id: Date.now(), testId: "" }]);
  const [totalAmount, setTotalAmount] = useState(0);
  
  // States for revenue distribution
  const [hospitalRevenue, setHospitalRevenue] = useState(0);
  const [doctorRevenue, setDoctorRevenue] = useState(0);

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
    calculateRevenueDistribution(total, TestOrder.doctorName);
  }, [selectedTests, TestOrder.doctorName]);

  // Function to calculate revenue distribution for tests
  const calculateRevenueDistribution = (amount, doctor) => {
    // For tests: 95% hospital, 5% doctor, no broker
    setHospitalRevenue(amount * 0.95);
    setDoctorRevenue(doctor ? amount * 0.05 : 0);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTestOrder({ ...TestOrder, [name]: value });
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

  const HandleOnsubmitTestOrder = async (e) => {
    e.preventDefault();
  
    if (TestOrder.gender === "") {
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
    
    try {
      // Create patient first
      const patientData = {
        patientName: TestOrder.patientName,
        age: TestOrder.age,
        gender: TestOrder.gender,
        mobile: TestOrder.mobile,
        disease: TestOrder.disease,
        address: TestOrder.address,
        email: TestOrder.email,
        patientId: Date.now()
      };
      
      // Add patient using existing Redux action
      const patientResponse = await dispatch(AddPatients(patientData));
      
      // Create test order directly with API instead of Redux
      const testOrderData = {
        patientName: TestOrder.patientName,
        age: TestOrder.age,
        gender: TestOrder.gender,
        mobile: TestOrder.mobile,
        disease: TestOrder.disease,
        address: TestOrder.address,
        email: TestOrder.email,
        tests: testsWithPrices,
        totalAmount: totalAmount,
        doctorName: TestOrder.doctorName,
        date: TestOrder.date,
        time: TestOrder.time,
        hospitalRevenue: hospitalRevenue,
        doctorRevenue: doctorRevenue,
        orderType: "test", // Mark this as a test order
        patientID: patientResponse.id
      };
      
      // Direct API call instead of using Redux
      const response = await axios.post("http://localhost:5000/testorders", testOrderData);
      
      notify("Test Order Created Successfully");
      setLoading(false);
      setTestOrder(InitValue);
      setSelectedTests([{ id: Date.now(), testId: "" }]); // Reset selected tests
      
    } catch (error) {
      notify("Error: " + (error.response?.data?.message || error.message || "Unknown error"));
      console.error("Error creating test order:", error);
      setLoading(false);
    }
  };  

  return (
    <>
      <ToastContainer />
      <div className="container">
        <Sidebar />
        <div className="AfterSideBar">
          <div className="Main_Add_Doctor_div">
            <h1>Create Test Order</h1>
            <form onSubmit={HandleOnsubmitTestOrder}>
              {/* Patient Information Form */}
              <PatientInfoForm 
                formData={TestOrder} 
                handleChange={handleChange} 
                CommonProblem={CommonProblem}
              />

              {/* TESTS SECTION */}
              <TestSelection
                selectedTests={selectedTests}
                handleTestSelect={handleTestSelect}
                addMoreTest={addMoreTest}
                removeTest={removeTest}
                TestsList={TestsList}
              />

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
                hospitalPercentage="95%"
                doctorPercentage="5%"
                showBroker={false}
              />

              {/* DOCTOR SECTION */}
              <div>
                <label>Referring Doctor (Optional)</label>
                <div className="inputdiv">
                  <select
                    name="doctorName"
                    value={TestOrder.doctorName}
                    onChange={handleChange}
                    style={{ width: "100%", padding: "10px" }}
                    disabled={loadingDoctors}
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
              </div>

              {/* TEST ORDER DATE  */}
              <div className="dateofAppointment">
                <p>Date and Time for Test Collection</p>
                <div className="inputdiv">
                  <input
                    type={"date"}
                    placeholder="Choose Date"
                    name="date"
                    value={TestOrder.date}
                    onChange={handleChange}
                    required
                  />
                  <input
                    type={"time"}
                    placeholder="Choose Time"
                    name="time"
                    value={TestOrder.time}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="book_formsubmitbutton">
                {Loading ? "Loading..." : "Create Test Order"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Test_Order;